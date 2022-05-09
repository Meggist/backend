/**
 * @desc Implements Promise.all.
 * @param promises
 */
module.exports = function (promises) {
    return new Promise(async (resolve,reject) => {
        let results = []
        for (let promise of promises) {
            const resultedData = await promise.catch(error => reject(error)).then(resolvedData => resolvedData)
            results.push(resultedData)
            if (results.length === promises.length) {
                resolve(results)
            }
        }
    })
}
