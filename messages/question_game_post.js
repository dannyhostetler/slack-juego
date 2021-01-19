const questionGamePost = (channel, ts, question) => {
    return {
        channel,
        ts,
        "blocks": [
            {
                "block_id": "header_block",
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${question.currentQuestion}. ${question.question}`
                }
            },
            {
                "type": "actions",
                "block_id": "answer_section",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Enter Lie",
                            "emoji": true
                        },
                        "value": `${question.questionId}`,
                        "action_id": `fibbage-vote-${ts}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Time Left: *30 seconds*"
                    }
                ]
            },
            {
                "block_id": "answers_submitted",
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Submitted:"
                    }
                ]
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
                        "text": `Question ${question.currentQuestion} of ${question.totalQuestions} | *30 seconds* per question`
                    }
                ]
            }
        ]
    }
}

module.exports = questionGamePost;