const { App } = require('@slack/bolt');
const { default: axios } = require('axios');
require('dotenv').config();

const { receiver, guid } = require('./config');
const api = require('./api');
const templates = require('./templates');

const AWS_API_URL = process.env.AWS_API_ROOT;

const app = new App({
    receiver
});

app.event('app_home_opened', async ({ event, client, say }) => {
    try {
        await say('👋 App Home opened');
    }
    catch (e) {
        console.log(e);
    }
});

app.shortcut('start_fibbage', async ({ shortcut, ack, client }) => {
    try {
        await ack();
        const result = client.views.open(templates.fibbageStartModalBlocks(shortcut.trigger_id));
    } catch (e) {
        console.log(e);
    }
});

app.view('fibbage_question_lie', async ({ ack, body, view, client }) => {
    await ack();
    const { blocks, gameId, channel_id, questionId } = JSON.parse(view.private_metadata)


    const response = await api.patch(`${AWS_API_URL}/v1/games-create`, {
        gameId, lie: {
            questionId,
            text: view.state.values.input123.plain_input.value,
            userId: body.user.id
        }
    });

    const { lies } = response.data.body.Attributes

    let playersString;
    lies.forEach((lie) => {
        if(lie.questionId == questionId) {
            playersString = (playersString == null) ? `<@${lie.userId}>` : `${playersString}, <@${lie.userId}>`
        }
    });


    // TODO: This block can be more efficient
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].block_id == 'lies_submitted') {
            blocks[i].text.text = `*Lies Submitted:* ${playersString}`;
        }
    }

    await client.chat.update({
        channel: channel_id,
        ts: gameId,
        blocks
    });
});

app.view('fibbage_started', async ({ ack, body, view, client }) => {
    await ack();

    const { response_url, channel_id } = body.response_urls[0];
    const userId = body.user.id;

    // Create a new Fibbage game
    const fibbagePost = await client.chat.postMessage(templates.fibbageStartPostBlocks(channel_id, userId));
    const { ts } = fibbagePost.message;
    const gameResult = await axios.post(`${AWS_API_URL}/v1/games-create`, {
        gameId: ts,
        questions: [
            {
                "questionId": guid(),
                "question": "What year was Slack founded?",
                "truth": "2013"
            },
            {
                "questionId": guid(),
                "question": "Who is the CEO of Slack?",
                "truth": "Steward Butterfield"
            }
        ],
        lies: [],
        numberOfPlayers: 1,
        players: [
            userId
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });

    if (gameResult.data.statusCode == 201) {
        const gameInfo = await axios.post(`${AWS_API_URL}/v1/games-info`, {
            gameId: ts
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.AWS_API_KEY
            }
        });

        // Loop through all the game questions
        const gameQuestions = gameInfo.data.body.questions;
        for await (const question of gameQuestions) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 30000);
            });
            await client.chat.update(templates.fibbageQuestionBlocks(channel_id, ts, question.question, question.questionId, ts));
        }
    }
});
app.action(/^fibbage-vote.*$/, async ({ ack, body, client }) => {
    try {
        await ack();
        const trigger_id = body.trigger_id;
        const blocks = body.message.blocks;
        const gameId = (body.actions[0].action_id).replace('fibbage-vote-', '');
        const questionId = body.actions[0].value;
        const channel_id = body.channel.id;
        const private_metadata = {
            blocks,
            gameId,
            channel_id,
            questionId
        }
        const result = client.views.open(templates.fibbageLieModalBlocks(trigger_id, JSON.stringify(private_metadata)));
    } catch (e) {
        console.log(e);
    }
})

app.action(/^fibbage-join.*$/, async ({ ack, body, say, client }) => {
    await ack();
    try {
        const userId = body.user.id;
        const responseUrl = body.response_url;

        const gameId = body.message.ts;
        let blocks = body.message.blocks;

        const response = await api.patch(`${AWS_API_URL}/v1/games-create`, { gameId, userId });

        if (response.data.statusCode == 202) {
            // Send an ephemeral message
            // A 202 indicates that the player has already joined the game
            return;
        }

        const { players, numberOfPlayers, totalPlayers, question } = response.data.body.Attributes

        let playersString;
        players.forEach((player) => {
            playersString = (playersString == null) ? `<@${player}>` : `${playersString}, <@${player}>`
        });

        // TODO: This block can be more efficient
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].block_id == 'players_joined') {
                blocks[i].text.text = `*Joined:* ${playersString}`;
            }
        }
        await axios.post(responseUrl, { replace_original: true, response_type: 'in_channel', blocks });
    } catch (e) {
        console.log(e);
    }
});

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();