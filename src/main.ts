import * as core from '@actions/core'
import {IMainInputs, LcovResultType} from './interfaces-types'
import {buildParsedContext, upsertComment} from './github'
import {
  mergeLcovResults,
  parseLcovFile,
  processLcovBaseFiles,
  processLcovFiles
} from './lcov'
import {LCOVRecord} from 'parse-lcov'
import {buildComment} from './comment'
import {buildTabulateOptionsFromParsedContext} from './tabulate'

export const main = async ({
  lcovFolder,
  lcovBaseFolder,
  token,
  githubWorkspace
}: IMainInputs): Promise<void> => {
  try {
    const parsedContext = buildParsedContext()
    const tabulateOptions = buildTabulateOptionsFromParsedContext(
      parsedContext,
      githubWorkspace
    )

    const lcovFiles = await processLcovFiles(lcovFolder)
    const lcovBaseFiles = await processLcovBaseFiles(lcovBaseFolder)
    const lcovList = mergeLcovResults(lcovFiles, lcovBaseFiles)

    const lcovResults: LcovResultType[] = []
    for (const lcovItem of lcovList) {
      const lcov = parseLcovFile(lcovItem.lcov.fullPath)
      let base: LCOVRecord[] = []
      if (lcovItem.base) {
        base = parseLcovFile(lcovItem.lcov.fullPath)
      }

      lcovResults.push({
        key: lcovItem.lcov.lcovKey,
        lcov,
        base
      })
    }

    // hiddenHeader to help identify any previous PR comments
    const hiddenHeader = '<!-- nx-code-coverage -->'

    const body = buildComment(lcovResults, tabulateOptions)

    // eslint-disable-next-line no-console
    console.log({body})

    await upsertComment({
      token,
      body,
      hiddenHeader,
      prNumber: parsedContext.pullRequestNumber,
      repoOwner: parsedContext.repoOwner,
      repoRepo: parsedContext.repoRepo
    })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    core.setFailed((error as any).message)
  }
}
