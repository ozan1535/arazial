const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
      clean: true, // Clean dist folder before each build
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: isProduction ? '[name].[contenthash].[ext]' : '[name].[ext]',
                outputPath: 'images/'
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "vm": require.resolve("vm-browserify")
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        meta: {
          'cache-control': { 'http-equiv': 'cache-control', content: 'no-cache, no-store, must-revalidate' },
          'pragma': { 'http-equiv': 'pragma', content: 'no-cache' },
          'expires': { 'http-equiv': 'expires', content: '0' }
        }
      }),
      new Dotenv()
    ],
    devServer: {
      historyApiFallback: true,
      port: 3000,
      hot: true
    }
  };
};