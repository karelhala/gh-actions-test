const axios = require('axios');

async function travisTrigger({ owner, repo, number }, releaseType, context, config) {
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
    context && context.log(`Notifyig travis on URL: ${travisURL}`);
    context && context.log(`With data: ${JSON.stringify(body)}`);
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
            context.log('Error status: ', status);
            context.log('Error data: ', data);
        })
    } catch(e) {
        context.log(e);
    }
}

module.exports = travisTrigger;
