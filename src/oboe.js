
var oboe = (function(oboe){
   "use strict";

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
      
   function OboeParser(opt) {
   
      var clarinetParser = clarinet.parser(opt);
   
      this._thingFoundListeners = [];
      this._pathMatchedListeners = [];
      this._errorListeners = [];
      this._clarinet = clarinetParser;
         
      this._listenForSaxEvents(clarinetParser)        
   }
   
   OboeParser.prototype._listenForSaxEvents = function( clarinet ) {
   
      var   oboeInstance = this
      ,     curNode
      ,     curKey
      ,     nodeStack = [] // TODO: use fastlist?
      ,     pathStack = [];
     
      /* For when we find a new key in the json. The value may not be known in which case null can be given */  
      function keyDiscovered(key, value) {
         oboeInstance._notifyListeners(oboeInstance._pathMatchedListeners, value, pathStack.concat(key), nodeStack);      
      }
              
      function nodeFound( thingFound, foundAtKey ) {

         var foundIn = curNode,
             thingIsRoot = !foundIn;

         if( isArray(foundIn) ) {
            // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there is for objects)
            // so we need to notify of the paths when we find the items: 
            keyDiscovered(curKey, thingFound);
         }

         if( thingIsRoot ) {
            // Parsed the root object. Notify path listeners (eg to '!' or '*') that the root path has been satisfied:         
            oboeInstance._notifyListeners(oboeInstance._pathMatchedListeners, thingFound, pathStack, nodeStack);         
         }
         
         if( !thingIsRoot ) {
            foundIn[curKey] = thingFound;
            pathStack.push(curKey);
         }
                  
         curKey = foundAtKey;
         
         curNode = thingFound;            
         nodeStack.push(curNode);                  
      }
      
      function curNodeFinished( ) {
      
         var thingFound = curNode;
      
         // go up one level in the parsed json's tree
         nodeStack.pop();
         curNode = lastOf(nodeStack);      
      
         oboeInstance._notifyListeners(oboeInstance._thingFoundListeners, thingFound, pathStack, nodeStack);      
      
         if( isArray(curNode) ) {
            // we're going back to an array, the curKey (the key the next item will be given) needs to match
            // the length of that array:
            curKey = curNode.length;
         } else {
            // we're in an object, curKey has been used now and we don't know what the next key will 
            // be so mark as null:
            curKey = null;
         }      
         
         pathStack.pop();
      }      
                                                                                                    
      clarinet.onopenobject = function (firstKey) {

         nodeFound({}, firstKey);
         
         if( firstKey !== undefined ) {
            // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
            // perminantly onto pathStack yet because we haven't identified what is at that key yet. Give null as the
            // value because we haven't seen that far into the json yet          
            keyDiscovered(firstKey, null);
         }
      };
      
      clarinet.onopenarray = function () {

         nodeFound([], 0);
      };
                  
      clarinet.onkey = function (nextKey) {
         // called by Clarinet when keys are found in objects
      
         keyDiscovered(nextKey, null);
   
         curKey = nextKey;
      };                  
                  
      clarinet.onvalue = function (value) {
      
         // Called for strings, numbers, boolean, null etc. These are found and finished at once since they can't have
         // descendants.
      
         nodeFound(value, curKey);
                           
         curNodeFinished();
      };         
      
      clarinet.onend =
      clarinet.oncloseobject =
      clarinet.onclosearray =       
         curNodeFinished;      

         
      clarinet.onerror = function(e) {
         oboeInstance._notifyErrors(e);
         
         // after parse errors the json is invalid so, we won't bother trying to recover, so just give up
         oboeInstance.close();
      };       
   }; 
      
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
   OboeParser.prototype._notifyListeners = function ( listenerList, node, path, ancestors ) {
      
      var nodeList = ancestors.concat([node]);

      listenerList
         .forEach( function(listener) {
            
            var foundNode = listener.test( path, nodeList );
            
            // possible values for foundNode now:
            //
            //    false: 
            //       we did not match
            //    an object/array/string/number: 
            //       that node is the one that matched
            //    null: like above, but we don't have the node yet. ie, we know there is a
            //          node that matches but we don't know if it is an array, object, string
            //          etc yet so we can't say anything about it 
                        
            if( foundNode !== false ) {                     
               var context = listener.context || window;
               
               // change curNode to foundNode when it stops breaking tests
               try{
                  listener.callback.call(context, foundNode, path, ancestors );
               } catch(e) {
                  this._notifyErrors(Error('Error thrown by callback ' + e.message));
               }
            }                            
         }, this);
   };
   
   OboeParser.prototype._notifyErrors = function(error) {
      this._errorListeners.forEach( function( listener ) {
         listener(error);
      });   
   };   

   /**
    * called when there is new text to parse
    * 
    * @param {String} nextDrip
    */
   OboeParser.prototype.read = function (nextDrip) {
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
   
   /**
    * @returns {*} an identifier that can later be used to de-register this listener
    */
   function pushListener(listenerList, pattern, callback, context) {
      return listenerList.push({
         pattern:pattern,
         test: jsonPathCompiler(pattern),
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
   OboeParser.prototype.onPath = function (jsonPath, callback, context) {
   
      on(this._pathMatchedListeners, jsonPath, callback, context);
      return this;
   };

   /**
    * Add a new json path to the parser, which will be called when a value is found at the given path
    *
    * @param {String} jsonPath supports the same syntax as .onPath.
    *
    * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
    * @param {Object} [context] the context ('this') for the callback
    */
   OboeParser.prototype.onFind = function (jsonPath, callback, context) {
   
      on(this._thingFoundListeners, jsonPath, callback, context);
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