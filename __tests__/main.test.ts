import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {main} from '../src/main'

describe('main tests', () => {
  test.skip('throws invalid number', async () => {
    const actual = await main({
      lcovFolder: '../__tests__/listLcovFiles',
      lcovBaseFolder: '',
      token: 'abc',
      githubWorkspace: 'def'
    })
    expect(actual).toBe('abc')
  })

  // shows how the runner will run a javascript action with env / stdout protocol
  // test('test runs', () => {
  //   process.env['INPUT_MILLISECONDS'] = '500'
  //   const np = process.execPath
  //   const ip = path.join(__dirname, '..', 'lib', 'main.js')
  //   const options: cp.ExecFileSyncOptions = {
  //     env: process.env
  //   }
  //   console.log(cp.execFileSync(np, [ip], options).toString())
  // })
})
