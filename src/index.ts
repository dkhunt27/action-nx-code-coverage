import {getInput, setFailed} from '@actions/core'
import {IMainInputs} from './interfaces-types'
import {main} from './main'

async function run(): Promise<void> {
  try {
    const token = getInput('github-token')
    const lcovFolder = getInput('lcov-folder')
    const lcovBaseFolder = getInput('lcov-base-folder')

    const githubWorkspace = process.env.GITHUB_WORKSPACE
    if (!githubWorkspace) {
      throw new Error('process.env.GITHUB_WORKSPACE cannot be empty')
    }

    const mainInputs: IMainInputs = {
      lcovFolder,
      lcovBaseFolder,
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
