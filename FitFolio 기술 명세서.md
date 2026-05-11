# FitFolio 기술 명세서

## 1. DB 스키마 (Drizzle ORM)

### 1.1 users 테이블
```typescript
// drizzle/schema.ts
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

**용도:** Manus OAuth 사용자 정보 저장

---

### 1.2 analyses 테이블
```typescript
// drizzle/schema.ts
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),                    // nullable — 비로그인 사용자도 분석 가능
  portfolioKey: varchar("portfolioKey", { length: 512 }),  // S3 저장 경로
  portfolioText: text("portfolioText"),      // 추출된 포트폴리오 텍스트 (20KB 제한)
  jdText: text("jdText").notNull(),          // 채용공고 텍스트
  status: mysqlEnum("status", ["pending", "processing", "done", "error"])
    .default("pending")
    .notNull(),
  result: text("result"),                    // JSON string — AnalysisResult
  errorMessage: text("errorMessage"),        // 분석 실패 시 에러 메시지
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;
```

**용도:** 포트폴리오-JD 분석 결과 저장 (polling 방식)

**상태 흐름:**
- `pending` → `processing` (LLM 분석 중) → `done` (완료) 또는 `error`

---

## 2. tRPC 라우터 구조

### 2.1 라우터 계층도
```
appRouter
├── auth
│   ├── me (query) — 현재 사용자 정보
│   └── logout (mutation) — 로그아웃
├── analysis
│   ├── start (mutation) — 분석 시작
│   └── getResult (query) — 결과 조회 (polling)
└── system
    └── notifyOwner (mutation) — 소유자 알림
```

---

### 2.2 analysis.start (mutation)

**엔드포인트:** `trpc.analysis.start.useMutation()`

**입력 타입:**
```typescript
{
  pdfBase64?: string;           // PDF 파일 base64 인코딩 (선택)
  portfolioText?: string;       // 포트폴리오 직접 입력 (선택)
  jdText: string;               // 채용공고 텍스트 (필수, 50자 이상)
}
```

**출력 타입:**
```typescript
{
  analysisId: number;           // 분석 ID (Report 페이지에서 사용)
}
```

**동작:**
1. PDF base64 또는 portfolioText 중 하나 필수
2. PDF인 경우:
   - S3에 원본 PDF 저장 (portfolioKey 생성)
   - pdf-parse로 텍스트 추출
3. 추출된 텍스트 20KB 제한
4. DB에 `analyses` 레코드 생성 (status: "processing")
5. **비동기로** LLM 분석 실행 (runAnalysis)
6. 분석 완료 후 DB 업데이트 (status: "done", result JSON 저장)
7. 즉시 analysisId 반환 (프론트엔드가 polling 시작)

**권한:** publicProcedure (비로그인 사용자 가능)

---

### 2.3 analysis.getResult (query)

**엔드포인트:** `trpc.analysis.getResult.useQuery({analysisId})`

**입력 타입:**
```typescript
{
  analysisId: number;
}
```

**출력 타입 (상태별):**

**처리 중:**
```typescript
{
  status: "pending" | "processing";
}
```

**완료:**
```typescript
{
  status: "done";
  result: AnalysisResult;
  createdAt: Date;
}
```

**실패:**
```typescript
{
  status: "error";
  errorMessage: string;
}
```

**동작:**
- DB에서 analysisId로 레코드 조회
- status에 따라 다른 응답 반환
- 프론트엔드에서 refetchInterval: 2000 (2초마다 polling)

**권한:** publicProcedure

---

## 3. 핵심 비즈니스 로직

### 3.1 PDF 파싱 (server/analysis.ts)

```typescript
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse는 CommonJS 모듈이므로 createRequire 사용
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  
  const data = await pdfParse(buffer);
  return data.text.trim();
}
```

**특징:**
- CommonJS 모듈 호환성 처리 (pdf-parse@2.4.5)
- 텍스트만 추출 (이미지, 테이블 레이아웃 손실)
- 에러 처리: 파싱 실패 시 "PDF 파싱 실패" 메시지 반환

---

### 3.2 LLM 분석 (server/analysis.ts)

#### 타입 정의
```typescript
export interface SkillAnalysis {
  skill: string;
  type: "required" | "preferred";
  score: number;                // 0~100
  evidence: string;             // 포트폴리오에서 근거
  gap: string | null;           // 부족한 부분
}

