const { Octokit } = require("@octokit/rest");

const createComment = async ({ repo, owner, number, body }, config) => {
    const botName = config.botName || 'karelhala-bot';
    const octokit = new Octokit({
      auth: config.token,
      userAgent: botName,
      previews: ['jean-grey', 'symmetra'],
      timeZone: 'Europe/Prague',
      baseUrl: 'https://api.github.com',
    });
    const { data: comments } = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: number,
        page: -1
    });
    console.log(`Comment triggered - ${body}`);
    if (comments[comments.length - 1] && comments[comments.length - 1].user.login === botName) {
        console.log('Last comment from this bot. No comment, sorry.');
        return;
    }
    octokit.issues.createComment({
        repo,
        owner,
        issue_number: number,
        body
    });
}

module.exports = createComment;
