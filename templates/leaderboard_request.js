const leaderboard = async (playersList, client) => {

    let res = {
        "response_type": "in_channel",
        "replace_original": false,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Let's get this party started :partying_face: \n\n :wave: I'm Fibbage bot and I will be facilitating this game. There will be five (5) rounds and in each round I will ask a question and you will be presented with a prompt to enter a lie. The goal is to fool your colleagues with your lies, avoid theirs, and find the (usually outrageous) truth to each question. \n\n Here are the players in this game :point_down:"
                }
            }
        ]
    };

    const getData = async (playersList) => {
        return Promise.all(playersList.map(async (player) => {
            const userInfo = await client.users.info({
                user: player
            });

            return {
                "type": "context",
                "elements": [
                    {
                        "type": "image",
                        "image_url": `${userInfo.user.profile.image_32}`,
                        "alt_text": "user icon"
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*${userInfo.user.real_name}*`
                    }
                ]
            }
        }))

    }

    const userBlocks = await getData(playersList);

    userBlocks.map((b) => {
        res.blocks.push({"type": "divider"});
        res.blocks.push(b);
        res.blocks.push({"type": "divider"});
    })

    res.blocks.push({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": ":watch: Game will start in 5 seconds"
        }
    })

    return res;
}


module.exports = leaderboard;