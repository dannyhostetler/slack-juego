const startGameBlocks = (trigger_id) => {
    return {
        trigger_id: trigger_id,
        view: {
            callback_id: "game_started",
            type: "modal",
            title: {
                type: "plain_text",
                text: "Start a game of Fibbage"
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
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Fibbage bot will notify everyone in channel that we're going to start a game of Fibbage in *30 seconds* "
                    }
                },
                {
                    "block_id": "fibbage_channel_select",
                    "element": {
                        "action_id": "selected_channel",
                        "default_to_current_conversation": true,
                        "placeholder": {
                            "text": "Select a channel",
                            "type": "plain_text"
                        },
                        "response_url_enabled": true,
                        "type": "conversations_select"
                    },
                    "label": {
                        "text": "Which channel do you want to play Fibbage in?",
                        "type": "plain_text"
                    },
                    "type": "input"
                }
            ]
        }
    }
}

module.exports = startGameBlocks;