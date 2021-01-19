const endGamePost = (channel, ts) => {
    return {
        channel,
        ts,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "We just completed a game of Fibbage. Here are the results:"
                }
            }
        ]
    }
}

module.exports = endGamePost;