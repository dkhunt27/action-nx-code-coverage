import {getInput} from '@actions/core'

export const log = (
  level: 'warn' | 'info' | 'debug',
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): void => {
  const debug = getInput('debug') === 'true' || false

  // if (debug) {
  if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.log(`WARNING: ${name}`, value)
  }

  if (level === 'info') {
    // eslint-disable-next-line no-console
    console.log(name, value)
  }

  if (level === 'debug') {
    if (debug) {
      // eslint-disable-next-line no-console
      console.log(`DEBUG: ${name}`, value)
    }
  }
  // setOutput didn't seem like it was working
  // } else {
  //   if (level === 'warn') {
  //     setOutput(`WARNING: ${name}`, value)
  //   }

  //   if (level === 'info') {
  //     setOutput(name, value)
  //   }

  //   if (level === 'debug') {
  //     setOutput(`DEBUG: ${name}`, value)
  //   }
  // }

  return
}
