import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const auth = process.env.GITHUB_TOKEN || core.getInput('github-token')
    const octokit = new Octokit({ auth })

    const prNumber = github.context.payload.pull_request?.number

    if (!prNumber) {
      core.setFailed("Pull request number couldn't be fetched.")
      return
    }

    const { data: commits } = await octokit.pulls.listCommits({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber
    })

    const commitSummary = commits
      .map(commit => `* ${commit.commit.message}`)
      .join('\n')

    core.setOutput('summary', commitSummary)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
