# FitFolio Design System

## 1. 콘셉트

- 디자이너를 위한 서비스답게 **정돈되고 신뢰감 있는 톤**
- AI 슬롭(보라/파랑 그라디언트, 과한 글로우, 억지 포인트 컬러) 철저히 배제
- 포인트 컬러 없이 **타이포그래피와 여백으로 승부**
- 라이트 베이스 + 일부 섹션만 다크로 교차해 리듬감 부여
- 레퍼런스 톤: Linear, Pitch, Craft

---

## 2. 컬러

### 라이트 섹션 (기본)
| 토큰 | 값 | 용도 |
|---|---|---|
| Background | `#ffffff` | 기본 배경 |
| Surface | `#f8f8f6` | 카드, 인풋 배경 |
| Border | `#e4e4e0` | 구분선, 카드 테두리 |
| Text Primary | `#111110` | 제목, 본문 |
| Text Muted | `#78776c` | 보조 텍스트, 캡션 |

### 다크 섹션 (Hero, CTA 등)
| 토큰 | 값 | 용도 |
|---|---|---|
| Background Dark | `#111110` | 다크 섹션 배경 |
| Text on Dark | `#f4f4f0` | 다크 섹션 텍스트 |
| Text Muted on Dark | `#a8a89e` | 다크 섹션 보조 텍스트 |
| Border on Dark | `rgba(255,255,255,0.1)` | 다크 섹션 구분선 |

### 상태 컬러 (리포트 전용)
| 토큰 | 값 | 용도 |
|---|---|---|
| Success | `#16a34a` | 강점, 충족 역량 |
| Warning | `#d97706` | 보완 필요 역량 |
| Danger | `#dc2626` | 부족 역량 |

> 상태 컬러는 리포트 배지에만 사용. 브랜드 포인트로 쓰지 않는다.

---

## 3. 타이포그래피

폰트: **Noto Sans KR** (한국어), **Noto Sans** (영문/숫자)

| 레벨 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| Display | `text-5xl` / 48px | `font-bold` | Hero 메인 카피 |
| Heading 1 | `text-4xl` / 36px | `font-bold` | 섹션 타이틀 |
| Heading 2 | `text-2xl` / 24px | `font-semibold` | 서브 타이틀 |
| Heading 3 | `text-lg` / 18px | `font-semibold` | 카드 타이틀 |
| Body | `text-base` / 16px | `font-normal` | 본문 |
| Caption | `text-sm` / 14px | `font-normal` | 보조 설명 |
| Label | `text-xs` / 12px | `font-medium` | 배지, 레이블 |

### 원칙
- 줄간격: `leading-relaxed` (1.6)
- 강조는 컬러 대신 **굵기(font-bold)나 크기 차이**로
- 라이트 섹션 본문: `text-[#78776c]`
- 다크 섹션 본문: `text-[#a8a89e]`
- 링크/인터랙티브: 언더라인으로 표현

---

## 4. 레이아웃

```
Max Width: max-w-6xl (1152px)
Padding X: px-6 (모바일) / px-8 (데스크탑)
Section Padding: py-24 (라이트) / py-28 (다크)
Grid: 12컬럼 기준, 주로 2컬럼/3컬럼 사용
Gap: gap-6 (카드) / gap-12 (섹션 내 블록)
```

### 섹션 교차 패턴
```
Hero          → 다크 (#111110)
문제 정의      → 라이트 (#ffffff)
작동 방식      → 다크 (#111110)
핵심 기능      → 라이트 (#ffffff)
후기           → Surface (#f8f8f6)
가격           → 라이트 (#ffffff)
CTA           → 다크 (#111110)
```

---

## 5. 컴포넌트

