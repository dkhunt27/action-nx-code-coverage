import {
  BuildFileListInputs,
  ListCoverageFilesInputs,
  MergeFileListsInputs,
  ProcessCoverageFilesInputs
} from './interfaces'
import {
  FileListType,
  FinalFileListType,
  JcsMergedItemType,
  JcsMergedType,
  JcsParsedType,
  SummaryFileListType
} from './types'
import {debug as logDebug, warning as logWarn} from '@actions/core'
import {readFileSync, readdirSync, statSync} from 'fs'
import {TextReport} from './istanbul-reports-text'
import libCoverage from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import path from 'path'

export const processCoverageFiles = async ({
  workspacePath,
  coverageFolder,
  coverageBaseFolder
}: ProcessCoverageFilesInputs): Promise<JcsMergedType[]> => {
  // 1 - build list of coverage summary files
  // 2 - build list of base coverage summary files
  // 3 - build list of coverage final files
  // 4 - merge records
  const summaryFileList = await buildSummaryFileList({
    workspacePath,
    folder: coverageFolder
  })
  const baseSummaryFileList = await buildBaseSummaryFileList({
    workspacePath,
    folder: coverageBaseFolder
  })
  const finalFileList = await buildFinalFileList({
    workspacePath,
    folder: coverageFolder
  })
  const merged = mergeFileLists({
    summaryFileList,
    baseSummaryFileList,
    finalFileList
  })
  return merged
}

export const mergeFileLists = ({
  summaryFileList,
  baseSummaryFileList,
  finalFileList
}: MergeFileListsInputs): JcsMergedType[] => {
  const mergedList: JcsMergedType[] = []
  for (const jsonSum of summaryFileList) {
    let base: JcsMergedItemType | null = null
    let baseCoveragePct: number | null = null
    let diff: number | null = null

    const summary = buildMergeItem(jsonSum)
    const summaryCoveragePct =
      summary.parsedTotal.statements.pct.toString() === 'Unknown'
        ? 0
        : (summary.parsedTotal.statements.pct as number)

    const final = finalFileList.find(item => item.app === summary.app)
    const finalParsed = final ? final.parsed : ''
    if (!final) {
      throw new Error(
        `No coverage-final.json found for app: ${summary.app}. Make sure you ran both json-summary and text coverage reporters`
      )
    }

    const found = baseSummaryFileList.find(item => item.app === summary.app)
    if (found) {
      base = buildMergeItem(found)
      baseCoveragePct =
        base.parsedTotal.statements.pct === 'Unknown'
          ? 0
          : base.parsedTotal.statements.pct

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON
      // use Number.EPSILON so rounding of 0.0005 is correct
      diff =
        Math.round(
          (summaryCoveragePct - baseCoveragePct + Number.EPSILON) * 100
        ) / 100
    } else {
      // if not in base, assuming it is all new coverage so set base to 0
      baseCoveragePct = 0
      diff = summaryCoveragePct
    }

    // if in base but not in current, then assuming code didn't change so no need to output

    mergedList.push({
      app: summary.app,
      coverage: summaryCoveragePct,
      base: baseCoveragePct,
      diff,
      details: finalParsed
    })
  }

  return mergedList
}

export const buildMergeItem = (
  file: SummaryFileListType
): JcsMergedItemType => {
  const mergeItem = {} as JcsMergedItemType
  const jsonSumCopy = JSON.parse(JSON.stringify(file)) as SummaryFileListType
  mergeItem.app = jsonSumCopy.app
  mergeItem.parsedTotal = jsonSumCopy.parsed.total
  delete jsonSumCopy.parsed.total
  mergeItem.parsedOthers = jsonSumCopy.parsed
  return mergeItem
}

export const buildFinalFileList = async ({
  workspacePath,
  folder
}: BuildFileListInputs): Promise<FinalFileListType[]> => {
  logDebug(`buildFinalFileList: start`)
  const files = await listCoverageFiles({
    fileToFind: 'coverage-final.json',
    parseFileFn: parseJsonCoverageFinalFile,
    workspacePath,
    initDir: folder
  })
  if (files.length === 0) {
    throw new Error(
      `Did not find any json coverage final files with folder: ${folder}`
    )
  }
  logDebug(`finalFiles: ${JSON.stringify(files)}`)
  return files as FinalFileListType[]
}

