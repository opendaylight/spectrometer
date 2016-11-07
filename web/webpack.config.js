/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/

var path = require('path');
var webpack = require('webpack');
var merge = require('merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var mode = process.env.NODE_ENV;

var baseWebpackConfig = {
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

function compileForDevelopment() {
  return {
    devtool: "inline-source-map",
    entry: [
      'webpack-hot-middleware/client',
      './assets/styles/index.scss',
      './src/client/index.js'
    ],
    module: {
      loaders: [{
        test: /\.js?$/,
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
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css?autoprefixer&minimize!resolve-url!sass-loader') }]
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        },
        'process.browser': true
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin("app.css")
    ]
  }
}

function compileForProduction() {
  return {
    devtool: "source-map",
    entry: [
      './src/client/index.js',
      './assets/styles/index.scss',
    ],
    module: {
      loaders: [{
        test: /\.js?$/,
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
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css?autoprefixer&minimize!resolve-url!sass-loader') }]
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        },
        'process.browser': true
      }),
      new ExtractTextPlugin("app.css"),
      new webpack.optimize.UglifyJsPlugin({
        minimize: true
      })
    ]
  }
}

console.log(`loading webpack.config.js in mode [${mode}]`);
var webpackConfig = mode === 'development' ? compileForDevelopment() : compileForProduction();
webpackConfig = merge(baseWebpackConfig, webpackConfig);
module.exports = webpackConfig;
