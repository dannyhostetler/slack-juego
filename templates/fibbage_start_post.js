const fibbageStartPostBlocks = (channelId, userId) => {
    return {
        "channel": channelId,
        "text": "Fibbage",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `:wave: <@here> Hi Everyone! \n\n <@${userId}> has started a game of Fibbage! Fibbage is the lying, bluffing, fib-till-you-win trivia party game. Fool your friends with your lies, avoid theirs, and find the (usually outrageous) truth.\n\n :timer_clock: The game will begin in 30 seconds. \n\nClick *Join Fibbage* to play.`
                }
            },
            {
                "block_id": "join_button",
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Join Fibbage",
                            "emoji": true
                        },
                        "value": "Join Fibbage",
                        "action_id": `fibbage-join`
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "block_id": "players_joined",
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Joined:* <@${userId}>`
                }
            }
        ]
    }
}

module.exports = fibbageStartPostBlocks;