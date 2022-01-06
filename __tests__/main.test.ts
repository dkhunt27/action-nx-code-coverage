/* eslint-disable filenames/match-regex */
import * as github from '@actions/github'
import {expect, test} from '@jest/globals'
import {readFileSync, writeFileSync} from 'fs'
import {main} from '../src/main'
import path from 'path'

jest.mock('../src/logger')

const saveResults = false

describe.skip('main tests', () => {
  let outputPath: string
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

    // "pullRequestHeadSha": "296442b005eff46ea5c7fad024d3a8e5c8cda7e3",
    // "pullRequestHeadRef": "wip",
    // "pullRequestBaseRef": "main",
    // "pullRequestNumber": 9,
  })
  test('throws invalid number', async () => {
    const expected = JSON.parse(
      readFileSync(path.join(outputPath, 'main.json')).toString()
    )

    const actual = await main({
      coverageRan: true,
      coverageFolder: './__tests__/data/coverage',
      coverageBaseFolder: './__tests__/data/coverage-base',
      token: 'someToken',
      githubWorkspace: path.join(__dirname, '..'),
      gistToken: 'someGistToken',
      gistId: '14be704ddbfb786fbb50a292ee4d75f0'
    })

    expect(actual).toStrictEqual(expected)

    saveResults
      ? writeFileSync(
          path.join(outputPath, 'main.json'),
          JSON.stringify(actual, null, 2)
        )
      : ''
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
