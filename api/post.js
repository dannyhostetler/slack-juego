const { default: axios } = require('axios');

const post = async (apiUrl, body) => {
    return await axios.post(apiUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });
}

module.exports = post;