var testsContext = require.context(".", true, /(unit|component)\.spec\.js/);
testsContext.keys().forEach(testsContext);