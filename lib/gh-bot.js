const axios = require('axios');

async function ghTrigger({ owner, repo, number }, releaseType, context, config) {
  context.log('Missing implementation!');
}

module.exports = ghTrigger;
