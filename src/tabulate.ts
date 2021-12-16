import {table, tbody, td, th, tr} from './html'

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
