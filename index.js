const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const ghBotToken = core.getInput('gh-bot-token');
  const travisToken = core.getInput('travis-token');
  const isGithubAction = core.getInput('is-gh');
  const isTravis = core.getInput('is-travis');
  console.log(`Is it travis?: ${isTravis}`);
  console.log(`Is it gh actions?: ${isGithubAction}`);
  if (ghBotToken) {
    console.log(`GH bot token defined!`);
  }

  if (travisToken) {
    console.log(`Travis token defined!`);
  }
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
