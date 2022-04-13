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
import {existsSync} from 'fs'
import {processCoverageFiles} from './json-coverage'

const MAX_GH_COMMENT_SIZE = 65536

export const main = async ({
  coverageRan,
  coverageFolder,
  coverageBaseFolder,
  token,
  githubWorkspace,
  failOnCoverageDecrease,
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

    // check for coverage dir
    const coverageDirExists = existsSync(coverageFolder)

    if (coverageRan && coverageDirExists) {
      logInfo(`Coverage Ran: processing coverage files`)
      results = await processCoverageFiles({
        workspacePath: githubWorkspace,
        coverageFolder,
        coverageBaseFolder
      })

      logInfo(
        `processCoverageFilesResults: ${JSON.stringify(
          _omit(results, 'details'),
          null,
          2
        )}`
      )

      commentBody = buildComment({results})
      if (commentBody.length >= MAX_GH_COMMENT_SIZE) {
        commentBody = buildComment({results, compact: true})
      }
      hiddenHeader = hiddenHeaderForCoverage
    } else {
      logWarn(
        `Coverage Not Ran: NOT processing coverage files ${JSON.stringify({
          coverageRan,
          coverageDirExists
        })}`
      )
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

    if (failOnCoverageDecrease && coverageRan && coverageDirExists) {
      const badlyCovered = results.filter(
        result =>
          result.coverage > 0 && result.diff !== null && result.diff < -0.5
      )
      if (badlyCovered.length > 0) {
        throw new Error(
          `Code coverage is decreasing for projects: ${badlyCovered
            .map(p => p.app)
            .join(',')}`
        )
      }
    }

    return results
  } catch (error) {
    throw error
  }
}
