const interactGameBlocks = (trigger_id, private_metadata) => {
    return {
        trigger_id,
        view: {
            callback_id: "game_answer_entered",
            private_metadata,
            type: "modal",
            title: {
                type: "plain_text",
                text: "Enter your Lie"
            },
            close: {
                type: "plain_text",
                text: "Close"
            },
            submit: {
                type: "plain_text",
                text: "Enter Lie"
            },
            blocks: [
                {
                    "type": "input",
                    "block_id": "answer",
                    "label": {
                        "type": "plain_text",
                        "text": "Enter your Lie"
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "plain_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Enter your Lie here"
                        }
                    }
                }
            ]
        }
    }
}

module.exports = interactGameBlocks;