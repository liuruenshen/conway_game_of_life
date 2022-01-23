/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint no-undef: "off" */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { default: MiniCssExtractPlugin } = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

const rootPath = __dirname;

module.exports = function (env, argv) {
  return {
    devtool: 'inline-source-map',
    entry: './src/client/index.tsx',
    cache: {
      type: 'filesystem',
    },

    output: {
      path: path.resolve(rootPath, 'dist'),
      filename: '[name].js',
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      symlinks: false,
    },

    module: {
      rules: [
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
          include: path.resolve(__dirname, 'src'),
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
        WEBPACK_MODE: JSON.stringify(argv.mode),
      }),
    ],
  };
};
