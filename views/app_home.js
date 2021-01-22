/**
 * This function will return the blocks that appear when the app home is opened.
 * @param {string} user_id 
 */
const appHome = (user_id) => {
    return {
        user_id,
        view: {
            type: "home",
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `:wave: Hi <@${user_id}>! Welcome to Fibbage.\n\n Fibbage is the lying, bluffing, fib-till-you-win trivia party game. Fool your colleagues with your lies, avoid theirs, and find the (usually outrageous) truth.`
                    }
                },
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "Leaderboard",
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ":first_place_medal: <@U01H95BK4EB> (Total Score: 700)\n:second_place_medal: <@U01J4FR2SVC> (Total Score: 300)"
                    }
                }
            ]
        }
    }
}

module.exports = appHome;