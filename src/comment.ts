import {LcovResultType, TabulateOptionsType} from './interfaces-types'
import {b, details, fragment, summary, table, tbody, th, tr} from './html'
import {LCOVRecord} from 'parse-lcov'
import {percentage} from './lcov'
import {tabulate} from './tabulate'

const renderEmoji = (diff: number): string => {
  if (diff < 0) return '❌'

  return '✅'
}

const findDifferences = (
  first: LCOVRecord[],
  second: LCOVRecord[]
): LCOVRecord[] => {
  return first.filter(fItem => {
    return second.some(sItem => {
      return (
        sItem.lines.found === fItem.lines.found &&
        sItem.lines.hit === fItem.lines.hit
      )
    })
  })
}

export const buildComment = (
  lcovResults: LcovResultType[],
  options: TabulateOptionsType
): string => {
  const html = lcovResults.map(lcovResult => {
    const before = lcovResult.base ? percentage(lcovResult.base) : 0
    const after = lcovResult.base ? percentage(lcovResult.lcov) : 0
    const diff = after - before
    const plus = diff > 0 ? '+' : ''

    let arrow = ''
    if (diff < 0) {
      arrow = '▾'
    } else if (diff > 0) {
      arrow = '▴'
    }

    const diffHtml = lcovResult.base
      ? th(renderEmoji(diff), ' ', arrow, ' ', plus, diff.toFixed(2), '%')
      : ''
    let report = lcovResult.lcov

    if (lcovResult.base) {
      const onlyInLcov = findDifferences(lcovResult.lcov, lcovResult.base)
      const onlyInBefore = findDifferences(lcovResult.base, lcovResult.lcov)
      report = onlyInBefore.concat(onlyInLcov)
    }

    return `${table(
      tbody(
        tr(
          th(lcovResult.key),
          th(percentage(lcovResult.lcov).toFixed(2), '%'),
          diffHtml
        )
      )
    )} \n\n ${details(
      summary('Coverage Report'),
      tabulate(report, options)
    )} <br/>`
  })

  const title = `Coverage after merging into ${b(options.base)} <p></p>`

  return fragment(title, html.join(''))
}
