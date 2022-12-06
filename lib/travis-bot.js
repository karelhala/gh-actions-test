const axios = require('axios');

async function travisTrigger({ owner, repo, number }, releaseType, config) {
    const body = {
        request: {
            config: {
                env: {
                    PR_NUMBER: number,
                    RELEASE_TYPE: releaseType
                },
                script: config?.script || 'npm run release:api'
            }
        }
    }

    const travisURL = `https://api.travis-ci.com/repo/${(config?.group) || owner}%2F${(config?.repo) || repo}/requests`;
    console.log(`Notifyig travis on URL: ${travisURL}`);
    console.log(`With data: ${JSON.stringify(body)}`);
    try {
        axios.post(
            travisURL,
            body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Travis-API-Version': 3,
                    'Authorization': `token ${config?.token}`
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

module.exports = travisTrigger;
