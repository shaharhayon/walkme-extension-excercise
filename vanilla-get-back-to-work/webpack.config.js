// // const path = require('path')
// import path from 'path';
// // const CopyWebpackPlugin = require('copy-webpack-plugin');

// export default {
//     entry: {
//         background: './dist/ServiceWorker.js',
//         // content: './src/content.js',
//         // popup: './src/popup.js',
//     },
//     output: {
//         filename: '[name].js',
//         path: path.resolve(path.resolve(), 'dist'),
//         clean: true, // Clean the output directory before emit.
//     },
//     plugins: [
//         // new CopyWebpackPlugin({
//         //     patterns: [{ from: 'static' }],
//         // }),
//     ]
// }

import path from 'path'
import webpack from 'webpack'
// import CopyWebpackPlugin from 'copy-webpack-plugin'

const config = {
    entry: {
        background: './src/ServiceWorker.ts',
        // content: './src/content.ts',
        // popup: './src/popup.ts',
    },
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(path.resolve(), 'dist'),
        clean: true, // Clean the output directory before emit.
    },
    plugins: [
        // new CopyWebpackPlugin({
        //     patterns: [{from: 'static'}],
        // }),
    ]
}

export default config
