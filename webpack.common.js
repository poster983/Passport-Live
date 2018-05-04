const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const {InjectManifest} = require("workbox-webpack-plugin");


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
        filename: "[name].js",
        publicPath: "./js/webpack/",
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
            },
            {
                from: "./node_modules/loader-message/loader-message.min.js",
                to: "loader-message.min.js" //"polyfill/webcomponents-lite.js"
            }
        ]),
        //workbox service worker 
        new InjectManifest({
            swSrc: "./modules/webpack/sw.js",
            swDest: path.resolve(__dirname, "public", "sw.js"),
            include: [/\.html$/, /\.js$/, /\.css$/, /\.woff2$/],
            globDirectory: "./public",
            globPatterns: ["**/*.{js,css,woff2,html}"],
            globIgnores: ["**/sw.js", "**/js/webpack/**/*"],
            
        }),
        new CleanWebpackPlugin([
            "./public/js/webpack/precache-manifest.*.js" //workbox precash clean
        ], {
            dry: false //Testing
        })      
    ]

};