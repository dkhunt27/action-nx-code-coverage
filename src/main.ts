import {buildGistCoverageFileList, updateCoverageGist} from './badges'
import {buildParsedContext, upsertComment} from './github'
import {JcsMergedType} from './types'
import {MainInputs} from './interfaces'
import {omit as _omit} from 'lodash'
import {buildComment} from './comment'
import {log} from './logger'
import {processCoverageFiles} from './json-coverage'

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
  githubWorkspace,
  gistToken,
  gistId
}: MainInputs): Promise<JcsMergedType[]> => {
  try {
    const results = await processCoverageFiles({
      workspacePath: githubWorkspace,
      coverageFolder,
      coverageBaseFolder
    })

    log('info', 'processCoverageFilesResults', _omit(results, 'details'))

    // hiddenHeader to help identify any previous PR comments
    const hiddenHeader = '<!-- nx-code-coverage -->'

    const commentBody = buildComment({results})

    log('debug', 'commentBody', commentBody)

    const parsedContext = buildParsedContext()

    if (parsedContext.pullRequestNumber !== -1) {
      log('info', 'PR Detected', 'Updating the PR Comment with Code Coverage')
      await upsertComment({
        token,
        body: commentBody,
        hiddenHeader,
        prNumber: parsedContext.pullRequestNumber,
        repoOwner: parsedContext.repoOwner,
        repoRepo: parsedContext.repoRepo
      })
    } else {
      log(
        'info',
        'No PR Detected',
        'Updating the Coverage Gist with Code Coverage'
      )

      const files = buildGistCoverageFileList(results)

      updateCoverageGist({
        files,
        gistToken,
        gistId
      })
    }

    return results

    // TODO: update gist with coverage results
  } catch (error) {
    throw error
  }
}
