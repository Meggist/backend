/**
 * @desc Implements Promise.race.
 * @param promises
 */
module.exports = function (promises) {
    return new Promise((resolve, reject) => {
        promises.forEach(promise => {
            promise.catch(error => reject(error)).then(resolvedData => resolve(resolvedData))
        })
    })
}
