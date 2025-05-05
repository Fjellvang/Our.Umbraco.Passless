const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
// const magicImporter = require('node-sass-magic-importer');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
    entry: {
        script: './App_Plugins/UmbracoPassless/index.ts',
        style: './App_Plugins/UmbracoPassless/style.scss'
    },
    output: {
        path: path.resolve(__dirname, '../dist/UmbracoPassless'),
        filename: '[name].bundle.js',
        publicPath: '/dist/UmbracoPassless/',
        assetModuleFilename: '[path][name][ext]'
    },
    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'                ]
            }
        ]
    },
    resolve: {
        extensions: [
            '.tsx',
            '.ts',
            '.js'
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new RemoveEmptyScriptsPlugin(),
        new CopyPlugin({
            patterns: [
                { from: '**/*.{html,svg}', to: '.', context: 'App_Plugins/UmbracoPassless' },
                { from: 'lang/**/*.*', to: '.', context: 'App_Plugins/UmbracoPassless' },
                { from: 'package.manifest', to: '.', context: 'App_Plugins/UmbracoPassless' }
            ]
        })
    ],
    devtool: "source-map"
};

module.exports = config;