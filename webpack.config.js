const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup.js',
    window: './src/window.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    fallback: {
      'crypto': false
    }
  }
  
};