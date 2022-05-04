/* eslint-disable filenames/match-regex */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {expect, test} from '@jest/globals'
import {main} from '../../../../src/main'
import path from 'path'

describe('test-case coverage degradation', () => {
  beforeEach(() => {
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

  const config = {
    coverageRan: true,
    githubWorkspace: path.join(__dirname),
    coverageFolder: 'coverage',
    coverageBaseFolder: 'coverage-base',
    token: 'someToken',
    gistToken: '',
    gistId: ''
  }

  test('failOnCoverageDecrease disabled', async () => {
    await expect(
      main({
        ...config,
        failOnCoverageDecrease: false,
        coverageDecreaseDelta: 0
      })
    ).resolves.toBeTruthy()
  })

  test('failOnCoverageDecrease enabled', async () => {
    expect.assertions(2)
    await expect(
      main({
        ...config,
        failOnCoverageDecrease: true,
        coverageDecreaseDelta: 0
      })
    ).rejects.toEqual(
      new Error('Code coverage is decreasing for projects: /libs/feature')
    )
    await expect(
      main({
        ...config,
        failOnCoverageDecrease: true,
        coverageDecreaseDelta: 5
      })
    ).rejects.toEqual(
      new Error('Code coverage is decreasing for projects: /libs/feature')
    )
  })

  test('failOnCoverageDecrease enabled with bigger bandwidth', async () => {
    await expect(
      main({
        ...config,
        failOnCoverageDecrease: true,
        coverageDecreaseDelta: 10
      })
    ).resolves.toBeTruthy()
  })
})
