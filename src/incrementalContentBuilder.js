var keyOf = attr('key');
var nodeOf = attr('node');


/**
 * A special value to use in the path list to represent the path 'to' a root object (which doesn't really
 * have any path). This prevents the need for special-casing detection of the root object and allows it
 * to be treated like any other object. We might think of this as being similar to the 'unnamed root'
 * domain ".", eg if I go to http://en.wikipedia.org./wiki/En/Main_page the dot after 'org' deliminates the 
 * unnamed root of the DNS.
 * 
 * This is kept as an object to take advantage that in an OO language, objects are guaranteed to be
 * distinct, therefore no other object can possibly clash with this one. Strings, numbers etc provide
 * no such guarantee.
 */
var ROOT_PATH = {}; 


/**
 * Listen to the given clarinet instance and progressively builds and stores the json based on the callbacks it provides.
 * 
 * Notify on the given event bus when interesting things happen.
 * 
 * Returns a function which gives access to the content built up so far
 * 
 * @param clarinetParser our source of low-level events
 * @param {Function} fire a handle on an event bus to fire higher level events on when a new node 
 *    or path is found  
 */ 
function incrementalContentBuilder(fire, on, clarinetParser) {

   function checkForMissedArrayKey(possiblyInconsistentAscent, newDeepestNode) {
   
      // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there 
      // is for objects)
      // so we need to notify of the paths when we find the items:

      var parentNode = nodeOf(head(possiblyInconsistentAscent));
      
      if (isOfType(Array, parentNode)) {

         return pathFound(possiblyInconsistentAscent, len(parentNode), newDeepestNode);         
      } else {
         // the ascent I was given isn't inconsistent at all, return as-is
         return possiblyInconsistentAscent;
      }
   }

   /**
    * Manage the state and notifications for when a new node is found.
    *  
    * @param {*} newDeepestNode the thing that has been found in the json
    * @function
    */                 
   function nodeFound( ascent, newDeepestNode ) {
      
      if( !ascent ) {
         // we discovered the root node,
         fire(ROOT_FOUND, newDeepestNode);
                    
         return pathFound(ascent, ROOT_PATH, newDeepestNode);         
      }

      // we discovered a non-root node
                 
      var arrayConsistentAscent  = checkForMissedArrayKey( ascent, newDeepestNode),      
          ancestorBranches       = tail( arrayConsistentAscent),
          previouslyUnmappedKey  = keyOf( head( arrayConsistentAscent));
          
      appendBuiltContent( ancestorBranches, previouslyUnmappedKey, newDeepestNode );
                                                                                                         
      return cons( mapping( previouslyUnmappedKey, newDeepestNode ), ancestorBranches);                                                                          
   }


   /**
    * Add a new value to the top-level object which has been already output   
    */
   function appendBuiltContent( ancestorBranches, key, node ){
     
      nodeOf( head( ancestorBranches))[key] = node;
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
    * @param {String|Number|Object} newDeepestKey the key. If we are in an array will be a number, otherwise a string. May
    *    take the special value ROOT_PATH if the root node has just been found
    * @param {String|Number|Object|Array|Null|undefined} [maybeNewDeepestNode] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function pathFound(ascent, newDeepestKey, maybeNewDeepestNode) {

      if( ascent ) { // if not root
      
         // if we have the key but (unless adding to an array) no known value yet, at least put 
         // that key in the output but against no defined value:      
         appendBuiltContent( ascent, newDeepestKey, maybeNewDeepestNode );
      }
   
      var ascentWithNewPath = cons( mapping( newDeepestKey, maybeNewDeepestNode), ascent);
     
      fire(TYPE_PATH, ascentWithNewPath);
 
      return ascentWithNewPath;
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ascent ) {

      fire(TYPE_NODE, ascent);
                          
      // pop the complete node and its path off the list:                                    
      return tail(ascent);
   }      
    
   /* 
    * Assign listeners to clarinet.
    */
   function setListeners(handlers){

      // Sole state maintained by this builder.
      // List of nodes from the current node up to the root of the document.
      // Root is at the far end of the list. Current node is at the close end (head) of the list.    
      var ascent = emptyList;
   
      clarinet.EVENTS.forEach(function(eventName){

         var handlerFunction = handlers[eventName];
         
         clarinetParser['on'+eventName] = handlerFunction? 
            function(p1) {
               ascent = handlerFunction( ascent, p1 );
            }
         :  null;
      });
   }    
         
   setListeners({ 
      openobject : function (ascent, firstKey) {

         var ascentAfterNodeFound = nodeFound(ascent, {});         
         
         // It'd be odd but firstKey could be the empty string like {'':'foo'}. This is valid json even though it 
         // isn't very nice. So can't do !firstKey here, have to compare against undefined
         if( defined(firstKey) ) {
          
            // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
            // perminantly onto pathList yet because we haven't identified what is at that key yet. Give null as the
            // value because we haven't seen that far into the json yet          
            return pathFound(ascentAfterNodeFound, firstKey);
         } else {
            return ascentAfterNodeFound;
         }
      },
   
      openarray: function (ascent) {
         return nodeFound(ascent, []);
      },

      // called by Clarinet when keys are found in objects               
      key: pathFound,
      
      value: function (ascent, value) {
   
         // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
         // can't have descendants.
                                 
         return curNodeFinished( nodeFound(ascent, value) );
      },
      
      closeobject: curNodeFinished,
      closearray: curNodeFinished       
   });
      
   /**
    * If we abort this Oboe's request stop listening to the clarinet parser. This prevents more tokens
    * being found after we abort in the case where we aborted while reading though an already filled buffer.
    */
   on( ABORTING, function() {
      setListeners({});
   });

}