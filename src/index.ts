import {getInput, setFailed} from '@actions/core'
import {IMainInputs} from './interfaces-types'
import {log} from './logger'
import {main} from './main'

async function run(): Promise<void> {
  try {
    const token = getInput('github-token')
    const coverageFolder = getInput('coverage-folder') || './coverage'
    const coverageBaseFolder =
      getInput('coverage-base-folder') || './coverage-base'

    const githubWorkspace = process.env.GITHUB_WORKSPACE
    log('info', 'githubWorkspace', githubWorkspace)

    if (!githubWorkspace) {
      throw new Error('process.env.GITHUB_WORKSPACE cannot be empty')
    }

    const mainInputs: IMainInputs = {
      coverageFolder,
      coverageBaseFolder,
      token,
      githubWorkspace
    }

    await main(mainInputs)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFailed((error as any).message)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,github/no-then
run().catch((err: any) => {
  // eslint-disable-next-line no-console
  console.error(err)
  setFailed(err.message)
})
