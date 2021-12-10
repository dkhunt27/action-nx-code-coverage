import {
  LcovFileResultType,
  LcovResultType,
  LcovSummaryRecord
} from './interfaces-types'
import parseLCOV, {LCOVRecord} from 'parse-lcov'
import {readFileSync, readdirSync, statSync} from 'fs'
import {log} from './logger'
import path from 'path'
import {setOutput} from '@actions/core'

// // 1 - build list of lcov files
// // 2 - build list of base lcov files
// // 3 - process file (parse, summarize, calc)
// // 4 - merge records

// export const finalizeLcovData = async (
//   githubWorkspace: string,
//   lcovFolder: string,
//   lcovBaseFolder: string
// ) => {
//   const lcovFileList = await buildLcovFileList(githubWorkspace, lcovFolder)
//   const baseFileList = await buildLcovBaseFileList(
//     githubWorkspace,
//     lcovBaseFolder
//   )
//   // eslint-disable-next-line no-console
//   console.log({lcovFileList, baseFileList})

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const lcovProcessed: Record<string, any> = {}
//   for (const lcov of lcovFileList) {
//     const parsed = parseLcovFile(lcov.fullPath)
//     const summary = summarizeLcovRecords(parsed)
//     const lcovKey = buildLcovKey(lcov.lcovPath)
//     lcovProcessed[lcovKey] = {
//       parsed,
//       summary
//     }
//   }

//   const baseProcessed: Record<string, any> = {}
//   for (const base of baseFileList) {
//     const parsed = parseLcovFile(base.fullPath)
//     const summary = summarizeLcovRecords(parsed)
//     const lcovKey = buildLcovBaseKey(base.lcovPath)
//     baseProcessed[lcovKey] = {
//       parsed,
//       summary
//     }
//   }

//   const results = mergeLcovAndBase(lcovFileList, lcovBaseFiles)

//   // eslint-disable-next-line no-console
//   console.log({lcovResults: JSON.stringify(lcovResults, null, 2)})
// }

// https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
// List all lcov.info files in a directory
export const listLcovFiles = async (
  workspacePath: string,
  initDir: string,
  dir = '',
  files: LcovFileResultType[] = []
): Promise<LcovFileResultType[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      dir = dir || initDir

      log('debug', 'workspacePath', workspacePath)
      log('debug', 'dir', dir)

      const fileList = readdirSync(path.resolve(workspacePath, dir))

      for (const file of fileList) {
        const filePath = path.join(dir, file)

        log('debug', 'workspacePath', workspacePath)
        log('debug', 'filePath', filePath)

        if (statSync(path.resolve(workspacePath, filePath)).isDirectory()) {
          files = await listLcovFiles(workspacePath, initDir, filePath, files)
        } else {
          if (filePath.endsWith('lcov.info')) {
            const fullFilePath = path.join(workspacePath, filePath)
            files.push({
              path: filePath,
              fullPath: fullFilePath,
              lcovPath: filePath.replace(initDir, '')
            })
          }
        }
      }

      return resolve(files)
    } catch (err) {
      return reject(err)
    }
  })
}

export const buildLcovFileList = async (
  workspacePath: string,
  lcovFolder: string
): Promise<LcovFileResultType[]> => {
  log('debug', 'workspacePath', workspacePath)
  log('debug', 'lcovFolder', lcovFolder)

  const lcovFiles = await listLcovFiles(workspacePath, lcovFolder)
  if (lcovFiles.length === 0) {
    throw new Error(
      `Did not find any lcov files with lcovFolder: ${lcovFolder}`
    )
  }
  setOutput('lcovFiles', lcovFiles)
  return lcovFiles
}

export const buildLcovBaseFileList = async (
  workspacePath: string,
  lcovBaseFolder: string
): Promise<LcovFileResultType[]> => {
  const lcovBaseFiles = await listLcovFiles(workspacePath, lcovBaseFolder)
  if (lcovBaseFiles.length === 0) {
    log(
      'warn',
      'Skipping diff check due to not finding any base lcov files with lcovBaseFolder',
      lcovBaseFolder
    )
  }
  setOutput('lcovBaseFiles', lcovBaseFiles)
  return lcovBaseFiles
}

export const mergeLcovResults = (
  lcovFiles: LcovFileResultType[],
  lcovBaseFiles: LcovFileResultType[]
): LcovResultType[] => {
  const merged = []
  for (const lcov of lcovFiles) {
    const found = lcovBaseFiles.find(item => item.lcovPath === lcov.lcovPath)
    // const lcovParsed = parseLcovFile(lcov.fullPath)
    // const lcovSummary = summarizeLcovRecords(lcovParsed)
    // const lcovBaseParsed = found ? parseLcovFile(found.fullPath) : null
    // const lcovBaseSummary = lcovBaseParsed
    //   ? summarizeLcovRecords(lcovBaseParsed)
    //   : null

    merged.push({
      // key: lcov.lcovPath,
      key: lcov.lcovPath.replace('coverage/', '').replace('/lcov.info', ''),
      appName: lcov.lcovPath,
      lcov: parseLcovFile(lcov.fullPath),
      base: found ? parseLcovFile(found.fullPath) : null
    })
  }
  // TODO: do we need to loop through base and find ones without matching lcov?
  return merged
}

// Parse lcov string into lcov data
export const parseLcovFile = (filePath: string): LCOVRecord[] => {
  const data = readFileSync(filePath, 'utf8')
  return parseLCOV(data)
}

export const calculatePercentage = (num: number): number => {
  return Math.round((num * 100 + Number.EPSILON) * 100) / 100
}

// TODO: create output type

export const summarizeLcovRecords = (
  lcovRecords: LCOVRecord[]
): LcovSummaryRecord => {
  const summary: LcovSummaryRecord = {
    statements: {
      hit: 0,
      found: 0,
      percentage: 0
    },
    branches: {
      hit: 0,
      found: 0,
      percentage: 0
    },
    functions: {
      hit: 0,
      found: 0,
      percentage: 0
    },
    lines: {
      hit: 0,
      found: 0,
      percentage: 0
    }
  }

  for (const entry of lcovRecords) {
    summary.branches.hit += entry.branches.hit
    summary.branches.found += entry.branches.found
    summary.functions.hit += entry.functions.hit
    summary.functions.found += entry.functions.found
    summary.lines.hit += entry.lines.hit
    summary.lines.found += entry.lines.found
  }

  // TODO: this can double count lines between function/branch/line
  summary.statements.hit =
    summary.branches.hit + summary.functions.hit + summary.lines.hit
  summary.statements.found =
    summary.branches.found + summary.functions.found + summary.lines.found

  summary.statements.percentage = calculatePercentage(
    summary.statements.hit / summary.statements.found
  )
  summary.branches.percentage = calculatePercentage(
    summary.branches.hit / summary.branches.found
  )
  summary.functions.percentage = calculatePercentage(
    summary.functions.hit / summary.functions.found
  )
  summary.lines.percentage = calculatePercentage(
    summary.lines.hit / summary.lines.found
  )

  return summary
}

// Get the total coverage percentage from the lcov data.
export const percentage = (data: LCOVRecord[]): number => {
  let hit = 0
  let found = 0
  for (const entry of data) {
    hit += entry.lines.hit
    found += entry.lines.found
  }

  return (hit / found) * 100
}

// const buildLcovKey = (lcovPath: string): string => {
//   return lcovPath.replace('coverage/', '').replace('/lcov.info', '')
// }

// const buildLcovBaseKey = (lcovPath: string): string => {
//   return lcovPath.replace('coverage-base/', '').replace('/lcov.info', '')
// }
