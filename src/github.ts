import {context, getOctokit} from '@actions/github'
import {debug as logDebug, info as logInfo} from '@actions/core'
import {ParsedContextType} from './types'
import {UpsertCommentInputs} from './interfaces'

// Every comment written by our action will have this hidden
// header on top, and will be used to identify which comments
// to update/delete etc
const appendHiddenHeaderToComment = (
  body: string,
  hiddenHeader: string
): string => hiddenHeader + body

export const buildParsedContext = (): ParsedContextType => {
  logDebug(`context: ${JSON.stringify(context, null, 2)}`)

  if (!context.payload.repository) {
    throw new Error('context.payload.repository cannot be null')
  }

  const parsedContext: ParsedContextType = {
    repositoryFullName: context.payload.repository.full_name as string,
    pullRequestHeadSha: context.payload.pull_request
      ? context.payload.pull_request.head.sha
      : '',
    pullRequestHeadRef: context.payload.pull_request
      ? context.payload.pull_request.head.ref
      : '',
    pullRequestBaseRef: context.payload.pull_request
      ? context.payload.pull_request.base.ref
      : '',
    pullRequestNumber: context.payload.pull_request
      ? context.payload.pull_request.number
      : -1,
    repoOwner: context.repo.owner,
    repoRepo: context.repo.repo
  }

  logInfo(`parsedContext: ${JSON.stringify(parsedContext, null, 2)}`)
  return parsedContext
}

export const upsertComment = async ({
  token,
  prNumber,
  body,
  hiddenHeader,
  repoOwner,
  repoRepo
}: UpsertCommentInputs): Promise<void> => {
  const github = getOctokit(token).rest

  // find previous comment made by this action
  const {data: existingComments} = await github.issues.listComments({
    issue_number: prNumber,
    owner: repoOwner,
    repo: repoRepo
  })

  // find previous comments made by this action
  const coverageComments = existingComments.filter(item =>
    item.body?.startsWith(hiddenHeader)
  )

  // remove the last one from the list, this is the one we will update
  const lastComment = coverageComments.pop()

  // delete all existingComments (only need to keep one, the last one)
  const deletePromises = coverageComments.map(async item =>
    github.issues.deleteComment({
      owner: repoOwner,
      repo: repoRepo,
      comment_id: item.id
    })
  )

  await Promise.all(deletePromises)

  if (lastComment) {
    github.issues.updateComment({
      owner: repoOwner,
      repo: repoRepo,
      comment_id: lastComment.id,
      body: appendHiddenHeaderToComment(body, hiddenHeader)
    })
  } else {
    github.issues.createComment({
      owner: repoOwner,
      repo: repoRepo,
      issue_number: prNumber,
      body: appendHiddenHeaderToComment(body, hiddenHeader)
    })
  }
  return
}
