/**
 * The function will simulate a timeout period (specified in ms).
 * @param {Number} ms amount of miliseconds to set timeout
 */
const timeout = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
} 

module.exports = timeout;