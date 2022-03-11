const TerserPlugin = require('terser-webpack-plugin');
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
	mode: 'none',
	entry: {
		'index':'./src/index.js',
	},
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },'ts-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
	output: {
		path: path.join(__dirname, './'),
		filename: "wx-webScoket.js",
		library:'wxWebSocket',
		libraryTarget:'umd',
		libraryExport: 'default',
		globalObject: 'this',
	},
	optimization: {
		minimize: true,
		minimizer:[
			new TerserPlugin({
				include: /.js$/,
			})
		]
	},
    plugins: [
        // new CleanWebpackPlugin()
    ]
};