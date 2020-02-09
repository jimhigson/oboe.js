const oboe = require('../../dist/oboe-browser.js')

addEventListener('message', function (event) {
  oboe('http://127.0.0.1:4567/echoBackHeadersAsHeaders').node('!.*', function (node) {
    self.postMessage(node)
  });
});
