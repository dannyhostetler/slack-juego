const fibbageQuestionBlocks = (channel, ts, question, questionId, gameId) => {
    return {
        channel,
        ts,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": question
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Enter Lie",
                            "emoji": true
                        },
                        "value": `${questionId}`,
                        "action_id": `fibbage-vote-${gameId}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": ":timer_clock: Next question in 30 seconds."
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "block_id": "lies_submitted",
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Lies submitted:* "
                }
            }
        ]
    }
}

module.exports = fibbageQuestionBlocks;