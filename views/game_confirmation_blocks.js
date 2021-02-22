/**
 * This function will accept a trigger ID and return the blocks to display the modal view for confirming a game.
 * @param {string} trigger_id 
 */
const confirmationGameBlocks = (trigger_id) => {
    return {
        //trigger_id: trigger_id,
        response_action: "push",
        view: {
            callback_id: "game_confirmation",
            type: "modal",
            title: {
                type: "plain_text",
                text: "Confirmation"
            },
            close: {
                type: "plain_text",
                text: "Close"
            },
            submit: {
                type: "plain_text",
                text: "Start"
            },
            blocks: [
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": "By clicking start, a new game of Fibbage will begin in channel."
                        }
                    ]
                }
            ]
        }
    }
}

module.exports = confirmationGameBlocks;