export interface Strength {
  title: string;
  detail: string;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  skill: string;
  action: string;               // 실행 가능한 액션
  reason: string;
}

export interface AnalysisResult {
  overall_score: number;        // 0~100 종합 점수
  overall_summary: string;      // 2~3문장 요약
  jd_required_skills: string[]; // JD에서 추출한 필수 역량
  jd_preferred_skills: string[]; // JD에서 추출한 우대 역량
  skill_analysis: SkillAnalysis[];
  strengths: Strength[];
  recommendations: Recommendation[];
  fit_verdict: "strong_fit" | "potential_fit" | "weak_fit";
}
```

#### LLM 프롬프트 구조

**시스템 프롬프트:**
```
You are a senior product designer with 10+ years of experience and an experienced design hiring manager. 
You evaluate designer portfolios against job descriptions with precision and honesty.

Your evaluation must be:
- Evidence-based: every score must reference specific content from the portfolio
- JD-driven: extract required/preferred skills directly from the JD, do not use a fixed rubric
- Actionable: every gap must come with a concrete improvement suggestion
- Calibrated: scores above 85 should be rare; most strong portfolios score 65–80
- Language: respond in Korean (한국어로 응답)

Output ONLY valid JSON matching the provided schema. No explanation outside the JSON.
```

**사용자 프롬프트 템플릿:**
```
아래 포트폴리오를 채용공고와 비교해 분석해주세요.

---채용공고---
{jdText}

