const { default: axios } = require('axios');

const patch = async (apiUrl, body) => {
    return await axios.patch(apiUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.AWS_API_KEY
        }
    });
}

module.exports = patch;