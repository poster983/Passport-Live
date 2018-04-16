const merge = require("webpack-merge");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const common = require("./webpack.common.js");
const webpack = require("webpack");

module.exports = merge(common, {
    devtool: "source-map",
    plugins: [
        new UglifyJsPlugin({
            parallel: 4,
            sourceMap: true,
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ]
});