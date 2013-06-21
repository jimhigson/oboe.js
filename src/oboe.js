
(function(){

   /* export public API */ 
   var api = 
       window.oboe = {};

   /**
    * @constructor 
    */      
   function Oboe() {
   
      var me = this,
          clarinetParser = clarinet.parser(),
          nodeListeners  = [],
          pathListeners  = [];
   
      me._nodeListeners        = nodeListeners;
      me._pathListeners        = pathListeners;
      
      me._errorListeners       = [];
      me._clarinet             = clarinetParser;
      
      // create a json builder and store a function that can be used to get the
      // root of the json later:               
      me._root                 = jsonBuilder(
                                       clarinetParser, 
                                       // when a node is found, notify matching node listeners:
                                       me._notify.bind(me, nodeListeners),
                                       // when a node is found, notify matching path listeners:                                        
                                       me._notify.bind(me, pathListeners)
                                   );
                                               
      clarinetParser.onerror     = function(e) {
                                       me._notifyErr(e);
                                       
                                       // after parse errors the json is invalid so, we won't bother trying to recover, so just give up
                                       me.close();
                                   };
   }
   
   var oboeProto = Oboe.prototype;

   /**
    * Ask this oboe instance to fetch the given url. Called via one of the public api methods.
    * 
    * @param {String} url
    * @param {Function (String|Array wholeParsedJson)} doneCallback a callback for when the request is
    *    complete. Will be passed the whole parsed json object (or array). Using this callback, oboe
    *    works in a very similar to normal ajax.
    */      
   oboeProto._fetch = function(method, url, data, doneCallback) {
      var me = this;

      // data must either be a string or null to give to streamingXhr as the request body:
      data = data? (isString(data)? data: JSON.stringify(data)) : null;      

      streamingXhr(
         method,
         url, 
         data,
         me.read.bind(me),
         function() {            
            me.close();
            
            doneCallback && doneCallback(me._root());                                          
         });
               
      return me;
   };      

   /**
    * called when there is new text to parse
    * 
    * // TODO: currently this is used for testing. Get testing via a stubbed sXHR instead and 
    * // make this private.
    * 
    * @param {String} nextDrip
    */
   oboeProto.read = function (nextDrip) {
      if( this.closed ) {
         throw Error('closed');
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
   oboeProto.close = function () {
      var clarinet = this._clarinet.close();   
   
      this.closed = true;
      
      // we won't fire any more events again so forget our listeners:
      this._nodeListeners = [];
      this._pathListeners = [];
      this._errorListeners = [];
            
      // quit listening to clarinet as well. We've done with this stream:
      clarinet.onkey = 
      clarinet.onvalue = 
      clarinet.onopenobject = 
      clarinet.onopenarray = 
      clarinet.onend = 
      clarinet.oncloseobject =                         
      clarinet.onclosearray = 
      clarinet.onerror = undefined;      
   };
   
   /**
    * Notify any of the listeners in a list that are interested in the path or node that was
    * just found.
    * 
    * @param {Array} listenerList one of this._nodeListeners or this._pathListeners
    */  
   oboeProto._notify = function ( listenerList, node, path, ancestors ) {
      
      var nodeList = ancestors.concat([node]);

      callAll( listenerList, this, node, path, ancestors, nodeList );
   };
   
   /**
    * 
    * @param error
    */
   oboeProto._notifyErr = function(error) {
      callAll( this._errorListeners, undefined, error );            
   };
   

   /**
    * Create a new function that tests if something found in the json matches the pattern and, if it does,
    * calls the callback.
    * 
    * @param pattern
    * @param callback
    * @param context
    */
   function callIfPatternMatches( pattern, callback, context ) {
   
      context = context || window;   
   
      var test = jsonPathCompiler(pattern);
         
      /**
       * A function which when called with the details of something called in the parsed json, calls the listener
       * if it matches.
       * 
       * Will be called in the context of the current oboe instance from Oboe#_notify.
       */ 
     return function( node, path, ancestors, nodeList ) {
     
         var foundNode = test( path, nodeList );
        
         // Possible values for foundNode are now:
         //
         //    false: 
         //       we did not match
         //
         //    an object/array/string/number/null: 
         //       that node is the one that matched. Because json can have nulls, this can 
         //       be null.
         //
         //    undefined: like above, but we don't have the node yet. ie, we know there is a
         //       node that matches but we don't know if it is an array, object, string
         //       etc yet so we can't say anything about it. Null isn't used here because
         //       it would be indistinguishable from us finding a node with a value of
         //       null.
         //                      
         if( foundNode !== false ) {                                 
           
            // change curNode to foundNode when it stops breaking tests
            try{
               callback.call(context, foundNode, path, ancestors );
            } catch(e) {
               this._notifyErr(Error('Error thrown by callback ' + e.message));
            }
         }
      }   
   }
   
   /**
    * @returns {*} an identifier that can later be used to de-register this listener
    */
   function pushListener(listenerList, pattern, callback, context) {
         
      listenerList.push( callIfPatternMatches(pattern, callback, context) );            
   }

   /**
    * implementation behind .onPath() and .onFind: add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(listenerList, listenerMap) {
      for( var path in listenerMap ) {
         pushListener(listenerList, path, listenerMap[path]);
      }
   }
   
   /** implementation behind .onPath() and .onFind 
    */
   function on(listenerList, jsonPath, callback, context) {
      if( isString(jsonPath) ) {
         pushListener(listenerList, jsonPath, callback, context);
      } else {
         pushListeners(listenerList, jsonPath);
      }      
   }
   
   /**
    * Add a new json path to the parser, to be called as soon as the path is found, but before we know
    * what value will be in there.
    *
    * @param {String} jsonPath
    *    The jsonPath is a variant of JSONPath patterns and supports these special meanings.
    *    See http://goessner.net/articles/JsonPath/
    *          !                - root json object
    *          .                - path separator
    *          foo              - path node 'foo'
    *          ['foo']          - paFth node 'foo'
    *          [1]              - path node '1' (only for numbers indexes, usually arrays)
    *          *                - wildcard - all objects/properties
    *          ..               - any number of intermediate nodes (non-greedy)
    *          [*]              - equivalent to .*         
    *
    * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
    * 
    * @param {Object} [context] the context ('this') for the callback
    */
   oboeProto.onPath = function (jsonPath, callback, context) {
   
      on(this._pathListeners, jsonPath, callback, context);
      return this; // chaining
   };

   /**
    * Add a new json path to the parser, which will be called when a value is found at the given path
    *
    * @param {String} jsonPath supports the same syntax as .onPath.
    *
    * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
    * @param {Object} [context] the context ('this') for the callback
    */
   oboeProto.onFind = function (jsonPath, callback, context) {
   
      on(this._nodeListeners, jsonPath, callback, context);
      return this; // chaining
   };
   
   /**
    * Add a new json path to the parser, which will be called when a value is found at the given path
    *
    * @param {Function} callback
    */
   oboeProto.onError = function (callback) {

      this._errorListeners.push(callback);
      return this; // chaining
   };
   
   /** add an http method to the public api */
   function httpMethod(httpMethodName, mayHaveContent) {
         
      var 
          // make name like 'doGet' out of name like 'GET'
          apiMethodName = 'do' + httpMethodName.charAt(0) + httpMethodName.substr(1).toLowerCase(),
          bodyArgumentIndex =     mayHaveContent?  1 : -1, // minus one = always undefined - method can't send data
          callbackArgumentIndex = mayHaveContent? 2 : 1;           
      
      // make the above method available without creating an oboe instance first via
      // the public api:
      api[apiMethodName] = function(firstArg){
         var url, body, doneCallback;

         if (isString(firstArg)) {
            // parameters specified as arguments
            //
            //  if mayHaveContext, signature is:
            //     .method( url, content, callback )
            //  else it is:
            //     .method( url, callback )            
            //                                
            url = firstArg;
            body = arguments[bodyArgumentIndex];
            doneCallback = arguments[callbackArgumentIndex]
         } else {
            // parameters specified as options object:
            url = firstArg.url;
            body = firstArg.body;
            doneCallback = firstArg.complete;
         }

         return new Oboe()._fetch(httpMethodName, url, body, doneCallback);         
      };
   }
      
   /* for each of the http methods, add a corresponding method to 
      the public api and Oboe.prototype:
    */
   httpMethod('GET');   
   httpMethod('DELETE');   
   httpMethod('POST', true);   
   httpMethod('PUT', true);   
   
})();