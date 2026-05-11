import { track } from './mixpanel'

export const Analytics = {
  pageViewed: (page: string) =>
    track('Page Viewed', { page }),

  pdfUploaded: (props: { fileSize: number }) =>
    track('PDF Uploaded', { file_size_mb: +(props.fileSize / 1024 / 1024).toFixed(2) }),

  jdInputted: (props: { length: number }) =>
    track('JD Inputted', { character_count: props.length }),

  analysisStarted: (props: { jdLength: number; pdfSize: number }) =>
    track('Analysis Started', {
      jd_length: props.jdLength,
      pdf_size_mb: +(props.pdfSize / 1024 / 1024).toFixed(2),
    }),

  analysisCompleted: (props: { score: number; verdict: string }) =>
    track('Analysis Completed', { overall_score: props.score, fit_verdict: props.verdict }),

  resultSectionViewed: (section: string) =>
    track('Result Section Viewed', { section }),

  resultCopied: () =>
    track('Result Copied'),

  analysisFailed: (props: { error: string }) =>
    track('Analysis Failed', { error: props.error }),
}
