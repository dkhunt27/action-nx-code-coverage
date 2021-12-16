export interface IMainInputs {
  coverageFolder: string
  coverageBaseFolder: string
  token: string
  githubWorkspace: string
}

export interface IUpsertCommentInputs {
  token: string
  prNumber: number
  body: string
  hiddenHeader: string
  repoOwner: string
  repoRepo: string
}

export type TabulateOptionsType = {
  repository: string
  commit: string
  prefix: string
  head: string
  base: string
}

export type ParsedContextType = {
  repositoryFullName: string
  pullRequestHeadSha: string
  pullRequestHeadRef: string
  pullRequestBaseRef: string
  pullRequestNumber: number
  repoOwner: string
  repoRepo: string
}

export type JcsFileListType = {
  parsed: JcsParsed
  path: string
  fullPath: string
  relativePath: string
  app: string
}

export type JcsData = {
  total: number
  covered: number
  skipped: number
  pct: number
}

export type JcsSummary = {
  lines: JcsData
  functions: JcsData
  statements: JcsData
  branches: JcsData
}

export type JcsParsed = Record<string, JcsSummary>

export type JcsMergedItem = {
  app: string
  parsedTotal: JcsSummary
  parsedOthers: Record<string, JcsSummary>
}

export type JcsMerged = {
  app: string
  coverage: number
  base: number | null
  diff: number | null
  details: string
}

export type FinalFileListType = {
  app: string
  parsed: string
}

export type SummaryFileListType = {
  app: string
  parsed: JcsParsed
}

export type FileListType = {
  app: string
  parsed: JcsParsed | string
}

export interface ProcessCoverageFilesInputs {
  workspacePath: string
  coverageFolder: string
  coverageBaseFolder: string
}

export interface BuildFileListInputs {
  workspacePath: string
  folder: string
}

export interface ListCoverageFilesInputs {
  fileToFind: string
  parseFileFn: (_: string) => Promise<JcsParsed | string>
  workspacePath: string
  initDir: string
  dir?: string
  results?: FileListType[]
}

export interface BuildCommentInputs {
  results: JcsMerged[]
}

export interface MergeFileListsInputs {
  summaryFileList: SummaryFileListType[]
  baseSummaryFileList: SummaryFileListType[]
  finalFileList: FinalFileListType[]
}
