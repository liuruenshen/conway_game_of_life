/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint no-undef: "off" */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

const rootPath = __dirname;

module.exports = function (env, argv) {
  return {
    devtool: 'inline-source-map',
    entry: './src/index.tsx',
    output: {
      path: path.resolve(rootPath, 'dist'),
      filename: '[name].js',
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                configFile: path.resolve(rootPath, 'babel.config.js'),
              },
            },
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            argv.mode === 'development'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
      ],
    },

    devServer: {
      static: './dist',
      historyApiFallback: true,
      port: 9000,
      open: true,
    },

    plugins: [
      new HtmlWebpackPlugin({ template: './assets/template.html' }),
      new MiniCssExtractPlugin(),
      new DefinePlugin({
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  };
};
