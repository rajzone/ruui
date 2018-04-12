const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');

let brightFlag = false, initialBuild = true;
const env = process.env.ENV || 'dev',
	port = process.env.PORT || 3000,
	isProduction = env === 'production',
	publicPath = '/',
	htmlOptions = { isProduction, publicPath, useVendorChunks: false },
	optionalPlugins = [],
	polyfills = ['babel-polyfill'],
	entries = ['./index.web.js'],
	hot = [
		'react-hot-loader/patch',
		`webpack-dev-server/client?${publicPath}`,
		'webpack/hot/only-dev-server',
	];

if (!isProduction) {
	const cachePath = path.resolve(process.cwd(), 'web', 'vendor-manifest.json');

	optionalPlugins.push(new webpack.HotModuleReplacementPlugin());
	optionalPlugins.push(new webpack.NamedModulesPlugin());
	// optionalPlugins.push(new webpack.NoEmitOnErrorsPlugin());

	if (fs.existsSync(cachePath)) {
		htmlOptions.useVendorChunks = true;
		optionalPlugins.push(new webpack.DllReferencePlugin({
			context: '.', manifest: require(cachePath),
		}));
	}

	if (!htmlOptions.useVendorChunks) {
		console.log(chalk.whiteBright('｢ruui｣'), chalk.gray('not using ') + chalk.green('cache') +
			chalk.gray(', run ') + chalk.magenta('ruui cache') + chalk.gray(' once to boost up build speed..'));
	}
} else {
	optionalPlugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
	context: process.cwd(),
	cache: true,
	devtool: isProduction ? false : 'eval-source-map',
	entry: {
		app: isProduction ? [...polyfills, ...entries] : [...polyfills, ...hot, ...entries]
	},
	output: {
		publicPath,
		path: path.resolve(process.cwd(), 'web'),
		filename: '[name].bundle-[hash].js',
		chunkFilename: '[name].js',
	},
	resolve: {
		alias: {
			'react-native': 'react-native-web',
		},
		modules: ['node_modules'],
		extensions: ['.js']
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				loader: 'babel-loader',
				options: {
					cacheDirectory: true,
					plugins: ['react-hot-loader/babel', ]
				}
			},
			{ test: /\.css$/, loader: 'style-loader!css-loader' },
			{
				test: /\.(png|jpg|svg|ttf)$/,
				loader: 'file-loader?name=[name].[ext]'
			},
			{
				test: /\.json/,
				loader: 'json-loader'
			}
		],
	},
	plugins: [
		new DefinePlugin({
			ENV: JSON.stringify(env),
			'process.env.NODE_ENV': JSON.stringify(env),
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new HtmlWebpackPlugin({
			...htmlOptions,
			template: path.resolve(process.cwd(), 'node_modules', 'react-universal-ui', 'cli-local', 'tools', 'index.ejs'),
			filename: 'index.html',
		}),
		new ProgressBarPlugin({
			width: 32, complete: chalk.whiteBright('░'), incomplete: chalk.gray('░'),
			format: 'building ⸨:bar⸩ (:elapsed seconds)',
			summary: false, customSummary: (buildTime) => {
				const alternatedColor = brightFlag ? chalk.whiteBright : chalk.gray,
					ruuiBullet = `${chalk.whiteBright('｢')}${alternatedColor('ruui')}${chalk.whiteBright('｣')}`,
					buildType = initialBuild ? 'initial build' : 'hot rebuild',
					buildFlag = isProduction ? 'production bundle' : buildType,
					trailingSpace = initialBuild ? '' : '  ';

				console.log(ruuiBullet, chalk.gray(`${buildFlag} completed after${trailingSpace}`), chalk.whiteBright(`${buildTime}`));
				brightFlag = !brightFlag;
				initialBuild = false;
			},
		}),
		...optionalPlugins,
	]
};