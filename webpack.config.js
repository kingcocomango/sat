var path = require("path");
var webpack = require("webpack");

module.exports = {
	entry: "./src/main.js",
	output: {
		path: __dirname,
		filename: "./public/bundle.js"
	},
	module: {
		rules: [{
			test: /.jsx?$/,
			exclude: /node_modules/,
			use: {
				loader: "babel-loader",
				query: {
					presets: ["es2015", "react"]
				}
			}
		}, {
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: "eslint-loader",
				options: {
					// eslint options (if necessary)
				},
			}
		},
		{
			test: /\.scss$/,
			exclude: /(node_modules|bower_components)/,
			use: [{
				loader: "style-loader"
			}, {
				loader: "css-loader"
			}, {
				loader: "sass-loader",
			}]
		},
		]
	},
};