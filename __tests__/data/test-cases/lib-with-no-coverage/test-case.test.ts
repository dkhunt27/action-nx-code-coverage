/* eslint-disable filenames/match-regex */
import * as github from '@actions/github'
import * as core from '@actions/core'
import {expect, test} from '@jest/globals'
import {readFileSync, writeFileSync, existsSync} from 'fs'
import {main} from '../../../../src/main'
import path from 'path'
import {
  buildBaseSummaryFileList,
  buildFinalFileList,
  buildSummaryFileList,
  mergeFileLists,
  processCoverageFiles
} from '../../../../src/json-coverage'

const saveResults = false

const saveResultsFileIfEnabled = (
  outputPath: string,
  fileName: string,
  results: any
) => {
  if (saveResults) {
    writeFileSync(
      path.join(outputPath, fileName),
      JSON.stringify(results, null, 2)
    )
  }
}

const parseExpectedIfExists = (expectedFile: string) => {
  return existsSync(expectedFile)
    ? JSON.parse(readFileSync(expectedFile).toString())
    : {}
}

describe('test-case lib-with-no-coverage', () => {
  let outputPath: string
  let coveragePath: string

  const processCoverageFilesFileName = '01-process-coverage-files-output.json'
  const buildSummaryFileListFileName = '01a-build-summary-file-list-output.json'
  const buildBaseSummaryFileListFileName =
    '01b-build-base-summary-file-list-output.json'
  const buildFinalFileListFileName = '01c-build-final-file-list-output.json'
  const mergeFileListsFileName = '01d-merge-file-lists-output.json'

  const mainFileName = '10-main-output.json'

  beforeEach(() => {
    outputPath = path.join(__dirname)
    coveragePath = path.join(__dirname)

    jest.spyOn(core, 'debug').mockImplementation(() => {})
    jest.spyOn(core, 'warning').mockImplementation(() => {})

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
  })

  test('buildSummaryFileList', async () => {
    const expectedFile = path.join(outputPath, buildSummaryFileListFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await buildSummaryFileList({
      workspacePath: coveragePath,
      folder: 'coverage'
    })

    saveResultsFileIfEnabled(outputPath, buildSummaryFileListFileName, actual)

    expect(actual).toStrictEqual(expected)
  })

  test('buildBaseSummaryFileList', async () => {
    const expectedFile = path.join(outputPath, buildBaseSummaryFileListFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await buildBaseSummaryFileList({
      workspacePath: coveragePath,
      folder: 'coverage-base'
    })

    saveResultsFileIfEnabled(
      outputPath,
      buildBaseSummaryFileListFileName,
      actual
    )

    expect(actual).toStrictEqual(expected)
  })

  test('buildFinalFileList', async () => {
    const expectedFile = path.join(outputPath, buildFinalFileListFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await buildFinalFileList({
      workspacePath: coveragePath,
      folder: 'coverage'
    })

    saveResultsFileIfEnabled(outputPath, buildFinalFileListFileName, actual)

    expect(actual).toStrictEqual(expected)
  })

  test('mergeFileLists', async () => {
    const expectedFile = path.join(outputPath, mergeFileListsFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await mergeFileLists({
      summaryFileList: JSON.parse(
        readFileSync(
          path.join(outputPath, buildSummaryFileListFileName)
        ).toString()
      ),
      baseSummaryFileList: JSON.parse(
        readFileSync(
          path.join(outputPath, buildBaseSummaryFileListFileName)
        ).toString()
      ),
      finalFileList: JSON.parse(
        readFileSync(
          path.join(outputPath, buildFinalFileListFileName)
        ).toString()
      )
    })

    saveResultsFileIfEnabled(outputPath, mergeFileListsFileName, actual)

    expect(actual).toStrictEqual(expected)
  })

  test('processCoverageFiles', async () => {
    const expectedFile = path.join(outputPath, processCoverageFilesFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await processCoverageFiles({
      workspacePath: coveragePath,
      coverageFolder: 'coverage',
      coverageBaseFolder: 'coverage-base'
    })

    saveResultsFileIfEnabled(outputPath, processCoverageFilesFileName, actual)

    expect(actual).toStrictEqual(expected)
  })

  test.skip('main', async () => {
    const expectedFile = path.join(outputPath, mainFileName)
    const expected = parseExpectedIfExists(expectedFile)

    const actual = await main({
      coverageRan: true,
      coverageFolder: 'coverage',
      coverageBaseFolder: 'coverage-base',
      token: 'someToken',
      githubWorkspace: path.join(__dirname),
      gistToken: 'someGistToken',
      gistId: '14be704ddbfb786fbb50a292ee4d75f0'
    })

    saveResultsFileIfEnabled(outputPath, mainFileName, actual)

    expect(actual).toStrictEqual(expected)
  })
})
