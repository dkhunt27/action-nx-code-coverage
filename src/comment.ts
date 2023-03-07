import {details, fragment, summary, table, tbody, th, tr} from './html'
import {BuildCommentInputs} from './interfaces'
import {tabulate} from './tabulate'

const renderEmoji = (diff: number): string => {
  if (diff < 0) return '❌'

  return '✅'
}

export const buildComment = ({results}: BuildCommentInputs): string => {
  const html = results.map(result => {
    let plus = ''
    let arrow = ''
    let diffHtml = ''

    if (result.diff !== null) {
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

    const htmlResults = tabulate(result.details)
 
    if(typeof result.coverage === 'string') {
       return `${table(
      tbody(tr(th(result.app), th('unknown', '%'), diffHtml))
    )} \n\n ${details(summary('Coverage Report'), htmlResults)} <br/>`
    }

    return `${table(
      tbody(tr(th(result.app), th(result.coverage.toFixed(2), '%'), diffHtml))
    )} \n\n ${details(summary('Coverage Report'), htmlResults)} <br/>`
  })

  const title = `Code Coverage:<p></p>`

  return fragment(title, html.join(''))
}
