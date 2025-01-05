import path from 'path'

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
    plugins: [],
    mode: 'development',
    devtool: 'inline-source-map'
}

export default config
