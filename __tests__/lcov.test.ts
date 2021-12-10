import {listLcovFiles} from '../src/lcov'
import {expect, test} from '@jest/globals'

describe('lcov tests', () => {
  test('resolves all lcov files', async () => {
    const actual = await listLcovFiles('../__tests__/listLcovFiles')
    expect(actual).toHaveLength(2)
    expect(actual[0]).toStrictEqual({
      fullPath: expect.stringContaining(
        '__tests__/listLcovFiles/a/b/c/lcov.info'
      ),
      lcovKey: '/a/b/c/lcov.info',
      path: '../__tests__/listLcovFiles/a/b/c/lcov.info'
    })
    expect(actual[1]).toStrictEqual({
      fullPath: expect.stringContaining('__tests__/listLcovFiles/d/lcov.info'),
      lcovKey: '/d/lcov.info',
      path: '../__tests__/listLcovFiles/d/lcov.info'
    })
  })

  test('resolves no lcov files', async () => {
    const actual = await listLcovFiles('../__tests__/listLcovFilesNone')
    expect(actual).toHaveLength(0)
  })

  test('rejects error when dir does not exist', async () => {
    await expect(
      listLcovFiles('../__tests__/listLcovFilesNotExist')
    ).rejects.toThrow('ENOENT: no such file or directory')
  })
})
