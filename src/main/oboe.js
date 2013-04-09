var oboe = (function(oboe){
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
      ,     curNode
      ,     curKey
      ,     nodeStack = [] // TODO: use fastlist
      ,     pathStack = [];
   
   
      clarinetParser.onkey = function (nextKey) {
         notifyListeners(oboe._pathMatchedListeners, null, pathStack.concat(nextKey), nodeStack);
   
         curKey = nextKey;
      };
      clarinetParser.onvalue = function (value) {
         // onvalue is only called by clarinet for non-structured values
         // (ie, not arrays or objects). 
         // For (strings/numbers) in (objects/arrays) this is where the flow goes.

         curNode[curKey] = value;   
         notifyListeners(oboe._thingFoundListeners, value, pathStack.concat(curKey), nodeStack);
   
         if( isArray(curNode) ) {
            curKey++;
         } else {
            curKey = null;
         }
   
      };
      clarinetParser.onopenobject = function (firstKey) {
   
         var ancestor = curNode;
         
         curNode = {};
   
         notifyListeners(oboe._pathMatchedListeners, curNode, pathStack, nodeStack);
         notifyListeners(oboe._pathMatchedListeners, null,    pathStack.concat(firstKey), nodeStack);
   
         if( ancestor ) {
            // we're not the root, modify the parent object:
            ancestor[curKey] = curNode;
            pathStack.push(curKey);            
         }
         nodeStack.push(curNode);
   
         // clarinet always gives the first key of the new object.
         curKey = firstKey;
      };      
      clarinetParser.onopenarray = function () {
   
         // arrays can't be the root of a json so we know we'll always have an ancestor
         var ancestor = curNode;
         
         curNode = [];
         
         ancestor[curKey] = curNode;
                  
         nodeStack.push(curNode);
         pathStack.push(curKey);
   
         notifyListeners(oboe._pathMatchedListeners, curNode, pathStack, nodeStack);
   
         curKey = 0;
      };   
      clarinetParser.onend =
      clarinetParser.oncloseobject =
      clarinetParser.onclosearray = function () {

         // pop the curNode off the nodestack because curNode is the thing we just
         // identified and it shouldn't be listed as an ancestor of itself:
         nodeStack.pop();
   
         notifyListeners(oboe._thingFoundListeners, curNode, pathStack, nodeStack);
   
         pathStack.pop();
         curNode = peek(nodeStack);
   
         if( isArray(curNode) ) {
            curKey = curNode.length;
         }
   
      };   
      clarinetParser.onerror = this._handleErrorFromClarinet.bind(this);
   }
      
   OboeParser.prototype.fetch = function(url) {

      // TODO: in if in node, use require('http') instead of ajax

      streamingXhr.fetch(
         url, 
         this.read.bind(this),
         this.close.bind(this) );

      return this;
   };

   
   /**
    * notify any of the listeners that are interested in the path.       
    */  
   function notifyListeners ( listenerList, foundNode, path, ancestors ) {

      /**
       * returns a function which tests if a listener is interested in the given path
       */
      function matchesPath( path ) {      
         return function( listener ) {
            return listener.pattern.test( path );         
         };
      } 

      listenerList.filter(matchesPath(path))
         .forEach( function(listener) {
             var context = listener.context || window;
             
             listener.callback.call(context, foundNode, path, ancestors );               
         });
   }

   /**
    * called when there is new text to parse
    * 
    * @param {String} nextDrip
    */
   OboeParser.prototype.read = function (nextDrip) {
      if( closed ) {
         throw new Error();
      }
   
      try {
         this._clarinet.write(nextDrip);
      } catch(e) {
         // we don't have to do anything here because we always assign a .onerror
         // to clarinet which will have already been called by the time this 
         // exception is thrown.       
      }
   };
            
   /**
    * called when the input is done
    * 
    */
   OboeParser.prototype.close = function () {
      this.closed = true;
      
      // we won't fire any more events again so forget our listeners:
      this._thingFoundListeners = [];
      this._pathMatchedListeners = [];
      this._errorListeners = [];
      
      var clarinet = this._clarinet;
      
      // quit listening to clarinet as well. We've done with this stream:
      clarinet.onkey = 
      clarinet.onvalue = 
      clarinet.onopenobject = 
      clarinet.onopenarray = 
      clarinet.onend = 
      clarinet.oncloseobject =                         
      clarinet.onclosearray = 
      clarinet.onerror = null;
      
      clarinet.close();            
   };
   
   /** react when an error from clarinet occurs, usually because we have an
    *  some invalid json
    */ 
   OboeParser.prototype._handleErrorFromClarinet = function(e) {
      this._errorListeners.forEach( function( listener ) {
         listener(e);
      });
      
      // after errors, we won't bother trying to recover so just give up:
      this.close();
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
    *          [*]              - equivalent to .*
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
    * @param {String} jsonPath supports the same syntax as .onPath.
    *
    * @param {Function} callback
    * @param {Object} [context] the scope for the callback
    */
   OboeParser.prototype.onFind = function (jsonPath, callback, context) {

      if( typeof jsonPath === 'string' ) {
         pushListener(this._thingFoundListeners, jsonPath, callback, context);
      } else {
         pushListeners(this._thingFoundListeners, jsonPath);
      }

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
   
   return oboe;

})( typeof exports === "undefined" ? {} : exports );