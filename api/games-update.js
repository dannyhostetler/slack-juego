const { default: axios } = require('axios');

/**
 * This function accepts a Game ID, User ID and optionally Values to update game details in the database.
 * @param {string} gameId 
 * @param {string} userId
 * @param {Object} values (optional) 
 */
const gameUpdate = (gameId, userId, values=null) => {
    const AWS_API_URL = process.env.AWS_API_ROOT;

    return axios.patch(`${AWS_API_URL}/v1/games-create`, {
        gameId,
        userId,
        values
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });
}

module.exports = gameUpdate;