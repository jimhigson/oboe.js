/**
 * @constructor
 */
var Oboe = (function(){

   /**
    * @constructor 
    */      
   function Oboe() {
   
      var self = this,
          evnts = events(self),
          clarinetParser = clarinet.parser();
      
      self._errorListeners       = [];
      self._clarinet             = clarinetParser;
      
      // create a json builder and store a function that can be used to get the
      // root of the json later:               
      self._root                 = jsonBuilder(
                                       clarinetParser,
                                        
                                       // when a node is found, notify matching node listeners:
                                       partialComplete(evnts.notify, NODE_FOUND_EVENT),

                                       // when a node is found, notify matching path listeners:                                        
                                       partialComplete(evnts.notify, PATH_FOUND_EVENT)
                                   );

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
      self.onPath = partialComplete(evnts.on, PATH_FOUND_EVENT);

      /**
       * Add a new json path to the parser, which will be called when a value is found at the given path
       *
       * @param {String} jsonPath supports the same syntax as .onPath.
       *
       * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
       * @param {Object} [context] the context ('this') for the callback
       * 
       * TODO: rename to onNode
       */
      self.onFind = partialComplete(evnts.on, NODE_FOUND_EVENT);

      clarinetParser.onerror     = function(e) {
                                       self._notifyErr(e);
                                       
                                       // after parse errors the json is invalid so, we won't bother trying to recover, so just give up
                                       self.close();
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
      var self = this;

      // data must either be a string or null to give to streamingXhr as the request body:
      data = data? (isString(data)? data: JSON.stringify(data)) : null;      

      streamingXhr(
         method,
         url, 
         data,
         function (nextDrip) {
            // callback for when a bit more data arrives from the streaming XHR
            
            if( self.closed ) {
               throw Error('closed');
            }
             
            try {
               self._clarinet.write(nextDrip);
            } catch(e) {
               // we don't have to do anything here because we always assign a .onerror
               // to clarinet which will have already been called by the time this 
               // exception is thrown.                
            }
         },
         function() {
            // callback for when the response is complete                     
            self.close();
            
            doneCallback && doneCallback(self._root());
         });
               
      return self;
   };      
            
   /**
    * called when the input is done
    *    TODO: take out of public API
    */
   oboeProto.close = function () {
      var clarinet = this._clarinet.close();   
   
      this.closed = true;
      
      // we won't fire any more events again so forget our listeners:
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
    * 
    * @param error
    */
   oboeProto._notifyErr = function(error) {
      callAll( this._errorListeners, error );            
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
   
   return Oboe;
              
})();