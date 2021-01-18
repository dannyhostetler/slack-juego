const answersGamePost = (channel, ts, question, questionId, answers) => {
    let answersArray = [];

    answers.map((answer) => {
        answersArray.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": answer.text,
                "emoji": true
            },
            "value": questionId,
            "action_id": `fibbage-answer-select-${answer.answerId}`
        })
    })

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
                "block_id": "answer_section",
                "elements": answersArray
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
                        "text": "*5 Questions* | *20 seconds* per question"
                    }
                ]
            }
        ]
    }
}

module.exports = answersGamePost;