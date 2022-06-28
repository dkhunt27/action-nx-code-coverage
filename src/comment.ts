import {details, fragment, summary, table, tbody, td, th, tr} from './html'
import {BuildCommentInputs} from './interfaces'
import {tabulate} from './tabulate'

const renderEmoji = (diff: number): string => {
  if (diff < 0) return '❌'

  return '✅'
}

export const buildComment = ({
  results,
  compact
}: BuildCommentInputs): string => {
  const html = results.map(result => {
    let plus = ''
    let arrow = ''
    let diffHtml = ''

    if (result.diff !== null) {
      if (result.diff === 0) {
        return ''
      }
      if (result.diff < 0) {
        arrow = '▾'
      } else if (result.diff > 0) {
        plus = '+'
        arrow = '▴'
      }

      diffHtml = (compact ? td : th)(
        renderEmoji(result.diff),
        ' ',
        arrow,
        ' ',
        plus,
        result.diff.toFixed(2),
        '%'
      )
    }

    if (compact) {
      return tr(td(result.app), td(result.coverage.toFixed(2), '%'), diffHtml)
    }

    const htmlResults = tabulate(result.details)

    return `${table(
      tbody(tr(th(result.app), th(result.coverage.toFixed(2), '%'), diffHtml))
    )} \n\n ${details(summary('Coverage Report'), htmlResults)} <br/>`
  })

  const title = `Code Coverage:<p></p>`

  if (compact) {
    return fragment(
      title,
      html.length
        ? table(
            tbody(tr(th('Project'), th('Coverage'), th('Delta')), html.join(''))
          )
        : ''
    )
  }

  return fragment(title, html.join(''))
}
