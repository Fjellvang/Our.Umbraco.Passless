const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv)  => ({
    output: {
        filename: '[name].js',
        chunkFilename: 'chunks/[name].[chunkhash].js',
        publicPath: '/App_Plugins/Headless/',
    },
    mode: argv.mode,
    devServer: {
        port: 9001,
        proxy: {
            '*': 'http://localhost:44384',
        },
        devMiddleware: {
            writeToDisk: true
        },
        static: {
            directory: path.join(__dirname, 'dist'),
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "App_Plugins" },
            ],
        }),
    ],
});
