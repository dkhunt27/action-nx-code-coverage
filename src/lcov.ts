import parseLCOV, {LCOVRecord} from 'parse-lcov'
import {readFileSync, readdirSync, statSync} from 'fs'
import {LcovFileResultType} from './interfaces-types'
import path from 'path'
import {setOutput} from '@actions/core'

// https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
// List all lcov.info files in a directory
export const listLcovFiles = async (
  initDir: string,
  dir = '',
  files: LcovFileResultType[] = []
): Promise<LcovFileResultType[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      dir = dir || initDir

      const fileList = readdirSync(path.resolve(__dirname, dir))

      for (const file of fileList) {
        const filePath = path.join(dir, file)

        if (statSync(path.resolve(__dirname, filePath)).isDirectory()) {
          files = await listLcovFiles(initDir, filePath, files)
        } else {
          if (filePath.endsWith('lcov.info')) {
            const fullFilePath = path.join(__dirname, filePath)
            files.push({
              path: filePath,
              fullPath: fullFilePath,
              lcovKey: filePath.replace(initDir, '')
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

export const processLcovFiles = async (
  lcovFolder: string
): Promise<LcovFileResultType[]> => {
  const lcovFiles = await listLcovFiles(lcovFolder, lcovFolder)
  if (lcovFiles.length === 0) {
    throw new Error(
      `Did not find any lcov files with lcovFolder: ${lcovFolder}`
    )
  }
  setOutput('lcovFiles', lcovFiles)
  return lcovFiles
}

export const processLcovBaseFiles = async (
  lcovBaseFolder: string
): Promise<LcovFileResultType[]> => {
  const lcovBaseFiles = await listLcovFiles(lcovBaseFolder, lcovBaseFolder)
  if (lcovBaseFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Warning skipping diff check due to not finding any base lcov files with lcovBaseFolder: ${lcovBaseFolder}`
    )
  }
  setOutput('lcovBaseFiles', lcovBaseFiles)
  return lcovBaseFiles
}

export const mergeLcovResults = (
  lcovFiles: LcovFileResultType[],
  lcovBaseFiles: LcovFileResultType[]
): {lcov: LcovFileResultType; base: LcovFileResultType | undefined}[] => {
  const merged = []
  for (const file of lcovFiles) {
    const found = lcovBaseFiles.find(item => item.lcovKey === file.lcovKey)
    merged.push({
      lcov: file,
      base: found
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
