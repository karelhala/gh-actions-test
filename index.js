const core = require('@actions/core');
const github = require('@actions/github');
const travisTrigger = require('./lib/travis-bot');
const ghTrigger = require('./lib/gh-bot');

const bug = 'bugfix';
const minor = 'minor';
const major = 'major';

const toReleaseType = ({ comment, label }) => {
  const { body: type } = comment || {};
  const { name: labelType } = label || {};
  return {
    'release': bug,
    'release minor': minor,
    'release major': major
  }[type || labelType] || labelType;
}

try {
  if (github.context.payload.issue?.labels?.find(({ name }) => name === 'released')) {
    console.log('Not releasing. It has already been released!');
    return;
  }
  console.log(core.getInput('is-gh'), 'this is just the raw is gh');
  const travisConfig = JSON.parse(core.getInput('travis-config'));
  const ghReleaseConfig = JSON.parse(core.getInput('gh-config'));
  const allowedUsers = JSON.parse(core.getInput('allowed-users'));
  console.log(allowedUsers);
  const isGithubAction = !!ghReleaseConfig.token;
  console.log(`Is it gh actions?: ${isGithubAction}`);
  const isTravis = !!travisConfig.token;
  console.log(`Is it travis?: ${isTravis}`);
  const releaseType = toReleaseType(github.context.payload);
  const [owner, group] = github.context.payload?.repository?.full_name?.split('/') || [];
  const ghConfig = {
    owner,
    repo: group,
    number: github.context.payload?.issue?.number || github.context.payload?.number,
  };
  const merged = github.context.payload?.issue?.state || github.context.payload?.pull_request?.state;
  
  console.log(`Is PR merged?: ${merged}`);
  console.log(`GH config: ${JSON.stringify(ghConfig)}`);
  console.log(`This is release type: ${releaseType}`);

  const triggeredBy = github.context.payload?.comment?.user?.login || github.context.payload?.sender.login;

  console.log('Can release?', allowedUsers.includes(triggeredBy));

  // TODO: remove !merged    !!!!!!!!
  if (merged || !merged) {
    console.log('PR has been merged!');
    if (isTravis) {
      console.log('Using travis release!');
      travisTrigger(ghConfig, releaseType, travisConfig);
    }
  
    if (isGithubAction) {
      console.log('Using github action release!');
      ghTrigger(ghConfig, releaseType, ghReleaseConfig);
    }
  } else {
    console.log('PR not merged!');
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
