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
  parsed: JcsParsedType
  path: string
  fullPath: string
  relativePath: string
  app: string
}

export type JcsDataType = {
  total: number
  covered: number
  skipped: number
  pct: number
}

export type JcsSummaryType = {
  lines: JcsDataType
  functions: JcsDataType
  statements: JcsDataType
  branches: JcsDataType
}

export type JcsParsedType = Record<string, JcsSummaryType>

export type JcsMergedItemType = {
  app: string
  parsedTotal: JcsSummaryType
  parsedOthers: Record<string, JcsSummaryType>
}

export type JcsMergedType = {
  app: string
  coverage: number | undefined
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
  parsed: JcsParsedType
}

export type FileListType = {
  app: string
  parsed: JcsParsedType | string
}

export type GistContentType = {
  schemaVersion: number
  label: string
  message: string
  labelColor?: string
  color?: string
  isError?: string
  namedLogo?: string
  logoSvg?: string
  logoColor?: string
  logoWidth?: number
  logoPosition?: string
  style?: string
  cacheSeconds?: number
}

export type GistUpdateFileType = {
  [key: string]: Partial<{[key: string]: unknown}>
}
