import {CreateCoverageBadgeInputs, UpdateCoverageGistInputs} from './interfaces'
import {GistContentType, GistUpdateFileType, JcsMergedType} from './types'
import {getInput} from '@actions/core'
import {getOctokit} from '@actions/github'

// copied from https://github.com/Schneegans/dynamic-badges-action

export const buildGistCoverageFileList = (
  results: JcsMergedType[]
): GistUpdateFileType => {
  let files: GistUpdateFileType = {}
  for (const result of results) {
    const file = createCoverageBadge({
      label: result.app,
      message: result.coverage.toFixed(2)
    })
    files = {...files, ...file}
  }

  return files
}

export const createCoverageBadge = ({
  label,
  message
}: CreateCoverageBadgeInputs): GistUpdateFileType => {
  try {
    // This object will be stringified and uploaded to the gist. The
    // schemaVersion, label and message attributes are always required. All others
    // are optional and added to the content object only if they are given to the
    // action.
    const content: GistContentType = {
      schemaVersion: 1,
      label,
      message
    }

    // Get all optional attributes and add them to the content object if given.
    const labelColor = getInput('label-color')
    const color = getInput('color')
    const isError = getInput('is-error')
    const namedLogo = getInput('named-logo')
    const logoSvg = getInput('logo-svg')
    const logoColor = getInput('label-color')
    const logoWidth = getInput('logo-width')
    const logoPosition = getInput('logo-position')
    const style = getInput('style')
    const cacheSeconds = getInput('cache-seconds')

    if (labelColor !== '') {
      content.labelColor = labelColor
    }

    if (color !== '') {
      content.color = color
    }

    if (isError !== '') {
      content.isError = isError
    }

    if (namedLogo !== '') {
      content.namedLogo = namedLogo
    }

    if (logoSvg !== '') {
      content.logoSvg = logoSvg
    }

    if (logoColor !== '') {
      content.logoColor = logoColor
    }

    if (logoWidth !== '') {
      content.logoWidth = parseInt(logoWidth)
    }

    if (logoPosition !== '') {
      content.logoPosition = logoPosition
    }

    if (style !== '') {
      content.style = style
    }

    if (cacheSeconds !== '') {
      content.cacheSeconds = parseInt(cacheSeconds)
    }

    // For the POST request, the above content is set as file contents for the
    // given filename.

    const fileName = `${label.replace(/\//g, '-')}.json`

    // const request = JSON.stringify({
    //   files: {[`${fileName}`]: {content: JSON.stringify(content)}}
    // })

    return {[fileName]: {content: JSON.stringify(content)}}
  } catch (error) {
    throw error
  }
}

export const updateCoverageGist = async ({
  gistToken,
  gistId,
  files
}: UpdateCoverageGistInputs): Promise<void> => {
  try {
    const github = getOctokit(gistToken).rest

    const res = await github.gists.update({
      gist_id: gistId,
      files
    })

    if (res.status && (res.status < 200 || res.status >= 400)) {
      throw new Error(
        `Failed to create gist, response status code: ${res.status}, status message: ${res.data}`
      )
    }
  } catch (error) {
    throw error
  }
}
