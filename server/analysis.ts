// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyCulture {
  /** JD에서 추출한 회사 핵심 가치 (3–5개) */
  values: string[];
  /** 팀이 일하는 방식 (1–2문장) */
  work_style: string;
  /** 회사가 원하는 인재상 (1–2문장) */
  ideal_candidate: string;
}

export interface ProjectMatch {
  /** 포트폴리오에서 추출한 실제 프로젝트명 */
  project_name: string;
  /** 이 JD 기준 해당 프로젝트 적합도 (0–100) */
  score: number;
  /** 해당 프로젝트에서 JD와 잘 맞는 요소 */
  strengths: string[];
  /** 해당 프로젝트에서 JD 기준 부족한 요소 */
  gaps: string[];
}

export interface SkillAnalysis {
  skill: string;
  type: "required" | "preferred";
  /** 0–100. 85 이상은 드물게, 일반적으로 강점은 65–80 */
  score: number;
  /** "[프로젝트명]에서 [구체적 근거]" 형식으로 작성 */
  evidence: string;
  /** 부족한 부분. 없으면 null */
  gap: string | null;
}

export interface Strength {
  title: string;
  detail: string;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  skill: string;
  /** 무엇을 어떻게 수정할지 구체적 액션 */
  action: string;
  /** 왜 이 수정이 필요한지 근거 */
  reason: string;
  /** 현재 포트폴리오의 표현 (추정 인용 또는 패러프레이즈) */
  before: string;
  /** 개선된 표현 예시 — 실제로 쓸 수 있는 문장 */
  after: string;
}

export interface PersonaReviews {
  senior_designer: {
    /** 시니어 디자이너 시선의 솔직한 코멘트 — 1인칭 구어체 */
    comment: string;
    /** 0–10 */
    score: number;
  };
  hiring_manager: {
    /** 채용 담당자 시선 — JD 적합성 중심, 1인칭 구어체 */
    comment: string;
    /** 0–10 */
    score: number;
  };
  interviewer: {
    /** 면접관이 물어볼 법한 질문 2–3개 */
    questions: string[];
  };
}

export interface AnalysisResult {
  /** 0–100 종합 적합도 점수 */
  overall_score: number;
  /** 2–3문장 종합 평가 요약 */
  overall_summary: string;
  /** JD에서 추출한 필수 역량 */
  jd_required_skills: string[];
  /** JD에서 추출한 우대 역량 */
  jd_preferred_skills: string[];
  /** JD에서 읽어낸 회사 문화 및 인재상 */
  company_culture: CompanyCulture;
  /** 역량별 상세 분석 */
  skill_analysis: SkillAnalysis[];
  /** 포트폴리오 내 프로젝트별 JD 매치 점수 */
  project_matches: ProjectMatch[];
  strengths: Strength[];
  /** 우선순위 순으로 정렬해서 제공 */
  recommendations: Recommendation[];
  fit_verdict: "strong_fit" | "potential_fit" | "weak_fit";
  /** 세 페르소나 시선의 포트폴리오 리뷰 */
  persona_reviews: PersonaReviews;
}

// ─── System prompt ────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are a senior product designer with 10+ years of experience and an experienced design hiring manager.
You evaluate designer portfolios against job descriptions with precision and honesty.

## Core Evaluation Principles

### 1. Evidence-based, project-specific scoring
- First, extract all project names from the portfolio. Look for explicit project titles, company names, or labeled case studies.
- For every skill score, cite which specific project demonstrates (or fails to demonstrate) that skill.
- evidence 필드 형식: "[프로젝트명]에서 [구체적 근거]" — 프로젝트명을 반드시 명시하고, 포트폴리오의 실제 내용을 근거로 삼아야 한다.
- gap 필드: 어느 프로젝트에서 어떤 요소가 부족하게 보이는지 구체적으로 명시한다.

### 2. JD-driven, not rubric-driven
- Extract required and preferred skills directly from the JD text. Do not use a fixed skill rubric.
- Let the JD define what matters for this specific role.

### 3. Company culture extraction
- Read the JD carefully and extract:
  - values: 3–5 core values the company emphasizes (e.g., "데이터 중심 의사결정", "빠른 실험과 학습", "사용자 공감")
  - work_style: how the team actually works — squad structure, collaboration style, pace (1–2 sentences in Korean)
  - ideal_candidate: what kind of person this company is really looking for beyond skills (1–2 sentences in Korean)

