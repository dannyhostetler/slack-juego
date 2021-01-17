const fibbageLieModalBlocks = (trigger_id, private_metadata) => {
    return {
        trigger_id: trigger_id,
        view: {
            callback_id: "fibbage_question_lie",
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
                text: "Start"
            },
            blocks: [
                {
                    "type": "input",
                    "block_id": "input123",
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

module.exports = fibbageLieModalBlocks;