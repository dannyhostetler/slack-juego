/**
 * This function will return the blocks to display the final game results.
 * @param {string} channel 
 * @param {string} ts 
 * @param {Array} players 
 */

const endGamePost = (channel, ts, players) => {
    const sortedPlayers = players.sort((a,b) => {
        return b.score - a.score;
    })

    /**
     * @todo There is a more effienct way to write these lines of code.
     */
    let leaderboardString;
    let playerNumber = 0;
    for(let player of sortedPlayers){
        if(playerNumber == 0) {
            leaderboardString = `:first_place_medal: <@${player.userId}> (${player.score} points)`
        } else if(playerNumber == 1) {
            leaderboardString = `${leaderboardString}\n:second_place_medal: <@${player.userId}> (${player.score} points)`;
        } else if(playerNumber == 2) {
            leaderboardString = `${leaderboardString}\n:third_place_medal: <@${player.userId}> (${player.score} points)`;
        } else {
            leaderboardString = `${leaderboardString}\n<@${player.userId}> (${player.score} points)`;
        }
        playerNumber += 1;
    }

    return {
        channel,
        ts,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "We just completed a game of Fibbage. Here are the results:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Winner*\n:trophy: <@${sortedPlayers[0].userId}>\n\n*Leaderboard*\n${leaderboardString}`
                }
            }
        ]
    }
}

module.exports = endGamePost;