const { default: axios } = require('axios');
const { guid } = require('../helpers');

const newGame = (gameId, userId) => {
    const AWS_API_URL = process.env.AWS_API_ROOT;

    const questionId = guid();
    return axios.post(`${AWS_API_URL}/v1/games-create`, {
        gameId,
        questions: [
            {
                questionId,
                "question": "What year was Slack founded?"
            }
        ],
        answers: [
            {
                "answerId": guid(),
                questionId,
                "text": "2013",
                "truth": true,
                "userId": null
            }
        ],
        selections: [],
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
}

module.exports = newGame;