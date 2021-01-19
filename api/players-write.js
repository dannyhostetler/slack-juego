const { default: axios } = require('axios');

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