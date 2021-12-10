import {
  LCOVStats,
  ParsedContextType,
  TabulateOptionsType
} from './interfaces-types'
import {a, b, fragment, table, tbody, td, th, tr} from './html'
import {LCOVRecord} from 'parse-lcov'

// this takes a builds a table format
//
// summary table
//

const filename = (
  lcovRecord: LCOVRecord,
  indent: boolean,
  options: TabulateOptionsType
): string => {
  const relative = lcovRecord.file.replace(options.prefix, '')
  const href = `https://github.com/${options.repository}/blob/${options.commit}/${relative}`
  const parts = relative.split('/')
  const last = parts[parts.length - 1]
  const space = indent ? '&nbsp; &nbsp;' : ''

  return fragment(space, a({href}, last))
}

const percentage = (lcovStat: LCOVStats): string => {
  if (!lcovStat) {
    return 'N/A'
  }

  const value =
    lcovStat.found === 0 ? 100 : (lcovStat.hit / lcovStat.found) * 100
  const rounded = value.toFixed(2).replace(/\.0*$/u, '')

  const tag = value === 100 ? fragment : b

  return tag(`${rounded}%`)
}

const uncovered = (
  lcovRecord: LCOVRecord,
  options: TabulateOptionsType
): string => {
  const branches = (lcovRecord.branches ? lcovRecord.branches.details : [])
    .filter(branch => branch.taken === 0)
    .map(branch => branch.line)

  const lines = (lcovRecord.lines ? lcovRecord.lines.details : [])
    .filter(line => line.hit === 0)
    .map(line => line.line)

  const all = [...branches, ...lines].sort((x, y) => x - y)

  return all
    .map(line => {
      const relative = lcovRecord.file.replace(options.prefix, '')
      const href = `https://github.com/${options.repository}/blob/${options.commit}/${relative}#L${line}`

      return a({href}, line)
    })
    .join(', ')
}

const toRow = (
  lcovRecord: LCOVRecord,
  indent: boolean,
  options: TabulateOptionsType
): string => {
  return tr(
    td(filename(lcovRecord, indent, options)),
    td(percentage(lcovRecord.branches)),
    td(percentage(lcovRecord.functions)),
    td(percentage(lcovRecord.lines)),
    td(uncovered(lcovRecord, options))
  )
}

const toFolder = (path: string): string => {
  if (path === '') {
    return ''
  }

  return tr(td({colspan: 5}, b(path)))
}

// Tabulate the lcov data in a HTML table.
export const tabulateLcov = (
  lcovRecords: LCOVRecord[],
  options: TabulateOptionsType
): string => {
  const head = tr(
    th('File'),
    th('Branches'),
    th('Funcs'),
    th('Lines'),
    th('Uncovered Lines')
  )

  const folders: Record<string, LCOVRecord[]> = {}
  for (const lcovRecord of lcovRecords) {
    const parts = lcovRecord.file.replace(options.prefix, '').split('/')
    const folder = parts.slice(0, -1).join('/')
    folders[folder] = folders[folder] || []
    folders[folder].push(lcovRecord)
  }

  const rows = Object.keys(folders)
    .sort((x, y) => x.localeCompare(y))
    .reduce((acc, key) => {
      return [
        ...acc,
        toFolder(key),
        ...folders[key].map(file => toRow(file, key !== '', options))
      ]
    }, [] as string[])

  return table(tbody(head, ...rows))
}

export const buildTabulateOptionsFromParsedContext = (
  parsedContext: ParsedContextType,
  githubWorkspace: string
): TabulateOptionsType => {
  const result: TabulateOptionsType = {
    repository: parsedContext.repositoryFullName,
    commit: parsedContext.pullRequestHeadSha,
    prefix: githubWorkspace,
    head: parsedContext.pullRequestHeadRef,
    base: parsedContext.pullRequestBaseRef
  }

  return result
}

export const tabulate = (results: string): string => {
  const parts = results.split('\n')
  parts.pop()
  parts.pop()
  parts.splice(2, 1)
  parts.splice(0, 1)
  const rows = []

  // parse header row
  let innerParts = parts[0].split('|')

  let cols = []
  for (const piece of innerParts) {
    cols.push(th(piece))
  }
  rows.push(tr(cols.join('')))
  parts.shift()

  // parse other rows
  const skipColumns = [' statements ', ' branches ', ' functions ', ' lines ']
  for (const part of parts) {
    innerParts = part.split('|')
    innerParts.pop()

    cols = []
    for (let piece of innerParts) {
      if (!skipColumns.includes(piece)) {
        piece = piece.replace(/\s/, '&nbsp;')
        cols.push(td(piece))
      }
    }
    rows.push(tr(cols.join('')))
  }

  return `${table(tbody(rows.join('')))}`
}
