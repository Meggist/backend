const path = require('path');
const fs = require('fs');

async function scan(directoryName, results = [], data) {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryName, {withFileTypes: true}, async (err, result) => {
            if (err) {
                reject(err)
            } else {
                    for (let f of result) {
                        let fullPath = path.join(directoryName, f.name);
                        if (f.isDirectory()) {
                            ++data.totalSubFolders;
                            await scan(fullPath, results, data);
                        } else {
                            results.push(fullPath);
                        }
                    }
                    resolve(results);
            }
        })
    })
}

async function analyze (folderPath, callback) {
    const data = {
        totalSubFolders: 0,
        totalFiles: 0,
        fileTypesInformation: []
    }
    try {
        const result = await scan(folderPath,[], data);
        data.totalFiles = result.length;
        result.forEach(file => {
            const isFirstType = data.fileTypesInformation.every(item => {
                if (item.fileExtension === path.extname(file)) {
                    ++item.fileCount
                    return false
                } else {
                    return true
                }
            })

            if (isFirstType) {
                data.fileTypesInformation.push({
                    fileCount: 1,
                    fileExtension: path.extname(file)
                })
            }
        })
        callback(null, data)
    }    catch (e) {
        callback(e)
    }
}
module.exports = analyze;

