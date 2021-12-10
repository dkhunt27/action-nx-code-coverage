import {IUpsertCommentInputs, ParsedContextType} from './interfaces-types'
import {context, getOctokit} from '@actions/github'

// Every comment written by our action will have this hidden
// header on top, and will be used to identify which comments
// to update/delete etc
const appendHiddenHeaderToComment = (
  body: string,
  hiddenHeader: string
): string => hiddenHeader + body

export const buildParsedContext = (): ParsedContextType => {
  if (!context.payload.repository) {
    throw new Error('context.payload.repository cannot be null')
  }

  if (!context.payload.pull_request) {
    throw new Error('context.payload.pull_request cannot be null')
  }

  const parsedContext: ParsedContextType = {
    repositoryFullName: context.payload.repository.full_name as string,
    pullRequestHeadSha: context.payload.pull_request.head.sha,
    pullRequestHeadRef: context.payload.pull_request.head.ref,
    pullRequestBaseRef: context.payload.pull_request.base.ref,
    pullRequestNumber: context.payload.pull_request?.number,
    repoOwner: context.repo.owner,
    repoRepo: context.repo.repo
  }

  return parsedContext
}

export const upsertComment = async ({
  token,
  prNumber,
  body,
  hiddenHeader,
  repoOwner,
  repoRepo
}: IUpsertCommentInputs): Promise<void> => {
  const github = getOctokit(token).rest

  // find previous comment made by this action
  const {data: existingComments} = await github.issues.listComments({
    issue_number: prNumber,
    owner: repoOwner,
    repo: repoRepo
  })

  // find previous comments made by this action
  existingComments.filter(item => item.body?.startsWith(hiddenHeader))

  // remove the last one from the list, this is the one we will update
  const lastComment = existingComments.pop()

  // delete all existingComments (only need to keep one, the last one)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deletePromises: any[] = []

  existingComments.map(async item =>
    deletePromises.push(
      github.issues.deleteComment({
        owner: repoOwner,
        repo: repoRepo,
        comment_id: item.id
      })
    )
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
