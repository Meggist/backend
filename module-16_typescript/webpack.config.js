const path = require('path');

module.exports = {
    entry: './src/script/converter.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src/script')]
            }
        ]
    },
    output: {
        filename: 'convert.js',
        path: path.resolve(__dirname, 'build/script')
    }
}