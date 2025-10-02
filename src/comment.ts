import {details, fragment, summary, table, tbody, th, tr} from './html'
import {BuildCommentInputs} from './interfaces'
import {tabulate} from './tabulate'

const renderEmoji = (diff: number): string => {
  if (diff < 0) return '❌'

  return '✅'
}

export const buildComment = ({
  results,
  hideCoverageReports,
  hideUnchanged
}: BuildCommentInputs): string => {
  const rows = results
    .map(result => {
      let plus = ''
      let arrow = ''
      let diffHtml = ''

      // when no tests, not sure if output is undefined or 'Unknown'; TODO: add test case
      if (
        result.diff !== undefined &&
        result.diff !== null &&
        (result.diff as unknown) !== 'Unknown'
      ) {
        if (result.diff < 0) {
          arrow = '▾'
        } else if (result.diff > 0) {
          plus = '+'
          arrow = '▴'
        }

        diffHtml = th(
          renderEmoji(result.diff),
          ' ',
          arrow,
          ' ',
          plus,
          result.diff.toFixed(2),
          '%'
        )
      }

      // when no tests, not sure if is undefined or 'Unknown'; TODO: add test case
      let coverage
      if (
        result.coverage === undefined ||
        result.coverage === null ||
        (result.coverage as unknown) === 'Unknown'
      ) {
        coverage = 'unknown'
      } else {
        coverage = result.coverage.toFixed(2)
      }

      if (result.diff === 0 && hideUnchanged) {
        return {
          row: '',
          htmlResults: ''
        }
      } else {
        const htmlResults = tabulate(result.details)
        return {
          row: tr(
            th(result.app.replace(/^\/+/g, '')),
            th(coverage, '%'),
            diffHtml
          ),
          htmlResults
        }
      }
    })
    .filter(row => row.row !== '')

  const tableHtml = hideCoverageReports
    ? table(tbody(rows.map(row => row.row).join('')))
    : rows
        .map(
          row =>
            `${table(tbody(row.row))} \n\n ${details(summary('Coverage Report'), row.htmlResults)} <br/>`
        )
        .join('')

  const title = `<h2>Code Coverage</h2>`
  return fragment(title, tableHtml)
}
