/* eslint-disable filenames/match-regex */
import {
  listLcovFiles,
  mergeLcovResults,
  parseLcovFile,
  summarizeLcovRecords
} from '../src/lcov'
import path from 'path'

jest.mock('../src/logger')
describe('lcov tests', () => {
  describe('listLcovFiles', () => {
    test('resolves all lcov files', async () => {
      const actual = await listLcovFiles(
        __dirname,
        '../__tests__/listLcovFiles'
      )
      expect(actual).toHaveLength(2)
      expect(actual[0]).toStrictEqual({
        fullPath: expect.stringContaining(
          '__tests__/listLcovFiles/a/b/c/lcov.info'
        ),
        lcovPath: '/a/b/c/lcov.info',
        path: '../__tests__/listLcovFiles/a/b/c/lcov.info'
      })
      expect(actual[1]).toStrictEqual({
        fullPath: expect.stringContaining(
          '__tests__/listLcovFiles/d/lcov.info'
        ),
        lcovPath: '/d/lcov.info',
        path: '../__tests__/listLcovFiles/d/lcov.info'
      })
    })

    test('resolves no lcov files', async () => {
      const actual = await listLcovFiles(
        __dirname,
        '../__tests__/listLcovFilesNone'
      )
      expect(actual).toHaveLength(0)
    })

    test('rejects error when dir does not exist', async () => {
      await expect(
        listLcovFiles(__dirname, '../__tests__/listLcovFilesNotExist')
      ).rejects.toThrow('ENOENT: no such file or directory')
    })
  })
  describe('mergeLcovResults', () => {
    test.skip('merges correctly', async () => {
      const lcovFiles = [
        {
          path: '../__tests__/listLcovFiles/a/b/c/lcov.info',
          fullPath:
            '/Users/DHunt/git/dkhunt27/nx-code-coverage/__tests__/listLcovFiles/a/b/c/lcov.info',
          lcovPath: '/a/b/c/lcov.info'
        },
        {
          path: '../__tests__/listLcovFiles/d/lcov.info',
          fullPath:
            '/Users/DHunt/git/dkhunt27/nx-code-coverage/__tests__/listLcovFiles/d/lcov.info',
          lcovPath: '/d/lcov.info'
        }
      ]

      const lcovBaseFiles = [
        {
          path: '../__tests__/listLcovFilesBase/a/b/c/lcov.info',
          fullPath:
            '/Users/DHunt/git/dkhunt27/nx-code-coverage/__tests__/listLcovFilesBase/a/b/c/lcov.info',
          lcovPath: '/a/b/c/lcov.info'
        },
        {
          path: '../__tests__/listLcovFilesBase/d/lcov.info',
          fullPath:
            '/Users/DHunt/git/dkhunt27/nx-code-coverage/__tests__/listLcovFilesBase/d/lcov.info',
          lcovPath: '/d/lcov.info'
        }
      ]

      const actual = mergeLcovResults(lcovFiles, lcovBaseFiles)
      expect(actual).toHaveLength(2)
      // TODO: build better test
    })
  })
  describe('parseLcov', () => {
    test('summarizeLcovRecords', () => {
      const parsed = parseLcovFile(
        path.join(__dirname, '../__tests__/parseLcovFile/lcov.info')
      )
      const actual = summarizeLcovRecords(parsed)

      expect(actual).toStrictEqual({
        branches: {hit: 3, found: 5, percentage: 60},
        functions: {hit: 29, found: 30, percentage: 96.67},
        lines: {hit: 142, found: 147, percentage: 96.6},
        statements: {
          found: 182,
          hit: 174,
          percentage: 95.6
        }
      })
    })
  })
})
