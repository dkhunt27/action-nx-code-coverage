import {
  debug as logDebug,
  info as logInfo,
  warning as logWarning
} from '@actions/core'

export const log = (
  level: 'warn' | 'info' | 'debug',
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
): void => {
  if (level === 'warn') {
    logWarning(`WARNING: ${name}`, value)
  }

  if (level === 'info') {
    logInfo(`${name} ${value}`)
  }

  if (level === 'debug') {
    logDebug(`${name} ${value}`)
  }

  return
}
