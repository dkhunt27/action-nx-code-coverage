/* eslint-disable filenames/match-regex */
import * as github from '@actions/github'
import {expect, test} from '@jest/globals'
import {writeFileSync} from 'fs'
import {main} from '../src/main'
import path from 'path'

const saveResults = false

describe.skip('e2e tests', () => {
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
  })
  test('full processing as expected', async () => {
    const actual = await main({
      coverageRan: true,
      coverageFolder: './__tests__/data/coverage',
      coverageBaseFolder: './__tests__/data/coverage-base',
      token: 'someToken',
      githubWorkspace: path.join(__dirname, '..'),
      gistProcessing: true,
      gistToken: 'REPLACE_ME', // replace with real token when running e2e test, but don't check in
      gistId: '14be704ddbfb786fbb50a292ee4d75f0'
    })

    expect(true).toBe(true)

    saveResults
      ? writeFileSync(
          path.join(outputPath, 'main.json'),
          JSON.stringify(actual, null, 2)
        )
      : ''
  })
})
