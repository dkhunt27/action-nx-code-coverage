import {buildGistCoverageFileList, updateCoverageGist} from './badges'
import {buildParsedContext, upsertComment} from './github'
import {JcsMergedType} from './types'
import {MainInputs} from './interfaces'
import {omit as _omit} from 'lodash'
import {buildComment} from './comment'
import {log} from './logger'
import {processCoverageFiles} from './json-coverage'

export const main = async ({
  coverageRan,
  coverageFolder,
  coverageBaseFolder,
  token,
  githubWorkspace,
  gistToken,
  gistId
}: MainInputs): Promise<JcsMergedType[]> => {
  try {
    // hiddenHeader to help identify any previous PR comments
    const hiddenHeaderForCoverage = '<!-- nx-code-coverage -->'
    const hiddenHeaderNoCoverage = '<!-- nx-code-coverage-none -->'
    let commentBody = ''
    let hiddenHeader = ''
    let results: JcsMergedType[] = []

    if (coverageRan) {
      log('info', 'Coverage Ran', 'processing coverage files')
      results = await processCoverageFiles({
        workspacePath: githubWorkspace,
        coverageFolder,
        coverageBaseFolder
      })

      log('info', 'processCoverageFilesResults', _omit(results, 'details'))
      commentBody = buildComment({results})
      hiddenHeader = hiddenHeaderForCoverage
    } else {
      log('info', 'Coverage Not Ran', 'NOT processing coverage files')
      commentBody = 'No coverage ran'
      hiddenHeader = hiddenHeaderNoCoverage
    }

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
      // if not a PR, then should be push to main
      // therefore, should always have coverage

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
