
/**
 * This function will return the blocks to dispay answer selections during the game.
 * @param {string} channel 
 * @param {string} ts 
 * @param {Object} question 
 * @param {Array} answers 
 */
const answersGamePost = (channel, ts, question, answers) => {
    let answersArray = [];

    answers.map((answer) => {
        answersArray.push({
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": answer.text,
                "emoji": true
            },
            "value": question.questionId,
            "action_id": `game_answer_selected_${answer.answerId}`
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
                    "text": `${question.currentQuestion}. ${question.question}`
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
                        "text": `Question ${question.currentQuestion} of ${question.totalQuestions} | *30 seconds* per question`
                    }
                ]
            }
        ]
    }
}

module.exports = answersGamePost;