### 버튼
```
Primary (라이트 섹션):
  bg-[#111110] text-[#f4f4f0] rounded-full px-6 py-2.5 text-sm font-medium
  hover: bg-[#2a2a28]

Primary (다크 섹션):
  bg-[#f4f4f0] text-[#111110] rounded-full px-6 py-2.5 text-sm font-medium
  hover: bg-white

Secondary:
  border border-[#e4e4e0] bg-transparent text-[#111110] rounded-full px-6 py-2.5 text-sm
  hover: bg-[#f8f8f6]

Ghost (다크 섹션):
  border border-white/20 text-[#f4f4f0] rounded-full px-6 py-2.5 text-sm
  hover: bg-white/10
```

### 카드
```
기본 카드:
  bg-white border border-[#e4e4e0] rounded-2xl p-6

Surface 카드:
  bg-[#f8f8f6] rounded-2xl p-6

다크 카드:
  bg-white/5 border border-white/10 rounded-2xl p-6
```

### 배지 (리포트 전용)
```
강점:  bg-[#dcfce7] text-[#16a34a] rounded-full px-3 py-1 text-xs font-medium
보완:  bg-[#fef3c7] text-[#d97706] rounded-full px-3 py-1 text-xs font-medium
부족:  bg-[#fee2e2] text-[#dc2626] rounded-full px-3 py-1 text-xs font-medium
중립:  bg-[#f4f4f4] text-[#78776c] rounded-full px-3 py-1 text-xs font-medium
```

### 인풋 / 파일 업로드
```
인풋:
  bg-[#f8f8f6] border border-[#e4e4e0] rounded-xl px-4 py-3 text-sm
  focus: border-[#111110] outline-none

텍스트에어리어:
  bg-[#f8f8f6] border border-[#e4e4e0] rounded-xl px-4 py-3 text-sm resize-none
  focus: border-[#111110] outline-none

파일 업로드 드롭존:
  border-2 border-dashed border-[#e4e4e0] rounded-2xl p-12 text-center
  hover: border-[#111110] bg-[#f8f8f6]
  아이콘: Lucide Upload (24px, color: #78776c)
```

---

## 6. 아이콘

**Lucide React** 사용 (shadcn 기본 세트)
크기 기본값: 20px (인라인), 24px (독립)
색상: 섹션 텍스트 컬러 따라감

| 용도 | 아이콘 |
|---|---|
| 업로드 | `Upload` |
| 분석 | `ScanLine` |
| 강점 | `CheckCircle2` |
| 부족 | `AlertCircle` |
| 보고서 | `FileText` |
| 프로젝트 | `FolderOpen` |
| 이동/CTA | `ArrowRight` |
| 체크 | `Check` |

---

## 7. 금지 사항 (AI 슬롭 방지)

- ❌ 보라/바이올렛/파랑 계열 브랜드 컬러 금지
- ❌ 그라디언트 배경 금지 (단색만 허용)
- ❌ 글로우 효과 금지
- ❌ 과한 애니메이션 (floating, pulse 남발) 금지
- ❌ 추상적 AI 일러스트 금지
- ❌ 억지 포인트 컬러 삽입 금지
- ✅ 여백으로 호흡
- ✅ 타이포 굵기/크기 차이로 위계
- ✅ 실제 UI 목업 또는 텍스트 중심 레이아웃
- ✅ 블랙/화이트 대비로 강조

---

## 8. 페이지별 디자인 방향

### 랜딩페이지 (/)
- Hero: 다크 배경 + 큰 카피 + 단일 CTA
- 각 섹션은 한 메시지만
- 스크롤마다 후킹포인트 명확하게
- 불필요한 장식 없이 카피로 승부

### 분석 입력 페이지 (/analyze)
- 라이트 배경
- 2컬럼: 포트폴리오 업로드 | JD 입력
- 드롭존 + 텍스트에어리어 조합
- 분석 시작 버튼은 하단 중앙, 크게
- 군더더기 없이 입력에 집중

### 결과 리포트 페이지 (/report)
- 라이트 배경
- 상단: 전체 요약
- 중단: 역량 분석 (배지로 강점/보완/부족 구분)
- 하단: 프로젝트별 피드백 + 수정 액션
- 텍스트 밀도 높아도 위계로 읽히게
