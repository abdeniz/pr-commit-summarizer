import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/rest'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const auth = process.env.GITHUB_TOKEN || core.getInput('token')
    const octokit = new Octokit({ auth })

    const prNumber = Number(core.getInput('pr-number'))

    const { data: commits } = await octokit.pulls.listCommits({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber
    })

    const commitSummary = commits
      .map(commit => `* ${commit.sha.substring(0, 7)} ${commit.commit.message}`)
      .join('\n')

    const summary = `
      ## Release notes

      ${commitSummary}
    `

    core.setOutput('summary', summary)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
