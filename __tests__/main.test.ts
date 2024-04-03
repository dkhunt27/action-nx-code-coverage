/* eslint-disable filenames/match-regex */
import * as github from '@actions/github'
import {expect, test} from '@jest/globals'
import {readFileSync, writeFileSync} from 'fs'
import {main} from '../src/main'
import path from 'path'
import * as JsonCoverage from '../src/json-coverage'
import * as Comment from '../src/comment'
import * as Github from '../src/github'
import * as Badges from '../src/badges'
import {JcsMergedType} from '../src/types'

const saveResults = false

describe('main tests', () => {
  let outputPath: string
  let processCoverageFilesResult: JcsMergedType[]

  beforeEach(() => {
    outputPath = path.join(__dirname, '../__tests__/data/processed')

    jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
      return {
        owner: 'dkhunt27',
        repo: 'nx-code-coverage'
      }
    })
    github.context.payload = {
      repository: {
        name: 'nx-code-coverage',
        full_name: 'dkhunt27/nx-code-coverage',
        owner: {
          login: 'dkhunt27'
        }
      }
    }
    github.context.ref = 'refs/heads/some-ref'
    github.context.sha = '1234567890123456789012345678901234567890'

    const filePath = path.join(outputPath, 'processed.json')
    processCoverageFilesResult = JSON.parse(readFileSync(filePath).toString())

    jest
      .spyOn(JsonCoverage, 'processCoverageFiles')
      .mockResolvedValue(processCoverageFilesResult)
    jest.spyOn(Comment, 'buildComment').mockReturnValue('Code Coverage:<p></p>')
    jest.spyOn(Github, 'buildParsedContext').mockReturnValue({
      repositoryFullName: 'repoFullName',
      pullRequestHeadSha: 'headSha',
      pullRequestHeadRef: 'headRef',
      pullRequestBaseRef: 'baseRef',
      repoOwner: 'repoOwner',
      repoRepo: 'repoRepo',
      pullRequestNumber: -1
    })
    jest.spyOn(Badges, 'updateCoverageGist').mockResolvedValue()
  })
  test('full processing as expected', async () => {
    const expected = JSON.parse(
      readFileSync(path.join(outputPath, 'main.json')).toString()
    )

    const actual = await main({
      coverageRan: true,
      coverageFolder: './__tests__/data/coverage',
      coverageBaseFolder: './__tests__/data/coverage-base',
      token: 'someToken',
      githubWorkspace: path.join(__dirname, '..'),
      gistProcessing: true,
      gistToken: 'someGistToken',
      gistId: 'someGistId',
      hideCoverageReports: false,
      hideUnchanged: false
    })

    expect(actual).toStrictEqual(processCoverageFilesResult)

    saveResults
      ? writeFileSync(
          path.join(outputPath, 'main.json'),
          JSON.stringify(actual, null, 2)
        )
      : ''
  })

  test('skip gist', async () => {
    const expected = JSON.parse(
      readFileSync(path.join(outputPath, 'main.json')).toString()
    )

    const actual = await main({
      coverageRan: true,
      coverageFolder: './__tests__/data/coverage',
      coverageBaseFolder: './__tests__/data/coverage-base',
      token: 'someToken',
      githubWorkspace: path.join(__dirname, '..'),
      gistProcessing: false,
      gistToken: 'someGistToken',
      gistId: 'someGistId',
      hideCoverageReports: false,
      hideUnchanged: false
    })

    expect(actual).toStrictEqual(processCoverageFilesResult)

    saveResults
      ? writeFileSync(
          path.join(outputPath, 'main.json'),
          JSON.stringify(actual, null, 2)
        )
      : ''
  })
})
