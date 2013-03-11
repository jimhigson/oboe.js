require(['libs/clarinet', 'streamingXhr'], function(clarinet, streamingXhr) {

   (function (progressive) {

      var clarinet = window.clarinet || require('clarinet');

      /**
       * @param {Object} opt an object of options. Passed though
       * directly to clarinet.js but progressive.js does not
       * currently provide options.
       */
      progressive.parser = function(opt){
         return new ProgressiveParser(opt);
      };

      function peek(array) {
         return array[array.length-1];
      }

      function isArray(a) {
         return a && a.constructor === Array;
      }

      function ProgressiveParser(opt) {

         var clarinetParser = clarinet.parser(opt);

         this._notifies = [];
         this._clarinet = clarinetParser;

         var   progressive = this
         ,     root
         ,     curNode
         ,     curKey
         ,     nodeStack = [] // TODO: use fastlist
         ,     pathStack = [];


         clarinetParser.onkey = function (key) {
            curKey = key;
         };
         clarinetParser.onvalue = function (value) {
            progressive._notifyMatches(value, pathStack.concat(curKey));

            // this is only called for non-structured values (ie, not arrays or objects).

            if( isArray(curNode) ) {
               curNode.push(value);
               curKey++;
            } else {
               curNode[curKey] = value;
               curKey = null;
            }

         };
         clarinetParser.onopenobject = function (k) {
            // k is the first key of the new object
            var newObj = {};

            if( curNode ) {
               curNode[curKey] = newObj;
            }
            curNode = newObj;
            nodeStack.push(newObj);

            if( !root ) {
               root = curNode;
            } else {
               pathStack.push(curKey);
            }
            curKey = k;

         };
         clarinetParser.onopenarray = function () {

            var newArray = [];
            curNode[curKey] = newArray;
            curNode = newArray;
            nodeStack.push(newArray);
            pathStack.push(curKey);

            curKey = 0;
            open([]);
         };

         clarinetParser.onend =
         clarinetParser.oncloseobject =
         clarinetParser.onclosearray = function () {

            progressive._notifyMatches(curNode, pathStack);

            nodeStack.pop();
            pathStack.pop();
            curNode = peek(nodeStack);

            if( isArray(curNode) ) {
               curKey = curNode.length;
            }

         };

         clarinetParser.onerror = function (e) {
            if( progressive.onerror ) {
               progressive.onerror(e);
            }
         };
      }

      ProgressiveParser.prototype.fetch = function(url) {

         // TODO: in if in node, use require('http') instead
         // of ajax

         streamingXhr.fetch(url, this.read.bind(this));

         return this;
      };

      ProgressiveParser.prototype._notifyMatches = function( foundNode, path ) {

         var stringPath = '//' + path.join('/'),
             // we don't want callback to be able to change internal state
             // of the parser so make a copy of the path:
             pathCopy = Array.prototype.slice.call(path, 0);

         this._notifies.filter( function( notify ){

            return notify.regex.test( stringPath );
         }).forEach( function(notify) {

            notify.callback( foundNode, pathCopy, notify.pattern );
         });

      };

      /**
       * called when there is new text to parse
       *
       * @param {String} nextDrip
       */
      ProgressiveParser.prototype.read = function (nextDrip) {
         this._clarinet.write(nextDrip);
      };

      /**
       * Add a new pattern to the parser
       *
       * @param {String} pattern
       *    supports these special meanings:
       *          //                - root json object
       *          /                 - path separator
       *          *                 - any named node in the path
       *          **                - any number of intermediate nodes (non-greedy)
       *
       * @param {Function} callback
       */
      ProgressiveParser.prototype.onMatch = function (pattern, callback) {

         // convert the pattern into a regular expression using
         // an admittedly fairly incomprehensible pile of regular
         // expressions:
         var regexPattern = pattern
               .replace(/\w+/g, '$&(\\b|$)')
               .replace(/\*\*/g, '__any__')
               .replace(/\*/g, '(//|[^\\/]+?)')
               .replace(/\/\//, '^\\/\\/')
               .replace(/__any__/g, '.*?')

         ,   regex = new RegExp(regexPattern);

         this._notifies.push({
            pattern: pattern,
            regex: regex,
            callback: callback
         });
      };

   })(typeof exports === "undefined" ? progressive = {} : exports);
});