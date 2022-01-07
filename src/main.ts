import {buildGistCoverageFileList, updateCoverageGist} from './badges'
import {buildParsedContext, upsertComment} from './github'
import {
  debug as logDebug,
  info as logInfo,
  warning as logWarn
} from '@actions/core'
import {JcsMergedType} from './types'
import {MainInputs} from './interfaces'
import {omit as _omit} from 'lodash'
import {buildComment} from './comment'
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
      logInfo(`Coverage Ran: processing coverage files`)
      results = await processCoverageFiles({
        workspacePath: githubWorkspace,
        coverageFolder,
        coverageBaseFolder
      })

      logInfo(`processCoverageFilesResults: ${_omit(results, 'details')}`)
      commentBody = buildComment({results})
      hiddenHeader = hiddenHeaderForCoverage
    } else {
      logWarn(`Coverage Not Ran: NOT processing coverage files`)
      commentBody = 'No coverage ran'
      hiddenHeader = hiddenHeaderNoCoverage
    }

    logDebug(`commentBody: ${commentBody}`)

    const parsedContext = buildParsedContext()

    if (parsedContext.pullRequestNumber !== -1) {
      logInfo(`PR Detected: Updating the PR Comment with Code Coverage`)
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

      logInfo(`No PR Detected: Updating the Coverage Gist with Code Coverage`)

      const files = buildGistCoverageFileList(results)

      updateCoverageGist({files, gistToken, gistId})
    }

    return results
  } catch (error) {
    throw error
  }
}
