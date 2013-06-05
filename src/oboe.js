
/**
 * Welcome to the oboe.js source.
 * 
 * This codebase is made out of a few components.
 * 
 *    * oboe:         Really just a shell with some event dispatching
 *    * jsonBuilder:  A wrapper around clarinet that progressively builds up the parsed json based on clarinet's
 *                    callbacks and provides higher-level callbacks into oboe
 *    * jsonPath:     Pure functional javascript. Parses the jsonpath specs for matches.
 *    * streamingXhr: A very basic Ajax wrapper that provides a streaming interface
 *    * util:         Things that didn't fit anywhere else.
 *    
 * When the source is built into the distributable js, a single object is exposed at window.oboe    
 * 
 * Happy hacking!
 */


var oboe = (function(){
   "use strict";

   /**
    * @constructor 
    * @param {Object} options
    */      
   function OboeParser(options) {
   
      var clarinetParser = clarinet.parser(options);
   
      this._nodeFoundListeners = [];
      this._pathMatchedListeners = [];
      this._errorListeners = [];
      this._clarinet = clarinetParser;               
      this._jsonBuilder = jsonBuilder(clarinetParser, this);
            
      clarinetParser.onerror = function(e) {
         this.notifyErrors(e);
         
         // after parse errors the json is invalid so, we won't bother trying to recover, so just give up
         this.close();
      }.bind(this);
   }
   
   var oboeProto = OboeParser.prototype;

   /**
    * Ask this oboe instance to fetch the given url
    * 
    * @param {String} url
    * @param {Function (String|Array wholeParsedJson)} doneCallback a callback for when the request is
    *    complete. Will be passed the whole parsed json object (or array). Using this callback, oboe
    *    works in a very similar to normal ajax.
    */      
   oboeProto.fetch = function(url, doneCallback) {

      // TODO: in if in node, use require('http') instead of ajax

      streamingXhr.fetch(
         url, 
         this.read.bind(this),
         function( _wholeResponseText ) {
            
            this.close();
            
            (doneCallback || always)(this._jsonBuilder.getRoot());
                                          
         }.bind(this) );
               
      return this;
   };

   /**
    * called when there is new text to parse
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
      this.closed = true;
      
      // we won't fire any more events again so forget our listeners:
      this._nodeFoundListeners = [];
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
   
   /**
    * Notify any of the listeners in a list that are interested in the path.       
    */  
   oboeProto._notifyListeners = function ( listenerList, node, path, ancestors ) {
      
      var nodeList = ancestors.concat([node]);

      for (var i = 0; i < listenerList.length; i++) {
         // each item in the listener list is already a function that will test if the callback needs to be 
         // called and call it if it does. So all we have to do here is execute.
         listenerList[i].call(this, node, path, ancestors, nodeList);         
      }      
   };
   
   /**
    * Something has been found. Notify matching listeners.
    */
   oboeProto.nodeFound = function( node, path, ancestors ) {   
      this._notifyListeners(this._nodeFoundListeners, node, path, ancestors);
   };
   
   /**
    * A path has been found. Notify matching listeners.
    */
   oboeProto.pathFound = function( node, path, ancestors ) {   
      this._notifyListeners(this._pathMatchedListeners, node, path, ancestors);
   };

   /**
    * 
    * @param error
    */
   oboeProto.notifyErrors = function(error) {
      callAll(this._errorListeners, [error]);            
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
       * Will be called in the context of the current oboe instance from OboeParser#notifyListeners.
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
         //       that would be indistinguishable from us finding a node with a value of
         //       null.
         //                      
         if( foundNode !== false ) {                                 
           
            // change curNode to foundNode when it stops breaking tests
            try{
               callback.call(context, foundNode, path, ancestors );
            } catch(e) {
               this.notifyErrors(Error('Error thrown by callback ' + e.message));
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
      if( typeof jsonPath === 'string' ) {
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
   
      on(this._pathMatchedListeners, jsonPath, callback, context);
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
   
      on(this._nodeFoundListeners, jsonPath, callback, context);
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

   /* finally, let's export factory methods for making a new oboe instance */ 
   return {
      /**
      * @param {Object} options an object of options. Passed though
      * directly to clarinet.js but oboe.js does not
      * currently provide options.
      */
      parser:function(options){
         return new OboeParser(options);
      }
   
   
      /**
       * Convenient alias. Creates a new parser, starts an ajax request and returns the parser
       * ready to call .onPath() or .onFind() to register some callbacks
       * 
       * @param url
       */
   ,  fetch: function(url, doneCallback){
         return new OboeParser({}).fetch(url, doneCallback);
      }     
   };

})();