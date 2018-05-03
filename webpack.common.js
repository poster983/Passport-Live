const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        administratorImport: "./modules/webpack/entrypoints/administrator/import.js",
        administrator: "./modules/webpack/entrypoints/administrator/index.js",
        profile: "./modules/webpack/entrypoints/accounts/profile.js",
        student: "./modules/webpack/entrypoints/student/index.js",
        teacher: "./modules/webpack/entrypoints/teacher/index.js"
    },
    output: {
        path: path.resolve(__dirname, "public", "js", "webpack"), //__dirname + "/public/js/webpack"
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: {
                    loader: "html-loader"
                }
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/vertx/),
        new CopyWebpackPlugin([
            {
                from: "./node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js",
                to: path.resolve(__dirname, "public", "js", "polyfill") //"polyfill/webcomponents-lite.js"
            }
        ])
    ]

};