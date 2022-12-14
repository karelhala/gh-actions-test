const axios = require('axios');

async function ghTrigger({ owner, repo }, config) {
  const body = {
    'event_type': config.event_type
}

const githubActionURL = ` https://api.github.com/repos/${(config?.group) || owner}/${(config?.repo) || repo}/dispatches`;
console.log(`Notifyig travis on URL: ${githubActionURL}`);
console.log(`With data: ${JSON.stringify(body)}`);
try {
    axios.post(
        githubActionURL,
        body,
        {
            headers: {
                'Authorization': `Bearer ${config?.token}`
            }
        }
    ).catch(({ response: { data, status } }) => {
        console.log('Error status: ', status);
        console.log('Error data: ', data);
    })
} catch(e) {
    console.log(e);
}
}

module.exports = ghTrigger;
