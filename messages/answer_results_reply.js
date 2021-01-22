/**
 * This function will return the blocks to display game answer results (in a threaded reply).
 * @param {string} channel 
 * @param {string} thread_ts 
 * @param {string} question 
 * @param {string} answers 
 * @param {string} results 
 */

const answerResultsReply = (channel, thread_ts, question, answers, results) => {
    let answersString;
    answers.forEach((answer) => {
        if (answersString == null) {
            answersString = (answer.truth === true) ? `:white_check_mark: ${answer.text}` : `:x: ${answer.text}`
        } else {
            answersString = (answer.truth === true) ? `${answersString}\n:white_check_mark: ${answer.text}` : `${answersString}\n:x: ${answer.text}`
        }
    });

    return {
        channel,
        thread_ts,
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
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": answersString
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
                        "text": `Question ${question.currentQuestion} of ${question.totalQuestions} | *30 seconds* per question`
                    }
                ]
            }
        ]
    }
}

module.exports = answerResultsReply;