const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const version = fs.readFileSync('./build/version.txt', 'utf8');

module.exports = {
  entry: {
    'oboe-browser': './src/entry.js',
    'oboe-browser.min': './src/entry.js',
    'oboe-node': './src/entry.js'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "oboe",
    libraryTarget: 'umd2',
    libraryExport: 'default',
    umdNamedDefine: true
  },
  plugins: [
    new UglifyJsPlugin({
      test: /min/,
    }),
    new webpack.BannerPlugin(version)
  ]
}