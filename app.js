const { App } = require('@slack/bolt');
const { default: axios } = require('axios');
require('dotenv').config();

const { receiver } = require('./config');
const { guid, timeout } = require('./helpers');
const api = require('./api');
const views = require('./views');
const messages = require('./messages');

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
    // Acknowledge Shortcut
    await ack();

    try {
        await client.views.open(views.startGameBlocks(shortcut.trigger_id));
    } catch (e) {
        console.log(e);
    }
});

app.view('fibbage_question_answer', async ({ ack, body, view, client }) => {
    await ack();
    try {
        const userId = body.user.id;
        const { blocks, gameId, channel_id, questionId } = JSON.parse(view.private_metadata)

        const gameUpdate = await api.gameUpdate(gameId, userId, {
            answer: {
                answerId: guid(),
                questionId,
                text: view.state.values.input123.plain_input.value,
                userId,
                truth: false
            }
        });
        const { answers } = gameUpdate.data.body.Attributes

        let playersString;
        answers.forEach((answer) => {
            if (answer.questionId == questionId && answer.userId != null) {
                playersString = (playersString == null) ? `<@${answer.userId}>` : `${playersString}, <@${answer.userId}>`
            }
        });
        // TODO: This block can be more efficient
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].block_id == 'answers_submitted') {
                blocks[i].elements[0].text = `Submitted: ${playersString}`;
            }
        }

        await client.chat.update({
            channel: channel_id,
            ts: gameId,
            blocks
        });
    } catch (e) {
        console.log(e);
    }
});

app.view('fibbage_started', async ({ ack, body, view, client }) => {
    // Acknowledge Callback from Slack
    await ack();

    const { response_url, channel_id } = body.response_urls[0];
    const userId = body.user.id;

    // Post to channel and create a new Fibbage game
    const fibbagePost = await client.chat.postMessage(messages.startGamePost(channel_id, userId));
    const { ts } = fibbagePost.message;
    const newGame = await api.newGame(ts, userId);

    if (newGame.data.statusCode == 201) {
        let gameInfo = await api.gameInfo(ts);
        const gameQuestions = gameInfo.data.body.questions;

        // Loop through all the game questions
        for await (const gameQuestion of gameQuestions) {
            // Waiting for 30 seconds for players to enter lies for game
            await timeout(15000);

            const { question, questionId } = gameQuestion
            // Post game question
            await client.chat.update(messages.questionGamePost(channel_id, ts, question, questionId));

            // Waiting for 30 seconds for players to enter answers to question
            await timeout(15000);

            // Retreive game info
            gameInfo = await api.gameInfo(ts);
            const { answers } = gameInfo.data.body;

            let filteredAnswers = answers.filter((answer) => {
                return answer.questionId === questionId
            });

            await client.chat.update(messages.answersGamePost(channel_id, ts, question, questionId, filteredAnswers));

            // Waiting for 30 seconds for players to enter answers to question
            await timeout(15000);

            // Retreive game info
            gameInfo = await api.gameInfo(ts);
            const { selections } = gameInfo.data.body;

            let correctSelections = selections.filter((selection) => {
                return selection.correct === true;
            });

            let playersString;
            correctSelections.forEach((selection) => {
                playersString = (playersString == null) ? `<@${selection.userId}>` : `${playersString}, <@${selection.userId}>`
            });
            
            const finalPlayersString = (correctSelections.length > 0) ? `:partying_face: Nice! ${playersString}` : `:cricket: No one selected the truth!`;

            await client.chat.update(messages.answerResultsPost(channel_id, ts, question, finalPlayersString));
            await timeout(5000);
            await client.chat.postMessage(messages.answerResultsReply(channel_id, ts, question, finalPlayersString));
        }
        // Final game post
        await client.chat.update(messages.endGamePost(channel_id, ts));
    }
});

app.action(/^fibbage-answer-select.*$/, async ({ ack, body, client }) => {
    await ack();

    try {
        const gameId = body.message.ts;
        const userId = body.user.id;
        let blocks = body.message.blocks;
        const responseUrl = body.response_url;

        const gameUpdate = await api.gameUpdate(gameId, userId, {
            selection: {
                selectionId: guid(),
                questionId: body.actions[0].value,
                answerId: (body.actions[0].action_id).replace('fibbage-answer-select-', ''),
                userId: body.user.id
            }
        });

        const { selections } = gameUpdate.data.body.Attributes

        let playersString;
        selections.forEach((selection) => {
            playersString = (playersString == null) ? `<@${selection.userId}>` : `${playersString}, <@${selection.userId}>`
        });

         // TODO: This block can be more efficient
         for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].block_id == 'answers_submitted') {
                blocks[i].elements[0].text = `Submitted: ${playersString}`;
            }
        }
        await axios.post(responseUrl, { replace_original: true, response_type: 'in_channel', blocks });

    } catch (e) {
        console.log(e);
    }
});

app.action(/^fibbage-vote.*$/, async ({ ack, body, client }) => {
    // Acknowledge Block Action
    await ack();

    try {
        const trigger_id = body.trigger_id;
        const private_metadata = {
            blocks: body.message.blocks,
            gameId: (body.actions[0].action_id).replace('fibbage-vote-', ''),
            channel_id: body.channel.id,
            questionId: body.actions[0].value
        }
        await client.views.open(views.interactGameBlocks(trigger_id, JSON.stringify(private_metadata)));
    } catch (e) {
        console.log(e);
    }
})

app.action(/^fibbage-join.*$/, async ({ ack, body, say, client }) => {
    // Acknowledge Callback from Slack
    await ack();

    try {
        const userId = body.user.id;
        const responseUrl = body.response_url;
        const gameId = body.message.ts;
        let blocks = body.message.blocks;

        const gameUpdate = await api.gameUpdate(gameId, userId);

        if (gameUpdate.data.statusCode == 202) {
            // Send an ephemeral message
            // A 202 indicates that the player has already joined the game
            return;
        }

        const { players, numberOfPlayers, totalPlayers, question } = gameUpdate.data.body.Attributes

        let playersString;
        players.forEach((player) => {
            playersString = (playersString == null) ? `<@${player}>` : `${playersString}, <@${player}>`
        });

        // TODO: This block can be more efficient
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].block_id == 'players_joined') {
                blocks[i].elements[0].text = `Joined: ${playersString}`;
            }
        }
        await axios.post(responseUrl, { replace_original: true, response_type: 'in_channel', blocks });
    } catch (e) {
        console.log(e);
    }
});

// Handle Bolt errors
app.error(error => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    console.error(error)
});

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();