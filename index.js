const core = require('@actions/core');
const github = require('@actions/github');
const travisTrigger = require('./lib/travis-bot');
const ghTrigger = require('./lib/gh-bot');
const createComment = require('./lib/comment-bot');

const bug = 'bugfix';
const minor = 'minor';
const major = 'major';

const toReleaseType = ({ comment, pull_request }) => {
  const { body: type } = comment || {};
  const label = pull_request?.labels?.find((item) => [bug, minor, 'bug', 'bugfix'].includes(item?.name))
  console.log(JSON.stringify(label), 'Found label');
  console.log(JSON.stringify(pull_request?.labels), 'All labels');
  return {
    'bug': bug,
    'release': bug,
    'release minor': minor,
    'release major': major
  }[type || label?.name] || label?.name;
}

const triggerRelease = (type) => `&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;:soon::shipit::octocat:
&emsp;&emsp;&emsp;&emsp;&emsp;${type === bug ? ':bug:' : ':rose:'}Shipit Squirrel has this release **${type}** surrounded, be ready for a new version${type === bug ? ':beetle:' : ':sunflower:'}`;

try {
  const action = github.context.payload;
  if (action.issue?.labels?.find(({ name }) => name === 'released')) {
    console.log('Not releasing. It has already been released!');
    return;
  }
  const travisConfig = JSON.parse(core.getInput('travis-config'));
  const ghReleaseConfig = JSON.parse(core.getInput('gh-config'));
  const allowedUsers = JSON.parse(core.getInput('allowed-users'));
  console.log(allowedUsers);
  const isGithubAction = !!ghReleaseConfig.token;
  console.log(`Is it gh actions?: ${isGithubAction}`);
  const isTravis = !!travisConfig.token;
  console.log(`Is it travis?: ${isTravis}`);
  const releaseType = toReleaseType(action);
  const [owner, group] = action?.repository?.full_name?.split('/') || [];
  const ghConfig = {
    owner,
    repo: group,
    number: action?.issue?.number || action?.number,
  };
  const merged = (action?.issue?.pull_request?.merged_at || action?.pull_request?.merged_at) !== null;
  
  console.log(`Is PR merged?: ${merged}`);
  console.log(`GH config: ${JSON.stringify(ghConfig)}`);
  console.log(`This is release type: ${releaseType}`);

  const triggeredBy = action?.comment?.user?.login || action?.sender.login;

  console.log('Can release?', allowedUsers.includes(triggeredBy));

  // TODO: remove !merged
  if (merged || !merged) {
    console.log('PR has been merged!');
    createComment({ ...ghConfig, body: triggerRelease(releaseType) }, { botName: core.getInput('bot-name'), token: core.getInput('gh-bot-token') });
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
  const payload = JSON.stringify(action, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
