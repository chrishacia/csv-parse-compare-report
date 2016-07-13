var fs = require('fs');
var os = require('os');
var path = require('path');
var child_process = require('child_process');
var ini = require('ini');

var webpack = require('webpack');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

var files = fs.readdirSync('./src/scripts/').filter(function (file) {
  return path.extname(file) === '.js';
});

var entries = files.reduce(function (obj, file, index) {
  var key = path.basename(file, '.js');
  obj[key] = [
    './src/scripts/' + key
  ];
  return obj;
}, {});

var scriptsDir = 'dist/scripts/'


// chunkName: 'vendor'
entries.vendor = [
    'jquery',
    'underscore',
    'backbone-react-component',
    'bootstrap-sass',
    'backbone',
    'moment',
    'react',
    'react-dom'
];

module.exports = {
  devtool: 'eval',
  externals: {
      raven: 'Raven',
      mixpanel: true
  },
  entry: entries,
  output: {
    filename: scriptsDir + '[name].js'
  },
  plugins: [
    // eg:  new webpack.optimize.CommonsChunkPlugin('dist/scripts/init.js'),
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */ 'vendor', /* filename= */ scriptsDir + 'vendor.js'),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new BrowserSyncPlugin({
      proxy: {
        target: 'https://' + os.hostname(), // hostname example: sub1.chacia.com
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(__dirname, 'src')
      }
    ]
  }
};
