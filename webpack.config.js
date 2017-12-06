const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        administratorImport: "./modules/webpack/entrypoints/administrator/import.js",
        studentProfile: "./modules/webpack/entrypoints/student/profile.js",
        //passpoot: "./index.js"
    },
    output: {
        path: __dirname + "/public/js/webpack",
        filename: "[name].js"
    },
    plugins: [
        new UglifyJsPlugin({
            parallel: 4,
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        })
    ]

};