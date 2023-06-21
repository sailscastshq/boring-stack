/**
 * Module dependencies
 */

 const path = require('path');
 const { CleanWebpackPlugin } = require('clean-webpack-plugin');
 const CopyWebpackPlugin = require('copy-webpack-plugin');
 const { VueLoaderPlugin } = require('vue-loader')
 const MiniCssExtractPlugin = require("mini-css-extract-plugin");
 const webpack = require('webpack');

 /**
  * A basic Webpack config to use with a Sails app.
  *
  * This config is used by the api/hooks/webpack hook which initializes a
  * Webpack compiler in "watch" mode.
  *
  * See https://webpack.js.org/configuration for a full guide to Webpack config.
  *
  */
 module.exports.webpack = {
   mode: 'development',
   resolve: {
     extensions: ['.vue', '...'],
     alias: {
      '~': path.resolve(__dirname, '..', 'assets'),
      '@': path.resolve(__dirname, '..', 'assets', 'js')
    }
   },

   /***************************************************************************
   *                                                                          *
   * Create one item in the `entry` dictionary for each page in your app.     *
   *                                                                          *
   ***************************************************************************/
   entry: {
     'app': './assets/js/app.js',
   },


   /***************************************************************************
   *                                                                          *
   * Output bundled .js files with a `.bundle.js` extension into              *
   * the `.tmp/public/js` directory                                           *
   *                                                                          *
   ***************************************************************************/
   output: {
     filename: 'js/[name].bundle.js',
     path: path.resolve(__dirname, '..', '.tmp', 'public')
   },

   /***************************************************************************
   *                                                                          *
   * Set up a couple of rules for processing .css and .less files. These will *
   * be extracted into their own bundles when they're imported in a           *
   * JavaScript file.                                                         *
   *                                                                          *
   ***************************************************************************/
   module: {
     rules: [
       {
         test: /\.css$/i,
         use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
       },
       {
         test: /\.vue$/,
         loader: 'vue-loader'
       },
     ],
   },

   /***************************************************************************
   *                                                                          *
   * Set up some plugins to help with Sails development using Webpack.        *
   *                                                                          *
   ***************************************************************************/
   plugins: [
     // This plugin extracts CSS that was imported into .js files, and bundles
     // it into separate .css files.  The filename is based on the name of the
     // .js file that the CSS was imported into.
     new MiniCssExtractPlugin({
       filename: 'css/[name].bundle.css'
     }),

     // This plugin cleans out your .tmp/public folder before lifting.
     new CleanWebpackPlugin({
       verbose: true,
       dry: false
     }),

     // This plugin copies the `images` and `fonts` folders into
     // the .tmp/public folder.  You can add any other static asset
     // folders to this list and they'll be copied as well.
     new CopyWebpackPlugin({
       patterns: [
         {
           from: "./assets/images",
           to: path.resolve(__dirname, "..", ".tmp", "public", "images")
         },
         {
           from: "./assets/fonts",
           to: path.resolve(__dirname, "..", ".tmp", "public", "fonts")
         }
       ]
     }),
     new VueLoaderPlugin(),
     new webpack.DefinePlugin({
         __VUE_OPTIONS_API__: true,
         __VUE_PROD_DEVTOOLS__: false
     })
   ],

 };