### 4. Project-level matching
- Identify every distinct portfolio project by name.
- Score each project against this JD (0–100).
- For each project, list what it demonstrates well (strengths) and what it lacks for this JD (gaps).
- Be specific — reference actual content from each project's description, not generic statements.

### 5. Persona-based reviews (persona_reviews)
Write three distinct reviews of this portfolio, each from a different persona's perspective. All in Korean, first-person colloquial style (구어체), as if speaking directly.

**시니어 디자이너 (senior_designer):**
- Tone: 직설적이고 솔직하게. 선배가 후배 포트폴리오를 옆에서 리뷰하는 것처럼.
- Focus: 디자인 사고의 깊이, 문제 해결 과정의 완성도, 포트폴리오에서 실력이 보이는지 여부.
- Natural phrases: "솔직히 말하면...", "이 부분은 괜찮은데...", "내가 보기엔..." 등.
- Score: 0–10 (7 = "꽤 잘 만들었다", 9 이상은 매우 드물게).

**채용 담당자 (hiring_manager):**
- Tone: 바쁜 사람. 30초 훑어보고 판단하는 관점.
- Focus: JD 키워드가 빠르게 눈에 들어오는지, 첫인상, 스크리닝 통과 가능성.
- Natural phrases: "JD랑 비교해보면...", "처음 봤을 때...", "이 포지션엔..." 등.
- Score: 0–10 (JD 매칭 기준).

**면접관 (interviewer):**
- No score — questions only.
- Write 2–3 specific interview questions the interviewer would ask based on portfolio gaps or points needing verification.
- Questions must reference actual portfolio content — not generic.
- Format: 실제 면접에서 물어볼 법한 날카롭고 구체적인 질문.

### 6. Before/after examples in recommendations
- For each recommendation, provide realistic before/after example sentences:
  - before: an estimated quote or close paraphrase of what the portfolio currently says (현재 포트폴리오 표현 추정)
  - after: a concrete improved version — a sentence the designer can actually copy and use
- Both before and after should read naturally as portfolio writing (1–2 sentences each).
- Do not write abstract descriptions like "성과 지표를 추가하세요" as after — write the actual sentence.

## Score Calibration
- Scores above 85 are rare — reserve for exceptional, fully demonstrated matches.
- Most strong portfolios score 65–80.
- overall_score reflects the weighted average of required skill scores.
- Be honest but constructive.

## Output Language
Respond entirely in Korean (한국어). Project names may remain in their original language or Korean, whichever appears in the portfolio.

