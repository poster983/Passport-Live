const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: {
        administratorImport: "./modules/webpack/entrypoints/administrator/import.js",
        profile: "./modules/webpack/entrypoints/accounts/profile.js"
    },
    output: {
        path: __dirname + "/public/js/webpack",
        filename: "[name].js"
    },
    plugins: [
        /*new UglifyJsPlugin({
            parallel: 4,
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        })*/
    ]

};