---포트폴리오---
{portfolioText.slice(0, 12000)}
```

#### JSON Schema (Structured Output)
```typescript
{
  type: "json_schema",
  json_schema: {
    name: "analysis_result",
    strict: true,
    schema: {
      type: "object",
      properties: {
        overall_score: { type: "integer", description: "0~100 종합 적합도 점수" },
        overall_summary: { type: "string", description: "2~3문장 종합 평가" },
        jd_required_skills: {
          type: "array",
          items: { type: "string" },
          description: "JD에서 추출한 필수 역량 목록"
        },
        jd_preferred_skills: {
          type: "array",
          items: { type: "string" },
          description: "JD에서 추출한 우대 역량 목록"
        },
        skill_analysis: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill: { type: "string" },
              type: { type: "string", enum: ["required", "preferred"] },
              score: { type: "integer" },
              evidence: { type: "string" },
              gap: { type: ["string", "null"] }
            },
            required: ["skill", "type", "score", "evidence", "gap"],
            additionalProperties: false
          }
        },
        strengths: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              detail: { type: "string" }
            },
            required: ["title", "detail"],
            additionalProperties: false
          }
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["high", "medium", "low"] },
              skill: { type: "string" },
              action: { type: "string" },
              reason: { type: "string" }
            },
            required: ["priority", "skill", "action", "reason"],
            additionalProperties: false
          }
        },
        fit_verdict: {
          type: "string",
          enum: ["strong_fit", "potential_fit", "weak_fit"]
        }
      },
      required: [
        "overall_score",
        "overall_summary",
        "jd_required_skills",
        "jd_preferred_skills",
        "skill_analysis",
        "strengths",
        "recommendations",
        "fit_verdict"
      ],
      additionalProperties: false
    }
  }
}
```

#### 함수 구현
```typescript
export async function runAnalysis(
  portfolioText: string,
  jdText: string
): Promise<AnalysisResult> {
  const userPrompt = `아래 포트폴리오를 채용공고와 비교해 분석해주세요.

---채용공고---
${jdText}

---포트폴리오---
${portfolioText.slice(0, 12000)}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { /* JSON Schema */ }
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM returned empty response");
  }

  return JSON.parse(content) as AnalysisResult;
}
```

**특징:**
- Manus 내장 Forge API (gemini-2.5-flash)
- 한국어 응답 강제
- 고정 루브릭 없음 — JD에서 동적으로 역량 추출
- 점수 캘리브레이션: 85점 이상 희귀하게 (65~80점이 일반적)
- Evidence 기반 점수 매김

---

## 4. 데이터 흐름

### 4.1 분석 시작 흐름
```
프론트엔드 (Analyze.tsx)
    ↓
trpc.analysis.start.useMutation()
    ↓
서버 (routers.ts)
    ├─ PDF base64 → S3 저장 (storagePut)
    ├─ PDF 텍스트 추출 (extractTextFromPdf)
    ├─ DB 레코드 생성 (createAnalysis, status: "processing")
    └─ 비동기 LLM 분석 시작 (runAnalysis)
    ↓
즉시 analysisId 반환
    ↓
프론트엔드 /report?id={analysisId} 이동
```

### 4.2 결과 조회 흐름 (Polling)
```
프론트엔드 (Report.tsx)
    ↓
trpc.analysis.getResult.useQuery({analysisId}, {refetchInterval: 2000})
    ↓
서버 (routers.ts)
    ├─ DB 조회 (getAnalysisById)
    ├─ status 확인
    │  ├─ "processing" → {status: "processing"} 반환
    │  ├─ "done" → {status: "done", result: AnalysisResult} 반환
    │  └─ "error" → {status: "error", errorMessage} 반환
    └─ 2초마다 재요청
    ↓
status === "done" 시 Report 렌더링
```

---

## 5. 환경 변수 & 설정

### 필수 환경 변수
```
DATABASE_URL=mysql://...        # MySQL/TiDB 연결 문자열
JWT_SECRET=...                  # 세션 쿠키 서명 키
BUILT_IN_FORGE_API_KEY=...      # Manus LLM API 키
BUILT_IN_FORGE_API_URL=...      # Manus API 베이스 URL
VITE_OAUTH_PORTAL_URL=...       # Manus OAuth 포털
VITE_APP_ID=...                 # Manus OAuth 앱 ID
```

### 자동 주입 변수
- `OWNER_OPEN_ID`, `OWNER_NAME` — 프로젝트 소유자 정보

---

## 6. 에러 처리

### 프론트엔드 에러 처리
- PDF 파싱 실패: "PDF 파싱에 실패했습니다. 다른 파일을 시도해주세요."
- 텍스트 부족: "포트폴리오에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 PDF를 사용해주세요."
- JD 입력 부족: "채용공고를 50자 이상 입력해주세요"
- 분석 결과 미발견: "분석 결과를 찾을 수 없습니다"

### 서버 에러 처리
- LLM 분석 실패 → DB status: "error", errorMessage 저장
- 데이터베이스 연결 실패 → "Database not available" 에러

---

## 7. 성능 최적화

| 항목 | 값 | 이유 |
|------|-----|------|
| portfolioText 제한 | 20KB | DB 저장소 최적화 |
| LLM 입력 제한 | 12KB | API 토큰 비용 절감 |
| Polling 간격 | 2초 | UX 반응성 + 서버 부하 균형 |
| PDF 저장 경로 | `portfolios/portfolio.pdf` | S3 조직화 |

---

## 8. 보안

| 항목 | 설정 |
|------|------|
| 비로그인 분석 | 허용 (userId nullable) |
| 분석 데이터 | 비로그인 사용자는 조회 제한 없음 (현재) |
| PDF 저장 | S3 (비공개) |
| API 인증 | tRPC publicProcedure (인증 불필요) |

**향후 개선:** 비로그인 사용자 분석 횟수 제한, 데이터 TTL 설정 필요