Output ONLY valid JSON matching the provided schema. No text, explanation, or markdown outside the JSON object.`;

// ─── JSON Schema (Structured Output) ─────────────────────────────────────────

export const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "analysis_result",
    strict: true,
    schema: {
      type: "object",
      properties: {
        overall_score: {
          type: "integer",
          description: "0–100 종합 적합도 점수. 필수 역량 점수의 가중 평균.",
        },
        overall_summary: {
          type: "string",
          description: "2–3문장 종합 평가. 강점과 핵심 보완점을 모두 언급.",
        },
        jd_required_skills: {
          type: "array",
          items: { type: "string" },
          description: "JD에서 추출한 필수 역량 목록.",
        },
        jd_preferred_skills: {
          type: "array",
          items: { type: "string" },
          description: "JD에서 추출한 우대 역량 목록.",
        },
        company_culture: {
          type: "object",
          properties: {
            values: {
              type: "array",
              items: { type: "string" },
              description: "회사가 JD에서 강조하는 핵심 가치 3–5개.",
            },
            work_style: {
              type: "string",
              description: "팀이 일하는 방식 (스쿼드 구조, 협업 스타일, 속도감 등, 1–2문장).",
            },
            ideal_candidate: {
              type: "string",
              description: "이 회사가 스킬 너머에서 원하는 인재상 (1–2문장).",
            },
          },
          required: ["values", "work_style", "ideal_candidate"],
          additionalProperties: false,
        },
        skill_analysis: {
          type: "array",
          description: "JD 역량 각각에 대한 포트폴리오 분석. required 역량을 먼저, preferred를 뒤에 배치.",
          items: {
            type: "object",
            properties: {
              skill:     { type: "string" },
              type:      { type: "string", enum: ["required", "preferred"] },
              score:     { type: "integer", description: "0–100. 85 이상은 드물게." },
              evidence:  { type: "string", description: '"[프로젝트명]에서 [구체적 근거]" 형식.' },
              gap:       { type: ["string", "null"], description: "부족한 부분. 없으면 null." },
            },
            required: ["skill", "type", "score", "evidence", "gap"],
            additionalProperties: false,
          },
        },
        project_matches: {
          type: "array",
          description: "포트폴리오 내 각 프로젝트의 JD 매치 분석. 점수 높은 순 정렬.",
          items: {
            type: "object",
            properties: {
              project_name: { type: "string", description: "포트폴리오에서 추출한 실제 프로젝트명." },
              score:        { type: "integer", description: "이 JD 기준 해당 프로젝트 적합도 0–100." },
              strengths:    { type: "array", items: { type: "string" }, description: "이 프로젝트에서 JD와 잘 맞는 구체적 요소." },
              gaps:         { type: "array", items: { type: "string" }, description: "이 프로젝트에서 JD 기준 부족한 구체적 요소." },
            },
            required: ["project_name", "score", "strengths", "gaps"],
            additionalProperties: false,
          },
        },
        strengths: {
          type: "array",
          description: "포트폴리오 전체에서 이 JD 기준 두드러지는 강점 3–5개.",
          items: {
            type: "object",
            properties: {
              title:  { type: "string" },
              detail: { type: "string", description: "어느 프로젝트에서 어떻게 드러났는지 포함." },
            },
            required: ["title", "detail"],
            additionalProperties: false,
          },
        },
        recommendations: {
          type: "array",
          description: "우선순위 높은 순(high → medium → low)으로 정렬.",
          items: {
            type: "object",
            properties: {
              priority: { type: "string", enum: ["high", "medium", "low"] },
              skill:    { type: "string" },
              action:   { type: "string", description: "무엇을, 어떻게 수정할지 구체적 액션." },
              reason:   { type: "string", description: "왜 이 수정이 이 JD에서 중요한지." },
              before:   { type: "string", description: "현재 포트폴리오의 표현 추정 (1–2문장 인용 또는 패러프레이즈)." },
              after:    { type: "string", description: "실제로 쓸 수 있는 개선 문장 예시 (1–2문장)." },
            },
            required: ["priority", "skill", "action", "reason", "before", "after"],
            additionalProperties: false,
          },
        },
        fit_verdict: {
          type: "string",
          enum: ["strong_fit", "potential_fit", "weak_fit"],
          description: "strong_fit: 핵심 역량 대부분 충족. potential_fit: 일부 보완 시 경쟁력 있음. weak_fit: 핵심 역량 다수 부족.",
        },
        persona_reviews: {
          type: "object",
          description: "세 페르소나 시선의 포트폴리오 리뷰. 모두 한국어 1인칭 구어체.",
          properties: {
            senior_designer: {
              type: "object",
              properties: {
                comment: { type: "string", description: "시니어 디자이너 시선의 솔직한 코멘트. 구어체, 1인칭." },
                score:   { type: "integer", description: "0–10. 7 = 꽤 좋음. 9 이상은 드물게." },
              },
              required: ["comment", "score"],
              additionalProperties: false,
            },
            hiring_manager: {
              type: "object",
              properties: {
                comment: { type: "string", description: "채용 담당자 시선. JD 매칭·첫인상 중심. 구어체, 1인칭." },
                score:   { type: "integer", description: "0–10. JD 매칭 기준." },
              },
              required: ["comment", "score"],
              additionalProperties: false,
            },
            interviewer: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: { type: "string" },
                  description: "면접관이 포트폴리오를 보고 물어볼 구체적인 질문 2–3개.",
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
          required: ["senior_designer", "hiring_manager", "interviewer"],
          additionalProperties: false,
        },
      },
      required: [
        "overall_score",
        "overall_summary",
        "jd_required_skills",
        "jd_preferred_skills",
        "company_culture",
        "skill_analysis",
        "project_matches",
        "strengths",
        "recommendations",
        "fit_verdict",
        "persona_reviews",
      ],
      additionalProperties: false,
    },
  },
} as const;

// ─── LLM analysis (Gemini File API — PDF native) ─────────────────────────────

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)

// PDF → Gemini Files API 업로드 (단계 1)
export async function uploadPdfToGemini(
  pdfBuffer: Buffer,
): Promise<{ fileUri: string; fileName: string }> {
  const tmpPath = join(tmpdir(), `portfolio-${Date.now()}.pdf`)
  await writeFile(tmpPath, pdfBuffer)
  try {
    const upload = await fileManager.uploadFile(tmpPath, {
      mimeType: 'application/pdf',
      displayName: 'portfolio.pdf',
    })
    return { fileUri: upload.file.uri, fileName: upload.file.name }
  } finally {
    await unlink(tmpPath).catch(() => {})
  }
}

// Gemini 추론 (단계 2)
export async function generateAnalysis(
  fileUri: string,
  jdText: string,
): Promise<AnalysisResult> {
  const S = SchemaType
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      responseSchema: {
        type: S.OBJECT,
        properties: {
          overall_score:      { type: S.INTEGER },
          overall_summary:    { type: S.STRING },
          jd_required_skills: { type: S.ARRAY, items: { type: S.STRING } },
          jd_preferred_skills:{ type: S.ARRAY, items: { type: S.STRING } },
          fit_verdict:        { type: S.STRING, enum: ['strong_fit', 'potential_fit', 'weak_fit'] },
          company_culture: {
            type: S.OBJECT,
            properties: {
              values:          { type: S.ARRAY, items: { type: S.STRING } },
              work_style:      { type: S.STRING },
              ideal_candidate: { type: S.STRING },
            },
            required: ['values', 'work_style', 'ideal_candidate'],
          },
          skill_analysis: {
            type: S.ARRAY,
            items: {
              type: S.OBJECT,
              properties: {
                skill:    { type: S.STRING },
                type:     { type: S.STRING, enum: ['required', 'preferred'] },
                score:    { type: S.INTEGER },
                evidence: { type: S.STRING },
                gap:      { type: S.STRING, nullable: true },
              },
              required: ['skill', 'type', 'score', 'evidence', 'gap'],
            },
          },
          project_matches: {
            type: S.ARRAY,
            items: {
              type: S.OBJECT,
              properties: {
                project_name: { type: S.STRING },
                score:        { type: S.INTEGER },
                strengths:    { type: S.ARRAY, items: { type: S.STRING } },
                gaps:         { type: S.ARRAY, items: { type: S.STRING } },
              },
              required: ['project_name', 'score', 'strengths', 'gaps'],
            },
          },
          strengths: {
            type: S.ARRAY,
            items: {
              type: S.OBJECT,
              properties: {
                title:  { type: S.STRING },
                detail: { type: S.STRING },
              },
              required: ['title', 'detail'],
            },
          },
          recommendations: {
            type: S.ARRAY,
            items: {
              type: S.OBJECT,
              properties: {
                priority: { type: S.STRING, enum: ['high', 'medium', 'low'] },
                skill:    { type: S.STRING },
                action:   { type: S.STRING },
                reason:   { type: S.STRING },
                before:   { type: S.STRING },
                after:    { type: S.STRING },
              },
              required: ['priority', 'skill', 'action', 'reason', 'before', 'after'],
            },
          },
          persona_reviews: {
            type: S.OBJECT,
            properties: {
              senior_designer: {
                type: S.OBJECT,
                properties: {
                  comment: { type: S.STRING },
                  score:   { type: S.INTEGER },
                },
                required: ['comment', 'score'],
              },
              hiring_manager: {
                type: S.OBJECT,
                properties: {
                  comment: { type: S.STRING },
                  score:   { type: S.INTEGER },
                },
                required: ['comment', 'score'],
              },
              interviewer: {
                type: S.OBJECT,
                properties: {
                  questions: { type: S.ARRAY, items: { type: S.STRING } },
                },
                required: ['questions'],
              },
            },
            required: ['senior_designer', 'hiring_manager', 'interviewer'],
          },
        },
        required: [
          'overall_score', 'overall_summary', 'jd_required_skills', 'jd_preferred_skills',
          'fit_verdict', 'company_culture', 'skill_analysis', 'project_matches',
          'strengths', 'recommendations', 'persona_reviews',
        ],
      },
    },
  })

  const userPrompt = `아래 포트폴리오(첨부 PDF)를 채용공고와 비교해 분석해주세요.

---채용공고---
${jdText}`

  const response = await model.generateContent([
    { fileData: { mimeType: 'application/pdf', fileUri } },
    { text: userPrompt },
  ])
  const text = response.response.text()
  return JSON.parse(text) as AnalysisResult
}

// 단일 호출용 (로컬 개발, Express 서버)
export async function runAnalysis(pdfBuffer: Buffer, jdText: string): Promise<AnalysisResult> {
  const { fileUri, fileName } = await uploadPdfToGemini(pdfBuffer)
  try {
    return await generateAnalysis(fileUri, jdText)
  } finally {
    await fileManager.deleteFile(fileName).catch(() => {})
  }
}
