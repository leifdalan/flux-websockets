// Webpack configuration
var path = require('path');
var webpack = require('webpack');
require('strip-loader');

module.exports = {
  // devtool: 'eval-source-map',
  cache: true,
  progress: true,
  colors: true,
  entry: {
    client: './client.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!react-router)/,
        loaders: [
          'babel-loader?stage=0',
          'strip-loader?strip[]=debug'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Signal production mode for React JS libs.
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    // Optimize
    new webpack.NormalModuleReplacementPlugin(
      /debug/, process.cwd() + '/utils/noop.js'
    ),
    new webpack.optimize.DedupePlugin()

  ]
};
