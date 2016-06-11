require('babel-register')({
  ignore: function(filename) {
    return filename.indexOf('/node_modules/') >= 0;
  }
});
require('babel-polyfill')
require('./server');
