const { App } = require('@slack/bolt');
const { default: axios } = require('axios');
require('dotenv').config();

const { receiver } = require('./config');
const { guid, timeout } = require('./helpers');
const api = require('./api');
const views = require('./views');
const messages = require('./messages');

/**
 * Create an instace of the Bolt App using the receiver configuration
 */
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

app.shortcut('start_game', async ({ shortcut, ack, client }) => {
    await ack(); // Acknowledge Shortcut

    try {
        await client.views.open(views.startGameBlocks(shortcut.trigger_id));
    } catch (e) {
        console.log(e);
    }
});

app.view('game_started', async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge View Submission

    try {
        const { response_url, channel_id } = body.response_urls[0];
        const userId = body.user.id;

        // Post to channel and create a new Fibbage game
        const fibbagePost = await client.chat.postMessage(messages.startGamePost(channel_id, userId));
        const { ts } = fibbagePost.message;
        const newGame = await api.newGame(ts, userId);

        if (newGame.data.statusCode == 201) {
            let gameInfo = await api.gameInfo(ts);
            const gameQuestions = gameInfo.data.body.questions;
            let questionNumber = 1;

            // Loop through all the game questions
            for await (let gameQuestion of gameQuestions) {
                // Waiting for 30 seconds for players to enter answers "lies" for game
                await timeout(30000);

                gameQuestion.totalQuestions = gameQuestions.length;
                gameQuestion.currentQuestion = questionNumber;

                // Post game question
                await client.chat.update(messages.questionGamePost(channel_id, ts, gameQuestion));

                // Waiting for 30 seconds for players to enter answers "lies" to question
                await timeout(30000);

                // Retreive game info
                gameInfo = await api.gameInfo(ts);
                const { answers } = gameInfo.data.body;

                let filteredAnswers = answers.filter((answer) => {
                    return answer.questionId === gameQuestion.questionId
                });

                // Post game answer options
                await client.chat.update(messages.answersGamePost(channel_id, ts, gameQuestion, filteredAnswers));

                // Waiting for 30 seconds for players to select answers to question
                await timeout(30000);

                // Retreive game info
                gameInfo = await api.gameInfo(ts);
                const { selections } = gameInfo.data.body;

                // TODO: These blocks can be more efficient
                let correctSelections = selections.filter((selection) => {
                    return (selection.correct === true) && (selection.questionId === gameQuestion.questionId);
                });
                let playersString;
                correctSelections.forEach((selection) => {
                    playersString = (playersString == null) ? `<@${selection.userId}>` : `${playersString}, <@${selection.userId}>`
                });
                const finalPlayersString = (correctSelections.length > 0) ? `:partying_face: Nice! ${playersString}` : `:cricket: No one selected the truth!`;

                //await client.chat.update(messages.answerResultsPost(channel_id, ts, gameQuestion.question, filteredAnswers, finalPlayersString));
                await client.chat.update(messages.answerResultsPost(channel_id, ts, gameQuestion, filteredAnswers, finalPlayersString));
                await timeout(5000);
                await client.chat.postMessage(messages.answerResultsReply(channel_id, ts, gameQuestion, filteredAnswers, finalPlayersString));

                questionNumber += 1;
            }
            // Retreive game info
            gameInfo = await api.gameInfo(ts);
            const { players } = gameInfo.data.body;
            await client.chat.update(messages.endGamePost(channel_id, ts, players));

            // Update the Player records
            players.forEach(async (player) => {
                await api.playerWrite(player.userId, player.score);
            });
        }
    } catch (e) {
        console.log(e);
    }
});

app.view('game_answer_entered', async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge View Submission

    try {
        const userId = body.user.id;
        const { blocks, gameId, channel_id, questionId } = JSON.parse(view.private_metadata)

        const gameUpdate = await api.gameUpdate(gameId, userId, {
            answer: {
                answerId: guid(),
                questionId,
                text: view.state.values.answer.plain_input.value,
                userId,
                selections: 0,
                truth: false
            }
        });

        if (gameUpdate.data.statusCode == 202) {
            console.log("Answer already entered");
            // Send an ephemeral message
            // A 202 indicates that the player has already entered an answer
            return;
        }

        const { answers } = gameUpdate.data.body.Attributes

        // TODO: This block can be more efficient
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


app.action(/^game_answer_selected.*$/, async ({ ack, body, client }) => {
    await ack(); // Acknowledge Callback

    try {
        const gameId = body.message.ts;
        const userId = body.user.id;
        let blocks = body.message.blocks;
        const responseUrl = body.response_url;
        const questionId = body.actions[0].value;

        const gameUpdate = await api.gameUpdate(gameId, userId, {
            selection: {
                selectionId: guid(),
                questionId,
                answerId: (body.actions[0].action_id).replace('game_answer_selected_', ''),
                userId: body.user.id
            }
        });

        if (gameUpdate.data.statusCode == 202) {
            console.log("Player already selected an answer.");
            // Send an ephemeral message
            // A 202 indicates that the player has already entered an answer
            return;
        }

        const { selections } = gameUpdate.data.body.Attributes

        let playersString;
        selections.forEach((selection) => {
            if (selection.questionId == questionId) {
                playersString = (playersString == null) ? `<@${selection.userId}>` : `${playersString}, <@${selection.userId}>`
            }
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
    await ack(); // Acknowledge Block Action

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

app.action(/^game_join.*$/, async ({ ack, body, say, client }) => {
    await ack(); // Acknowledge Callback from Slack

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
            playersString = (playersString == null) ? `<@${player.userId}>` : `${playersString}, <@${player.userId}>`
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