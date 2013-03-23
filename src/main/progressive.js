require(['libs/clarinet', 'streamingXhr'], function(clarinet, streamingXhr) {

   (function (oboe) {

      var clarinet = window.clarinet || require('clarinet');

      /**
       * @param {Object} opt an object of options. Passed though
       * directly to clarinet.js but oboe.js does not
       * currently provide options.
       */
      oboe.parser = function(opt){
         return new oboeParser(opt);
      };
      
      function peek(array) {
         return array[array.length-1];
      }

      function isArray(a) {
         return a && a.constructor === Array;
      }

      function oboeParser(opt) {

         var clarinetParser = clarinet.parser(opt);

         this._thingFoundListeners = [];
         this._pathMatchedListeners = [];
         this._clarinet = clarinetParser;

         var   oboe = this
         ,     root
         ,     curNode
         ,     curKey
         ,     nodeStack = [] // TODO: use fastlist
         ,     pathStack = [];


         clarinetParser.onkey = function (nextKey) {
            notifyListeners(oboe._pathMatchedListeners, null, pathStack.concat(nextKey));

            curKey = nextKey;
         };
         clarinetParser.onvalue = function (value) {
            // onvalue is only called by clarinet for non-structured values
            // (ie, not arrays or objects).

            notifyListeners(oboe._thingFoundListeners, value, pathStack.concat(curKey));

            if( isArray(curNode) ) {
               curNode.push(value);
               curKey++;
            } else {
               curNode[curKey] = value;
               curKey = null;
            }

         };
         clarinetParser.onopenobject = function (firstKey) {

            var newObj = {};

            notifyListeners(oboe._pathMatchedListeners, newObj, pathStack);
            notifyListeners(oboe._pathMatchedListeners, null, pathStack.concat(firstKey));

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

            // clarinet always gives the first key of the new object.
            curKey = firstKey;

         };
         clarinetParser.onopenarray = function () {

            var newArray = [];
            curNode[curKey] = newArray;
            curNode = newArray;
            nodeStack.push(newArray);
            pathStack.push(curKey);

            notifyListeners(oboe._pathMatchedListeners, newArray, pathStack);

            curKey = 0;
         };

         clarinetParser.onend =
         clarinetParser.oncloseobject =
         clarinetParser.onclosearray = function () {

            notifyListeners(oboe._thingFoundListeners, curNode, pathStack);

            nodeStack.pop();
            pathStack.pop();
            curNode = peek(nodeStack);

            if( isArray(curNode) ) {
               curKey = curNode.length;
            }

         };

         clarinetParser.onerror = function (e) {
            if( oboe.onerror ) {
               oboe.onerror(e);
            }
         };
      }

      oboeParser.prototype.fetch = function(url) {

         // TODO: in if in node, use require('http') instead
         // of ajax

         streamingXhr.fetch(url, this.read.bind(this));

         return this;
      };

      function notifyListeners ( listenerList, foundNode, path ) {

         var stringPath = '//' + path.join('/'),
             // we don't want callback to be able to change internal state
             // of the parser so make a copy of the path:
             pathCopy = Array.prototype.slice.call(path, 0);

         listenerList.filter( function( notify ){

            return notify.regex.test( stringPath );
         }).forEach( function(notify) {

            notify.callback( foundNode, pathCopy, notify.pattern );
         });
      }

      /**
       * called when there is new text to parse
       *
       * @param {String} nextDrip
       */
      oboeParser.prototype.read = function (nextDrip) {
         this._clarinet.write(nextDrip);
      };

      function patternToRegex(pattern) {
         // convert the pattern into a regular expression using
         // an admittedly fairly incomprehensible pile of regular
         // expressions:
         var regexPattern = pattern
               .replace(/\w+/g, '$&(\\b|$)')
               .replace(/\*\*/g, '__any__')
               .replace(/\*/g, '(//|[^\\/]+?)')
               .replace(/\/\//, '^\\/\\/')
               .replace(/__any__/g, '.*?')

         regexPattern += '$';

         return new RegExp(regexPattern);
      }


      /**
       * @returns {*} an identifier that can later be used to de-register this listener
       */
      function pushListener(listenerList, pattern, callback) {
         return listenerList.push({
            pattern: pattern,
            regex: patternToRegex(pattern),
            callback: callback
         });
      }

      /**
       * Add a new pattern to the parser, to be called as soon as the path is found, but before we know
       * what value will be in there.
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
      oboeParser.prototype.onPath = function (pattern, callback) {

         pushListener(this._pathMatchedListeners, pattern, callback);
         return this;
      };

      /**
       * Add a new pattern to the parser, which will be called when a value is found at the given path
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
      oboeParser.prototype.onFind = function (pattern, callback) {

         pushListener(this._thingFoundListeners, pattern, callback);
         return this;
      };

   })(typeof exports === "undefined" ? oboe = {} : exports);
});