var testsContext = require.context(".", true, /(!publicApi)*\..*unit\.spec\.js/);
testsContext.keys().forEach(testsContext);