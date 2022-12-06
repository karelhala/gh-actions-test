const core = require('@actions/core');
const github = require('@actions/github');
const travisTrigger = require('./lib/travis-bot');
const ghTrigger = require('./lib/gh-bot');

const bug = 'BUG';
const minor = 'MINOR';
const major = 'MAJOR';

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
    context.log('Not releasing. It has already been released!');
    return;
  }
  const context = github.context;
  const isGithubAction = JSON.parse(core.getInput('is-gh'));
  const isTravis = JSON.parse(core.getInput('is-travis'));
  const releaseType = toReleaseType(github.context.payload);
  const [owner, group] = github.context.payload?.base?.repo?.full_name?.split('/') || [];
  const ghConfig = {
    owner,
    group,
    number: github.context.payload?.number,
  };
  const { merged } = JSON.parse(github.context.payload);
  
  context.log(`Is PR merged?: ${merged}`);
  context.log(`GH config: ${ghConfig}`);
  context.log(`Is it travis?: ${isTravis}`);
  context.log(`Is it gh actions?: ${isGithubAction}`);
  context.log(`This is release type: ${releaseType}`);

  if (merged) {
    context.log('PR has been merged!');
    if (isTravis) {
      context.log('Using travis release!');
      const travisConfig = core.getInput('travis-token');
      travisTrigger(ghConfig, releaseType, context, {
        token: travisToken,
        ...travisConfig
      });
    }
  
    if (isGithubAction) {
      context.log('Using github action release!');
      const travisConfig = core.getInput('gh-release-bot-token') || core.getInput('gh-bot-token');
      ghTrigger(ghConfig, releaseType, context, {
        token: travisToken,
        ...travisConfig
      });
    }
  } else {
    context.log('PR not merged!');
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  context.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
