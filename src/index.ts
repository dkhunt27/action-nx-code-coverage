import {
  getBooleanInput,
  getInput,
  error as logError,
  info as logInfo,
  setFailed
} from '@actions/core'
import {MainInputs} from './interfaces'
import {main} from './main'

async function run(): Promise<void> {
  try {
    const noCoverageRan = getBooleanInput('no-coverage-ran')
    const token = getInput('github-token')
    const coverageFolder = getInput('coverage-folder') || 'coverage'
    const coverageBaseFolder =
      getInput('coverage-base-folder') || 'coverage-base'

    const githubWorkspace = process.env.GITHUB_WORKSPACE
    logInfo(`githubWorkspace:  ${githubWorkspace}`)

    if (!githubWorkspace) {
      throw new Error('process.env.GITHUB_WORKSPACE cannot be empty')
    }

    const gistProcessing = getBooleanInput('gist-processing')
    const gistToken = getInput('gist-token', {required: false}) || undefined
    const gistId = getInput('gist-id', {required: false}) || undefined

    if (gistProcessing) {
      if (!gistToken || !gistId) {
        throw new Error(
          'if gistProcessing not false, then gist-token and gist-id must be supplied'
        )
      }
    }
    const mainInputs: MainInputs = {
      coverageRan: !noCoverageRan,
      coverageFolder,
      coverageBaseFolder,
      token,
      githubWorkspace,
      gistProcessing,
      gistToken,
      gistId
    }

    await main(mainInputs)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFailed((error as any).message)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,github/no-then
run().catch((err: any) => {
  logError(err)
  setFailed(err.message)
})
