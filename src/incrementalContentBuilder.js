var keyOf = attr('key');
var nodeOf = attr('node');


/**
 * A special value to use in the path list to represent the path 'to' a root object (which doesn't really
 * have any path). This prevents the need for special-casing detection of the root object and allows it
 * to be treated like any other object.
 * 
 * This is kept as an object to take advantage that in an OO language, objects are guaranteed to be
 * distinct, therefore no other object can possibly clash with this one.
 */
var ROOT_PATH = {r:1}; 


/**
 * Listen to the given clarinet instance and progressively builds and stores the json based on the callbacks it provides.
 * 
 * Notify on the given event bus when interesting things happen.
 * 
 * Returns a function which gives access to the content built up so far
 * 
 * @param clarinetParser our source of low-level events
 * @param {Function} notify a handle on an event bus to fire higher level events on when a new node 
 *    or path is found  
 */ 
function incrementalContentBuilder( clarinetParser, notify, on ) {
   
   var            
         // array of nodes from curNode up to the root of the document.
         // the root is at the far end of the list, the current node is at the close end (the head) 
         ascent
      
   ,     rootNode;



   function checkForMissedArrayKey(ascent, newLeafNode) {
   
      // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there 
      // is for objects)
      // so we need to notify of the paths when we find the items:

      var parentNode = nodeOf(head(ascent));
      
      if (isOfType(Array, parentNode)) {

         pathFound(len(parentNode), newLeafNode);
      }
   }

   /**
    * Manage the state and notifications for when a new node is found.
    *  
    * @param {*} newLeafNode the thing that has been found in the json
    * @function
    */                 
   function nodeFound( newLeafNode ) {
      
      if( !ascent ) {
           
         // we discovered the root node, it has a special path
         rootNode = newLeafNode;
         pathFound(ROOT_PATH, newLeafNode);
         
         return;            
      } 
      
      checkForMissedArrayKey(ascent, newLeafNode);
      
      // the node is a non-root node
      var branches = tail(ascent),           
          parentBranch = head(branches),   
          oldLeaf = head(ascent),
          newLeaf = mapping(keyOf(oldLeaf), newLeafNode);      
   
      appendBuiltContent( parentBranch, newLeaf );
                                                                                                         
      ascent = cons(newLeaf, branches);                                                                          
   }


   /**
    * Add a new value to the top-level object which has been already output   
    */
   function appendBuiltContent( branch, leaf ){
      
      nodeOf(branch)[keyOf(leaf)] = nodeOf(leaf);
   }

   /**
    * Get a new key->node mapping
    * 
    * @param {String|Number} key
    * @param {Object|Array|String|Number|null} node a value found in the json
    */
   function mapping(key, node) {
      return {key:key, node:node};
   }
     
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number|Object} key the key. If we are in an array will be a number, otherwise a string. May
    *    take the special value ROOT_PATH if the root node has just been found
    * @param {String|Number|Object|Array|Null|undefined} [maybeNode] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function pathFound(key, maybeNode) {
      
      var newLeaf = mapping(key, maybeNode);
      
      if( ascent ) { // if not root
      
         // if we have the key but (unless adding to an array) no known value yet, at least put 
         // that key in the output but against no defined value:      
         appendBuiltContent( head(ascent), newLeaf );
      }
   
      ascent = cons(newLeaf, ascent);
     
      notify(TYPE_PATH, ascent);
 
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {

      notify(TYPE_NODE, ascent);
                          
      // pop the complete node and its path off the lists:                                    
      ascent = tail(ascent);
   }      
    
   /* 
    * Assign listeners to clarinet.
    */     
    
   clarinetParser.onopenobject = function (firstKey) {

      nodeFound({});
      
      // It'd be odd but firstKey could be the empty string. This is valid json even though it isn't very nice.
      // so can't do !firstKey here, have to compare against undefined
      if( defined(firstKey) ) {
      
         // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
         // perminantly onto pathList yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         pathFound(firstKey);
      }
   };
   
   clarinetParser.onopenarray = function () {
      nodeFound([]);
   };

   // called by Clarinet when keys are found in objects               
   clarinetParser.onkey = pathFound;   
               
   clarinetParser.onvalue = function (value) {
   
      // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
      // can't have descendants.
   
      nodeFound(value);
                        
      curNodeFinished();
   };         
   
   clarinetParser.oncloseobject =
   clarinetParser.onclosearray =       
      curNodeFinished;

   /**
    * If we abort this Oboe's request stop listening
    * to the clarinet parser. This prevents more tokens
    * being found after we abort in the case where we 
    * aborted while reading though a current buffer.
    */      
   on( ABORTING, function() {
      clarinet.EVENTS.forEach(function(event){
         // maybe not onerror
         clarinetParser['on'+event] = null;
      });
   }); 
             
   /* finally, return a function to get the root of the json (or undefined if not yet found) */      
   return function() {
      return rootNode;
   }           
}