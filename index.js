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
    console.log('Not releasing. It has already been released!');
    return;
  }
  console.log(core.getInput('is-gh'), 'this is just the raw is gh');
  const isGithubAction = JSON.parse(core.getInput('is-gh'));
  console.log(`Is it gh actions?: ${isGithubAction}`);
  const isTravis = JSON.parse(core.getInput('is-travis'));
  console.log(`Is it travis?: ${isTravis}`);
  const releaseType = toReleaseType(github.context.payload);
  const [owner, group] = github.context.payload?.base?.repo?.full_name?.split('/') || [];
  const ghConfig = {
    owner,
    group,
    number: github.context.payload?.number,
  };
  const { merged } = JSON.parse(github.context.payload);
  
  console.log(`Is PR merged?: ${merged}`);
  console.log(`GH config: ${ghConfig}`);
  console.log(`This is release type: ${releaseType}`);

  if (merged) {
    console.log('PR has been merged!');
    if (isTravis) {
      console.log('Using travis release!');
      const travisConfig = core.getInput('travis-token');
      travisTrigger(ghConfig, releaseType, {
        token: travisToken,
        ...travisConfig
      });
    }
  
    if (isGithubAction) {
      console.log('Using github action release!');
      const travisConfig = core.getInput('gh-release-bot-token') || core.getInput('gh-bot-token');
      ghTrigger(ghConfig, releaseType, {
        token: travisToken,
        ...travisConfig
      });
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
