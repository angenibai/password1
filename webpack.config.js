const path = require('path')

module.exports = {
  entry: {
    popup: './src/window.js',
    window: './src/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
  
};