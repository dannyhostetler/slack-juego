const { default: axios } = require('axios');
/**
 * This function accepts a Player ID (Slack User ID) and Score to create or update player information in the database.
 * @param {string} playerId 
 * @param {string} score
 */
const playerWrite = (playerId, score) => {
    const AWS_API_URL = process.env.AWS_API_ROOT;

    return axios.post(`${AWS_API_URL}/v1/players-write`, {
        playerId,
        score
    }, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });
}

module.exports = playerWrite;