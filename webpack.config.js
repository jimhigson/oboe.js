const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const version = fs.readFileSync('./build/version.txt', 'utf8')

module.exports = {
  mode: 'production',
  entry: {
    'oboe-browser': './src/entry.js',
    'oboe-browser.min': './src/entry.js'
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'oboe',
    libraryTarget: 'umd2',
    libraryExport: 'default',
    umdNamedDefine: true,
    globalObject: `(function(){
      if (typeof self !== 'undefined') {
          return self;
      } else if (typeof window !== 'undefined') {
          return window;
      } else if (typeof global !== 'undefined') {
          return global;
      } else {
          return Function('return this')();
      }
  })()`
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new UglifyJsPlugin({
      test: /min/
    }),
    new webpack.BannerPlugin(version)
  ]
}
