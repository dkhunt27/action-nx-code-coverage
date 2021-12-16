import {buildParsedContext, upsertComment} from './github'
import {IMainInputs} from './interfaces-types'
import {buildComment} from './comment'
import {log} from './logger'
import {processCoverageFiles} from './json-coverage'
import {setFailed} from '@actions/core'

// 1 - build list of lcov files
// 2 - build list of base lcov files
// 3 - parse records
// 4 - summarize record
// 5 - merge records
// 6 - build table/html
// 7 - update/create comment

export const main = async ({
  coverageFolder,
  coverageBaseFolder,
  token,
  githubWorkspace
}: IMainInputs): Promise<void> => {
  try {
    const results = await processCoverageFiles({
      workspacePath: githubWorkspace,
      coverageFolder,
      coverageBaseFolder
    })

    log('info', 'processCoverageFilesResults', results)

    // hiddenHeader to help identify any previous PR comments
    const hiddenHeader = '<!-- nx-code-coverage -->'

    const commentBody = buildComment({results})

    log('debug', 'commentBody', commentBody)

    const parsedContext = buildParsedContext()

    if (parsedContext.pullRequestNumber !== -1) {
      // only upsert comments for PRs
      await upsertComment({
        token,
        body: commentBody,
        hiddenHeader,
        prNumber: parsedContext.pullRequestNumber,
        repoOwner: parsedContext.repoOwner,
        repoRepo: parsedContext.repoRepo
      })
    }

    // TODO: update gist with coverage results
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFailed((error as any).message)
  }
}
