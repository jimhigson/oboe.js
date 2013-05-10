#!/bin/bash

# Since the grunt jstd plugin doesn't support v3, here's a little
# shell script to do the same. Usage is:
#
#   runtests.sh   # run all tests
#   runtests.sh   # run named tests

# Edit these variables to suit your install:
JSTD_JAR=~/dev/jstestdriver/JsTestDriver-1.3.5.jar
SERVER=http://localhost:4224
BASEPATH=~/Sites/progressivejson/

if [ "$1" ] ; then
  TESTS=$1
else
  echo "no tests specified, will run all"
  TESTS=all
fi

echo "Will run oboe json tests(" ${TESTS} ") against unminified code"
java -jar ${JSTD_JAR} --captureConsole --config src/test/jsTestDriver-dev.conf --server ${SERVER} --tests ${TESTS} --basePath ${BASEPATH} --reset &&

echo &&

export PATH=$PATH:/usr/local/bin/ &&
grunt &&

echo "Will run oboe json tests(" ${TESTS} ") against concatenated code" &&
java -jar ${JSTD_JAR} --captureConsole --config src/test/jsTestDriver-concat.conf --server ${SERVER} --tests ${TESTS} --basePath ${BASEPATH} --reset &&

echo "Will run oboe json tests(" ${TESTS} ") against minified code" &&
java -jar ${JSTD_JAR} --captureConsole --config src/test/jsTestDriver-minified.conf --server ${SERVER} --tests ${TESTS} --basePath ${BASEPATH} --reset

mv oboe.concat.js oboe.js 

