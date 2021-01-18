const { default: axios } = require('axios');

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