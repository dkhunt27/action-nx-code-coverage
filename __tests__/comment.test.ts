/* eslint-disable filenames/match-regex */
import {BuildCommentInputs} from '../src/interfaces'
import {buildComment} from '../src/comment'

describe('comment tests', () => {
  let mockDetails = ''
  beforeEach(() => {
    mockDetails =
      '------------------------------------|---------|----------|---------|---------|-------------------\nFile                                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s \n------------------------------------|---------|----------|---------|---------|-------------------\nAll files                           | statements |   96.42 | statements |       60 | branches |   96.66 | functions |   96.59 | lines |                   | low \n app                                | statements |   95.83 | statements |      100 | branches |   85.71 | functions |   95.23 | lines |                   | low \n  app.controller.ts                 | statements |   84.61 | statements |      100 | branches |   66.66 | functions |   81.81 | lines | 20-25             | low \n  app.module.ts                     | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  app.service.ts                    | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n app/interfaces                     | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  aws-s3-provider.interface.ts      | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  generate-pdf-service.interface.ts | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  html-pdf-provider.interface.ts    | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  lambda-service.interface.ts       | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  pdf-service.interface.ts          | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  strapi-service.interface.ts       | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  template-service.interface.ts     | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  uuid-provider.interface.ts        | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n app/services/generate-pdf          | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  generate-pdf.service.ts           | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n app/services/lambda                | statements |   89.47 | statements |       50 | branches |     100 | functions |   91.17 | lines |                   | low \n  lambda.service.ts                 | statements |   89.47 | statements |       50 | branches |     100 | functions |   91.17 | lines | 33,49-51          | low \n app/services/pdf                   | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  pdf.service.ts                    | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n app/services/strapi                | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  strapi.service.ts                 | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n app/services/template              | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n  template.service.ts               | statements |     100 | statements |      100 | branches |     100 | functions |     100 | lines |                   | medium \n------------------------------------|---------|----------|---------|---------|-------------------\n'
  })
  describe('buildComment', () => {
    describe('detailed output', () => {
      test('when results empty then empty code coverage comment', () => {
        const input: BuildCommentInputs = {results: []}
        const actual = buildComment(input)
        expect(actual).toStrictEqual('Code Coverage:<p></p>')
      })

      test('when result base/diff null then no diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: null,
              diff: null,
              details: mockDetails
            }
          ]
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p><table><tbody><tr><th>app A</th><th>50.00%</th></tr></tbody></table>'
        )
      })
      test('when result diff is 0 then nothing is displayed in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 50,
              diff: 0,
              details: mockDetails
            },
            {
              app: 'app B',
              coverage: 55,
              base: 50,
              diff: 5,
              details: mockDetails
            }
          ]
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p><table><tbody><tr><th>app B</th><th>55.00%</th><th>✅ ▴ +5.00%</th></tr></tbody></table>'
        )
      })
      test('when result diff is negative then negative diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 75,
              diff: -25,
              details: mockDetails
            }
          ]
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p><table><tbody><tr><th>app A</th><th>50.00%</th><th>❌ ▾ -25.00%</th></tr></tbody></table>'
        )
      })
      test('when result diff is positive then positive diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 25,
              diff: 25,
              details: mockDetails
            }
          ]
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p><table><tbody><tr><th>app A</th><th>50.00%</th><th>✅ ▴ +25.00%</th></tr></tbody></table>'
        )
      })
      test('renders multiple results', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 25,
              diff: 25,
              details: mockDetails
            },
            {
              app: 'app B',
              coverage: 50,
              base: 75,
              diff: -25,
              details: mockDetails
            }
          ]
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p><table><tbody><tr><th>app A</th><th>50.00%</th><th>✅ ▴ +25.00%</th></tr></tbody></table>'
        )
        expect(actual).toContain(
          '<table><tbody><tr><th>app B</th><th>50.00%</th><th>❌ ▾ -25.00%</th></tr></tbody></table>'
        )
      })
    })
    describe('compact mode', () => {
      test('when results empty then empty code coverage comment', () => {
        const actual = buildComment({results: [], compact: true})
        expect(actual).toStrictEqual('Code Coverage:<p></p>')
      })

      test('when result base/diff null then no diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: null,
              diff: null,
              details: mockDetails
            }
          ],
          compact: true
        }
        const actual = buildComment(input)
        expect(actual).toContain('<tr><td>app A</td><td>50.00%</td></tr>')
      })
      test('when result diff is 0 then display nothing in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 50,
              diff: 0,
              details: mockDetails
            },
            {
              app: 'app B',
              coverage: 55,
              base: 50,
              diff: 5,
              details: mockDetails
            }
          ],
          compact: true
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          '<td>app B</td><td>55.00%</td><td>✅ ▴ +5.00%</td></tr>'
        )
      })
      test('when result diff is negative then negative diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 75,
              diff: -25,
              details: mockDetails
            }
          ],
          compact: true
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          '<tr><td>app A</td><td>50.00%</td><td>❌ ▾ -25.00%</td></tr>'
        )
      })
      test('when result diff is positive then positive diff in code coverage comment', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 25,
              diff: 25,
              details: mockDetails
            }
          ],
          compact: true
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          '<tr><td>app A</td><td>50.00%</td><td>✅ ▴ +25.00%</td></tr>'
        )
      })
      test('renders multiple results', async () => {
        const input: BuildCommentInputs = {
          results: [
            {
              app: 'app A',
              coverage: 50,
              base: 25,
              diff: 25,
              details: mockDetails
            },
            {
              app: 'app B',
              coverage: 50,
              base: 75,
              diff: -25,
              details: mockDetails
            }
          ],
          compact: true
        }
        const actual = buildComment(input)
        expect(actual).toContain(
          'Code Coverage:<p></p>' +
            '<table><tbody>' +
            '<tr><th>Project</th><th>Coverage</th><th>Delta</th></tr>' +
            '<tr><td>app A</td><td>50.00%</td><td>✅ ▴ +25.00%</td></tr>' +
            '<tr><td>app B</td><td>50.00%</td><td>❌ ▾ -25.00%</td></tr>' +
            '</tbody></table>'
        )
      })
    })
  })
})
