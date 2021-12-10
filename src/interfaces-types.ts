import {LCOVRecord} from 'parse-lcov'

export interface IMainInputs {
  lcovFolder: string
  lcovBaseFolder: string
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

export type LcovFileResultType = {
  path: string
  fullPath: string
  lcovKey: string
}

export type LcovResultType = {
  key: string
  lcov: LCOVRecord[]
  base: LCOVRecord[] | undefined
}

export type TabulateOptionsType = {
  repository: string
  commit: string
  prefix: string
  head: string
  base: string
}

export type LCOVStats = {
  found: number
  hit: number
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
