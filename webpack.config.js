const path = require('path')
const fs = require('fs')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const version = fs.readFileSync('./build/version.txt', 'utf8')

module.exports = {
  mode: 'production',
  entry: {
    'oboe-browser': './src/entry.js',
    'oboe-browser.min': './src/entry.js'
  },
  target: 'web',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: false
        }
      },
      extractComments: false,
      parallel: true
    })]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'oboe',
    libraryTarget: 'umd2',
    libraryExport: 'default',
    umdNamedDefine: true
  },
  plugins: [
    new webpack.BannerPlugin(version)
  ]
}
