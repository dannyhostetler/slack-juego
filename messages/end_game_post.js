const endGamePost = (channel, ts) => {
    return {
        channel,
        ts,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Game Over!"
                }
            }
        ]
    }
}

module.exports = endGamePost;