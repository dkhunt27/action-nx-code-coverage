import {
  FileListType,
  FinalFileListType,
  GistUpdateFileType,
  JcsMergedType,
  JcsParsedType,
  SummaryFileListType
} from './types'

export interface MainInputs {
  coverageRan: boolean
  coverageFolder: string
  coverageBaseFolder: string
  token: string
  githubWorkspace: string
  gistId: string
  gistToken: string
}

export interface UpsertCommentInputs {
  token: string
  prNumber: number
  body: string
  hiddenHeader: string
  repoOwner: string
  repoRepo: string
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
  parseFileFn: (_: string) => Promise<JcsParsedType | string>
  workspacePath: string
  initDir: string
  dir?: string
  results?: FileListType[]
}

export interface BuildCommentInputs {
  results: JcsMergedType[]
  compact?: boolean
}

export interface MergeFileListsInputs {
  summaryFileList: SummaryFileListType[]
  baseSummaryFileList: SummaryFileListType[]
  finalFileList: FinalFileListType[]
}

export interface CreateCoverageBadgeInputs {
  label: string
  message: string
}

export interface UpdateCoverageGistInputs {
  files: GistUpdateFileType
  gistId: string
  gistToken: string
}
