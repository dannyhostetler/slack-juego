const answerResultsReply = (channel, thread_ts, question, results) => {
    return {
        channel,
        thread_ts,
        "blocks": [
            {
                "block_id": "header_block",
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": question
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": results
                }
            },
            {
                "type": "divider"
            },
            {
                "block_id": "footer_block",
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*5 Questions* | *20 seconds* per question"
                    }
                ]
            }
        ]
    }
}

module.exports = answerResultsReply;