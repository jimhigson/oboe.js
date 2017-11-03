const concat = require('concat');
const uglify = require('uglify-js');
const fs = require('fs');

const pkg = require('./package.json');
const shortVersion = 'v'+pkg.version;
const fullVersion = require('child_process').execSync('git describe').toString().trim();
const version = fullVersion ? fullVersion : shortVersion;
fs.writeFileSync('build/version.js', '// '+version);

// NB: source files are order sensitive
const OBOE_BROWSER_SOURCE_FILES = [
  'build/version.js'
  ,  'src/LICENCE.js'
  ,  'src/functional.js'
  ,  'src/util.js'
  ,  'src/lists.js'
  ,  'src/libs/clarinet.js'
  ,  'src/ascentManager.js'
  ,  'src/parseResponseHeaders.browser.js'
  ,  'src/detectCrossOrigin.browser.js'
  ,  'src/streamingHttp.browser.js'
  ,  'src/jsonPathSyntax.js'
  ,  'src/ascent.js'
  ,  'src/incrementalContentBuilder.js'
  ,  'src/jsonPath.js'
  ,  'src/singleEventPubSub.js'
  ,  'src/pubSub.js'
  ,  'src/events.js'
  ,  'src/patternAdapter.js'
  ,  'src/instanceApi.js'
  ,  'src/wire.js'
  ,  'src/defaults.js'
  ,  'src/publicApi.js'
];

const OBOE_NODE_SOURCE_FILES = [
  'build/version.js'
  ,  'src/LICENCE.js'
  ,  'src/functional.js'
  ,  'src/util.js'
  ,  'src/lists.js'
  ,  'src/libs/clarinet.js'
  ,  'src/ascentManager.js'
  ,  'src/streamingHttp.node.js'
  ,  'src/jsonPathSyntax.js'
  ,  'src/ascent.js'
  ,  'src/incrementalContentBuilder.js'
  ,  'src/jsonPath.js'
  ,  'src/singleEventPubSub.js'
  ,  'src/pubSub.js'
  ,  'src/events.js'
  ,  'src/patternAdapter.js'
  ,  'src/instanceApi.js'
  ,  'src/wire.js'
  ,  'src/defaults.js'
  ,  'src/publicApi.js'
];

function wrapper(target){
  return fs
    .readFileSync('src/wrapper.' + target + '.js', 'utf8')
    .split('// ---contents--- //');
}
concat(OBOE_BROWSER_SOURCE_FILES).then(data => {
  const browserWrap = wrapper('browser');
  fs.writeFileSync('build/oboe-browser.concat.js', browserWrap[0]+data+browserWrap[1]);
  fs.writeFileSync('build/oboe-browser.min.js', uglify.minify(fs.readFileSync('build/oboe-browser.concat.js','utf8')).code,'utf8');
});

concat(OBOE_NODE_SOURCE_FILES).then(data => {
  const nodeWrap = wrapper('node');
  fs.writeFileSync('build/oboe-node.concat.js', nodeWrap[0]+data+nodeWrap[1]);
});