const oboeWorker = new Worker('../libs/worker.js', { type: 'module' });

describe('webworker', function () {
  it('should return data from worker', function (done) {
    oboeWorker.onmessage = function (event) {
      expect(['content', 'headers']).toContain(event.data)
      done()
    };

    oboeWorker.onerrror = function (event) { 
      done('Test failed')
    };

    oboeWorker.postMessage('Start test');
  });
});
