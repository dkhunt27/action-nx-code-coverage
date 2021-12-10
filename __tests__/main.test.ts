/* eslint-disable filenames/match-regex */
import {expect, test} from '@jest/globals'
import {main} from '../src/main'

jest.mock('../src/logger')

describe('main tests', () => {
  test.skip('throws invalid number', async () => {
    const actual = await main({
      coverageFolder: '../__tests__/listLcovFiles',
      coverageBaseFolder: '',
      token: 'abc',
      githubWorkspace: 'def'
    })
    expect(actual).toBe('abc')
  })

  // shows how the runner will run a javascript action with env / stdout protocol
  // test('test runs', () => {
  //   process.env['GITHUB_WORKSPACE'] = '~/nx-code-coverage/'
  //   const np = process.execPath
  //   const ip = path.join(__dirname, '..', 'dist', 'index.js')
  //   const options: cp.ExecFileSyncOptions = {
  //     env: process.env
  //   }
  //   try {
  //   const result = cp.execFileSync(np, [ip], options).toString()
  //   console.log(result)
  //   } catch (err){
  //     throw err
  //   }
  // })
})
