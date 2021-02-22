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

/**
 * Listen for post requests and respond to help determine health of application
 */
receiver.router.get('/slack/liveness', (req, res) => {
    res.sendStatus(200);
})

/**
 * Publish a customized view when a user opens the app home
 */
app.event('app_home_opened', async ({ event, client, say }) => {
    try {
        await client.views.publish(views.appHome(event.user));
    }
    catch (e) {
        console.log(e);
    }
});
/**
 * Respond to the global quick launch callback (start_game) by opening a model view
 */
app.shortcut('start_game', async ({ shortcut, ack, client }) => {
    await ack(); // Acknowledge Shortcut

    try {
        await client.views.open(views.startGameBlocks(shortcut.trigger_id));
    } catch (e) {
        console.log(e);
    }
});

/**
* Upon modal view submision a post will be created to allow players to join
 */
app.view('game_started', async ({ ack, body, view, client }) => {
    await ack();

    try {
        const { channel_id } = body.response_urls[0];
        const userId = body.user.id;

        const fibbagePost = await client.chat.postMessage(messages.startGamePost(channel_id, userId)); // Post to channel to begin game
        const { ts } = fibbagePost.message; // ts (time stamp) will be used as the game identifier
        const newGame = await api.newGame(ts, userId); // Create a new game
        
        await timeout(30000); // Wait for 30 seconds before posting question

        if (newGame.data.statusCode == 201) {
            let gameInfo = await api.gameInfo(ts); // Get game info
            const gameQuestions = gameInfo.data.body.questions;
            let questionNumber = 1;

            for await (let gameQuestion of gameQuestions) {
                gameQuestion.totalQuestions = gameQuestions.length;
                gameQuestion.currentQuestion = questionNumber;

                await client.chat.update(messages.questionGamePost(channel_id, ts, gameQuestion)); // Update original post to now display a question
                await timeout(30000); // Wait (again) for 30 seconds so players can enter their answer (lie)

                gameInfo = await api.gameInfo(ts); // Get game info (again)
                const { answers } = gameInfo.data.body;

                let filteredAnswers = answers.filter((answer) => {
                    return answer.questionId === gameQuestion.questionId
                });

                await client.chat.update(messages.answersGamePost(channel_id, ts, gameQuestion, filteredAnswers)); // Update original post to now display available selections
                await timeout(30000); // Wait (again) for 30 seconds so players can attempt to select the truth

                gameInfo = await api.gameInfo(ts); // Get game info (again)
                const { selections } = gameInfo.data.body;

                /**
                 * @todo There is a more efficient and eloquent way to set up the finalPlayersString
                 */
                let correctSelections = selections.filter((selection) => {
                    return (selection.correct === true) && (selection.questionId === gameQuestion.questionId);
                });
                let playersString;
                correctSelections.forEach((selection) => {
                    playersString = (playersString == null) ? `<@${selection.userId}>` : `${playersString}, <@${selection.userId}>`
                });
                const finalPlayersString = (correctSelections.length > 0) ? `:partying_face: Nice! ${playersString}` : `:cricket: No one selected the truth!`;

                await client.chat.update(messages.answerResultsPost(channel_id, ts, gameQuestion, filteredAnswers, finalPlayersString)); // Update original post to display question results
                await timeout(7000);
                await client.chat.postMessage(messages.answerResultsReply(channel_id, ts, gameQuestion, filteredAnswers, finalPlayersString)); // Thread question results as a reply
                await timeout(1000);

                questionNumber += 1;
            }
            gameInfo = await api.gameInfo(ts); // Get game info (again)
            const { players } = gameInfo.data.body;
            await client.chat.update(messages.endGamePost(channel_id, ts, players)); // Update original post with final game results

            players.forEach(async (player) => {
                await api.playerWrite(player.userId, player.score); // Update the player records
            });
        }
    } catch (e) {
        console.log(e);
    }
});
/**
 * This function will process the game_anwer_entered callback where players submit their answer (lie)
 */
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
            /**
             * @todo Send an ephemeral message
             * A 202 indicates that the player has already entered an answer
             */
            return;
        }

        const { answers } = gameUpdate.data.body.Attributes

        /**
         * @todo There is a better way to write the following lines of code
         */
        let playersString;
        answers.forEach((answer) => {
            if (answer.questionId == questionId && answer.userId != null) {
                playersString = (playersString == null) ? `<@${answer.userId}>` : `${playersString}, <@${answer.userId}>`
            }
        });

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

/**
 * This function will process a game answer selection and record it in the database.
 */
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
            /**
             * @todo Send an ephemeral message
             * A 202 indicates that the player has already entered an answer
             */
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

/**
 * This function will handle the callback where a player (user) is ready to enter a answer (lie)
 */
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

/**
 * This function will process players (users) joining the game and update the database accordingly
 */
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