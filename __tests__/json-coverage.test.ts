/* eslint-disable filenames/match-regex */
import {FinalFileListType, SummaryFileListType} from '../src/interfaces-types'
import {
  listCoverageFiles,
  mergeFileLists,
  parseJsonCoverageFinalFile,
  parseJsonCoverageSummaryFile,
  processCoverageFiles
} from '../src/json-coverage'
import {readFileSync, writeFileSync} from 'fs'
import path from 'path'

const saveResults = false

jest.mock('../src/logger')

describe('json-coverage tests', () => {
  let inputPath: string
  let outputPath: string
  describe.skip('parseJsonCoverageFinalFile', () => {
    beforeEach(() => {
      inputPath = path.join(__dirname, '../__tests__/data/rawJsonCoverageFiles')
      outputPath = path.join(
        __dirname,
        '../__tests__/data/parsedJsonCoverageFiles'
      )
    })
    test('parses final file correctly', async () => {
      const filePath = path.join(inputPath, 'coverage-final.json')
      const expected = readFileSync(
        path.join(outputPath, 'coverage-final-parsed.txt')
      ).toString()
      const actual = await parseJsonCoverageFinalFile(filePath)

      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'coverage-final-parsed.txt'),
            actual
          )
        : ''
    })
  })
  describe('parseJsonCoverageSummaryFile', () => {
    beforeEach(() => {
      inputPath = path.join(__dirname, '../__tests__/data/rawJsonCoverageFiles')
      outputPath = path.join(
        __dirname,
        '../__tests__/data/parsedJsonCoverageFiles'
      )
    })
    test('parses summary file correctly', async () => {
      const filePath = path.join(inputPath, 'coverage-summary.json')
      const expected = JSON.parse(readFileSync(filePath).toString())
      const actual = await parseJsonCoverageSummaryFile(filePath)
      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'coverage-summary-parsed.json'),
            JSON.stringify(actual, null, 2)
          )
        : ''
    })
  })
  describe('listCoverageFiles', () => {
    beforeEach(() => {
      inputPath = path.join(__dirname, '../__tests__/data/listCoverageFiles')
      outputPath = path.join(__dirname, '../__tests__/data/fileLists')
    })
    test('resolves summary files', async () => {
      const filePath = path.join(outputPath, 'coverage-summary-file-list.json')
      const expected = JSON.parse(readFileSync(filePath).toString())

      const actual = await listCoverageFiles({
        fileToFind: 'coverage-summary.json',
        parseFileFn: parseJsonCoverageSummaryFile,
        workspacePath: __dirname,
        initDir: '../__tests__/data/listCoverageFiles/exist'
      })
      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'coverage-summary-file-list.json'),
            JSON.stringify(actual, null, 2)
          )
        : ''
    })

    test.skip('resolves final files', async () => {
      const filePath = path.join(outputPath, 'coverage-final-file-list.json')
      const expected = JSON.parse(readFileSync(filePath).toString())

      const actual = await listCoverageFiles({
        fileToFind: 'coverage-final.json',
        parseFileFn: parseJsonCoverageFinalFile,
        workspacePath: __dirname,
        initDir: '../__tests__/data/listCoverageFiles/exist'
      })
      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'coverage-final-file-list.json'),
            JSON.stringify(actual, null, 2)
          )
        : ''
    })

    test('resolves no files', async () => {
      const actual = await listCoverageFiles({
        fileToFind: 'coverage-summary.json',
        parseFileFn: async x => Promise.resolve(`parsed ${x}`),
        workspacePath: __dirname,
        initDir: '../__tests__/data/listCoverageFiles/doNotExist'
      })
      expect(actual).toHaveLength(0)
    })

    test('rejects error when dir does not exist', async () => {
      await expect(
        listCoverageFiles({
          fileToFind: 'coverage-summary.json',
          parseFileFn: async x => Promise.resolve(`parsed ${x}`),
          workspacePath: __dirname,
          initDir: '../__tests__/thisFolderDoesNotExist'
        })
      ).rejects.toThrow('ENOENT: no such file or directory')
    })
  })

  describe('mergeFileLists', () => {
    let summaryFileList: SummaryFileListType[]
    let baseSummaryFileList: SummaryFileListType[]
    let finalFileList: FinalFileListType[]
    beforeEach(() => {
      inputPath = path.join(__dirname, '../__tests__/data/fileLists')
      outputPath = path.join(__dirname, '../__tests__/data/merged')

      const summaryFilePath = path.join(
        inputPath,
        'coverage-summary-file-list.json'
      )
      const baseFilePath = path.join(
        inputPath,
        'coverage-summary-file-list.json'
      )
      const finalFilePath = path.join(
        inputPath,
        'coverage-final-file-list.json'
      )

      summaryFileList = JSON.parse(readFileSync(summaryFilePath).toString())
      baseSummaryFileList = JSON.parse(readFileSync(baseFilePath).toString())
      finalFileList = JSON.parse(readFileSync(finalFilePath).toString())
    })
    test('merges data correctly', () => {
      const filePath = path.join(outputPath, 'merged.json')
      const expected = JSON.parse(readFileSync(filePath).toString())
      const actual = mergeFileLists({
        summaryFileList,
        baseSummaryFileList,
        finalFileList
      })

      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'merged.json'),
            JSON.stringify(actual, null, 2)
          )
        : ''
    })
  })

  describe.skip('processCoverageFiles', () => {
    beforeEach(() => {
      outputPath = path.join(__dirname, '../__tests__/data/processed')
    })
    test('processes data correctly', async () => {
      const filePath = path.join(outputPath, 'processed.json')
      const expected = JSON.parse(readFileSync(filePath).toString())
      const actual = await processCoverageFiles({
        workspacePath: __dirname,
        coverageFolder: '../__tests__/data/coverage',
        coverageBaseFolder: '../__tests__/data/coverage-base'
      })

      expect(actual).toStrictEqual(expected)

      saveResults
        ? writeFileSync(
            path.join(outputPath, 'processed.json'),
            JSON.stringify(actual, null, 2)
          )
        : ''
    })
  })
})
