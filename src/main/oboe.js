require(['libs/clarinet', 'streamingXhr', 'paths'], function(clarinet, streamingXhr, paths) {

   (function (oboe) {

      var paths = window.paths || require('paths'),
          clarinet = window.clarinet || require('clarinet'),
          streamingXhr = window.streamingXhr || require('streamingXhr');

      /**
       * @param {Object} opt an object of options. Passed though
       * directly to clarinet.js but oboe.js does not
       * currently provide options.
       */
      oboe.parser = function(opt){
         return new OboeParser(opt);
      };

      /**
       * Convenient alias. Creates a new parser, starts an ajax request and returns the parser
       * ready to call .onPath() or .onFind() to register some callbacks
       * @param url
       */
      oboe.fetch = function(url){
         return new OboeParser().fetch(url);
      };      

      function peek(array) {
         return array[array.length-1];
      }

      function isArray(a) {
         return a && a.constructor === Array;
      }

      function OboeParser(opt) {

         var clarinetParser = clarinet.parser(opt);

         this._thingFoundListeners = [];
         this._pathMatchedListeners = [];
         this._errorListeners = [];
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
            console.log('error', e.message);
             
            oboe._errorListeners.forEach( function( listener ) {
               listener();
            });
            
            // errors are not recoverable so discard all listeners, they shouldn't be called again:
            oboe._thingFoundListeners = [];
            oboe._pathMatchedListeners = [];
            oboe._errorListeners = [];
            
            // quit listening to clarinet as well. We've lost it with this stream:
            clarinetParser.onkey = 
            clarinetParser.onvalue = 
            clarinetParser.onopenobject = 
            clarinetParser.onopenarray = 
            clarinetParser.onend = 
            clarinetParser.oncloseobject =                         
            clarinetParser.onclosearray = 
            clarinetParser.onerror = null;            
         };
      }

      OboeParser.prototype.fetch = function(url) {

         // TODO: in if in node, use require('http') instead
         // of ajax

         streamingXhr.fetch(url, this.read.bind(this));

         return this;
      };

      /**
       * returns a function which tests if a listener is interested in the given path
       */
      function matchesPath( path ) {
      
         return function( listener ) {
            return listener.pattern.test( path );         
         }; 
      }

      /**
       * notify any of the listeners that are interested in the path.       
       */  
      function notifyListeners ( listenerList, foundNode, path ) {

         listenerList.filter(matchesPath(path))
            .forEach( function(listener) {
                var context = listener.context || window;
                
                listener.callback.call(context, foundNode, path );               
            });
      }

      /**
       * called when there is new text to parse
       *
       * @param {String} nextDrip
       */
      OboeParser.prototype.read = function (nextDrip) {
         this._clarinet.write(nextDrip);
      };


      /**
       * @returns {*} an identifier that can later be used to de-register this listener
       */
      function pushListener(listenerList, jsonPath, callback, context) {
         return listenerList.push({
            pattern: paths.compile(jsonPath),
            callback: callback,
            context: context
         });
      }

      /**
       * 
       * @param listenerMap
       */
      function pushListeners(listenerList, listenerMap) {
         for( var path in listenerMap ) {
            pushListener(listenerList, path, listenerMap[path]);
         }
      }
      

      /**
       * Add a new json path to the parser, to be called as soon as the path is found, but before we know
       * what value will be in there.
       *
       * @param {String} jsonPath
       *    The jsonPath is a subset of JSONPath patterns and supports these special meanings.
       *    See http://goessner.net/articles/JsonPath/
       *          $                - root json object
       *          .                - path separator
       *          foo              - path node 'foo'
       *          ['foo']          - path node 'foo'
       *          [1]              - path node '1' (only for numbers indexes, usually arrays)
       *          *                - wildcard - all objects/properties
       *          ..               - any number of intermediate nodes (non-greedy)
       *
       * @param {Function} callback
       * @param {Object} [context] the scope for the callback
       */
      OboeParser.prototype.onPath = function (jsonPath, callback, context) {

         if( typeof jsonPath === 'string' ) {
            pushListener(this._pathMatchedListeners, jsonPath, callback, context);
         } else {
            pushListeners(this._pathMatchedListeners, jsonPath);
         }
         return this;
      };
      
      /**
       * Add a new json path to the parser, which will be called when a value is found at the given path
       *
       * @param {String} jsonPath
       *    supports these special meanings:
       *          //                - root json object
       *          /                 - path separator
       *          *                 - any named node in the path
       *          **                - any number of intermediate nodes (non-greedy)
       *
       * @param {Function} callback
       * @param {Object} [context] the scope for the callback
       */
      OboeParser.prototype.onFind = function (jsonPath, callback, context) {

         pushListener(this._thingFoundListeners, jsonPath, callback, context);
         return this;
      };
      
      /**
       * Add a new json path to the parser, which will be called when a value is found at the given path
       *
       * @param {Function} callback
       */
      OboeParser.prototype.onError = function (callback) {

         this._errorListeners.push(callback);
         return this;
      };

   })(typeof exports === "undefined" ? oboe = {} : exports);
});