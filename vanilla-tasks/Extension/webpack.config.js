import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
const config = {
    entry: {
        background: './src/background/index.ts',
        content: './src/content/index.ts',
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
            }
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(path.resolve(), 'dist'),
        clean: true, // Clean the output directory before emit.
    },
    plugins: [
        // Configure the copy plugin to copy files
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'res', // Source directory
                    // to: path.resolve(__dirname, 'dist'),   // Destination directory
                    noErrorOnMissing: true,  // Optional: prevents errors if source doesn't exist
                },
            ],
        }),
    ],
    mode: 'development',
    devtool: 'inline-source-map'
}

export default config
