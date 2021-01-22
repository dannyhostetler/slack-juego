const { default: axios } = require('axios');
const { guid } = require('../helpers');

/**
 * This function accepts a Game ID and User ID then creates a new game in the database.
 * @param {string} gameId 
 * @param {string} userId 
 */
const newGame = (gameId, userId) => {
    const AWS_API_URL = process.env.AWS_API_ROOT;

    const questionId1 = "53d10910-e9d0-7ea6-9890-74e1c37eeb61";
    const questionId2 = "8cd9ee6a-b823-52ee-d2d6-904d4e373a6f";

    return axios.post(`${AWS_API_URL}/v1/games-create`, {
        gameId,
        questions: [
            {
                "questionId": questionId1,
                "question": "In which city is Slack headquartered?"
            },
            {
                "questionId": questionId2,
                "question": "Who is the CEO of Slack?"
            }
        ],
        answers: [
            {
                "answerId": guid(),
                "questionId": questionId1,
                "text": "San Francisco",
                "truth": true,
                "userId": null
            },
            {
                "answerId": guid(),
                "questionId": questionId2,
                "text": "Steward Butterfield",
                "truth": true,
                "userId": null
            }
        ],
        selections: [],
        numberOfPlayers: 1,
        players: [
            {
                userId,
                score: 0
            }
        ]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });
}

module.exports = newGame;