const core = require('@actions/core');
const github = require('@actions/github');

const toReleaseType = ({ comment, label }) => {
  const { body: type } = comment || {};
  const { name: labelType } = label || {};
  return {
    'release': 'bug',
    'release minor': 'minor',
    'release major': 'major'
  }[type || labelType] || labelType;
}

try {
  if (github.context.payload.issue?.labels?.find(({ name }) => name === 'released')) {
    console.log('Not releasing! It has already been released!');
    return;
  }
  const ghBotToken = core.getInput('gh-bot-token');
  const travisToken = core.getInput('travis-token');
  const isGithubAction = core.getInput('is-gh');
  const isTravis = core.getInput('is-travis');
  const releaseType = toReleaseType(github.context.payload);
  console.log(`Is it travis?: ${isTravis}`);
  console.log(`Is it gh actions?: ${isGithubAction}`);
  console.log(`This is release type: ${releaseType}`);
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
