import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token');
    // API: https://actions-cool.github.io/octokit-rest/
    const octokit = github.getOctokit(token);

    const context = github.context;

    const { owner, repo } = context.repo;
    const prNumber = context.payload.pull_request?.number ?? -1;

    if (prNumber === -1) {
      throw new Error('Invalid PR number');
    }

    const resp = await octokit.rest.pulls.listFiles({
      owner: owner,
      repo: repo,
      pull_number: prNumber,
    });

    const validFiles = resp.data.map(f => f.filename)
      .filter((filename) => filename.endsWith('.php') && filename !== 'ecs.php');

    core.setOutput('has_files', validFiles.length > 0);
    core.setOutput('files', validFiles.join(' '));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