export const buildSummaryFileList = async ({
  workspacePath,
  folder
}: BuildFileListInputs): Promise<SummaryFileListType[]> => {
  logDebug(`buildSummaryFileList: start`)
  const files = await listCoverageFiles({
    fileToFind: 'coverage-summary.json',
    parseFileFn: parseJsonCoverageSummaryFile,
    workspacePath,
    initDir: folder
  })
  if (files.length === 0) {
    throw new Error(
      `Did not find any json coverage summary files with folder: ${folder}`
    )
  }
  logDebug(`summaryFiles: ${JSON.stringify(files)}`)
  return files as SummaryFileListType[]
}

export const buildBaseSummaryFileList = async ({
  workspacePath,
  folder
}: BuildFileListInputs): Promise<SummaryFileListType[]> => {
  logDebug(`buildBaseSummaryFileList: start`)
  let files: FileListType[] = []
  try {
    files = await listCoverageFiles({
      fileToFind: 'coverage-summary.json',
      parseFileFn: parseJsonCoverageSummaryFile,
      workspacePath,
      initDir: folder
    })

    if (files.length === 0) {
      logWarn(
        `Skipping diff check due to not finding any base json coverage summary with folder: ${folder}`
      )
    }
  } catch (err) {
    logWarn(
      `Skipping diff check due to not finding any base json coverage summary with folder: ${folder}`
    )
  }

  logDebug(`baseSummaryFiles: ${JSON.stringify(files)}`)
  return files as SummaryFileListType[]
}

// https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
// List all coverage-summary.json files in a directory
export const listCoverageFiles = async ({
  fileToFind,
  parseFileFn,
  workspacePath,
  initDir,
  dir,
  results
}: ListCoverageFilesInputs): Promise<FileListType[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      dir = dir || initDir
      results = results || []

      // logDebug(`readdirSync-workspacePath', workspacePath)
      // logDebug(`readdirSync-dir', dir)

      const fileList = readdirSync(path.resolve(workspacePath, dir))

      // Write RegExp which filters makes leading .\ optional for files
      const reInitDir = new RegExp(`^(^\\.\\/)?${initDir.replace(/^\.\//, '')}`)

      for (const file of fileList) {
        const filePath = path.join(dir, file)

        // logDebug(`statSync-workspacePath', workspacePath)
        // logDebug(`statSync-filePath', filePath)

        if (statSync(path.resolve(workspacePath, filePath)).isDirectory()) {
          results = await listCoverageFiles({
            fileToFind,
            parseFileFn,
            workspacePath,
            initDir,
            dir: filePath,
            results
          })
        } else {
          if (filePath.endsWith(fileToFind)) {
            const fullFilePath = path.join(workspacePath, filePath)
            const parsed = await parseFileFn(fullFilePath)

            logDebug(`statSync-fullFilePath: ${fullFilePath}`)
            logDebug(`statSync-filePath: ${filePath}`)
            logDebug(`statSync-initDir: ${initDir}`)

            results.push({
              app: filePath
                .replace(reInitDir, '')
                .replace('/coverage-summary.json', '')
                .replace('/coverage-final.json', ''),
              parsed
            })

            // logDebug(`results: ${JSON.stringify(results, null, 2)}`)
          }
        }
      }

      return resolve(results)
    } catch (err) {
      return reject(err)
    }
  })
}

export const parseJsonCoverageSummaryFile = async (
  filePath: string
): Promise<JcsParsedType> => {
  return new Promise(resolve => {
    const data = readFileSync(filePath, 'utf8')
    const obj = JSON.parse(data)
    return resolve(obj as JcsParsedType)
  })
}

export const parseJsonCoverageFinalFile = async (
  filePath: string
): Promise<string> => {
  return new Promise(resolve => {
    const finalFile = JSON.parse(readFileSync(filePath).toString())
    const coverageMap = libCoverage.createCoverageMap(finalFile)

    // create a context for report generation
    const context = libReport.createContext({
      dir: 'report/output/dir',
      // The summarizer to default to (may be overridden by some reports)
      // values can be nested/flat/pkg. Defaults to 'pkg'
      defaultSummarizer: 'pkg',
      // watermarks: configWatermarks,
      coverageMap
    })

    const report = new TextReport({
      skipEmpty: false,
      skipFull: false
    })

    let textReport = ''

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const psw = process.stdout.write

    process.stdout.write = (...args): boolean => {
      textReport += args
      return true
    }

    // call execute to synchronously create and write the report to disk
    report.execute(context)

    process.stdout.write = psw

    return resolve(textReport)
  })
}
