var path = require('path');
var webpack = require('webpack');
var merge = require('merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = {
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};

console.log(`loading webpack.config.js for mode [${process.env.NODE_ENV}]`)

if (process.env.NODE_ENV === 'production') {
  webpackConfig = merge(webpackConfig, {
    devtool: "source-map",
    entry: [
      './src/client/index.js'
    ],
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: __dirname,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy']
        }
      },
      { test: /\.(png|jpg|gif|jpeg|ico|svg)$/, loader: 'file-loader?name=images/[name].[ext]?v=[hash]' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap') }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new ExtractTextPlugin("app.css"),
      new webpack.optimize.UglifyJsPlugin({
        minimize: true
      })
    ]
  });
} else {
  webpackConfig = merge(webpackConfig, {
    devtool: 'inline-source-map',
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy']
        }
      },
      { test: /\.(png|jpg|gif|jpeg|ico|svg)$/, loader: 'file-loader?name=images/[name].[ext]?v=[hash]' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap') }]
    },
    entry: [
      'webpack-hot-middleware/client',
      './src/client/index.js'
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin("app.css")
    ]
  });
}

module.exports = webpackConfig;
