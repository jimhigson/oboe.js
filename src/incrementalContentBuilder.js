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
 * Provide handlers for clarinet's events.
 * These listeners fire higher-level events related to paths and nodes rather than low-level syntax in the json.
 * No state is maintained by the handlers, that has been refactored out so that this part of the library can
 * stay purely functional.
 *  
 * @param {Function} fire a handle on an event bus to fire higher level events on when a new node 
 *    or path is found  
 */ 
function incrementalContentBuilder( fire) {

   function arrayIndicesAreKeys( possiblyInconsistentAscent, newDeepestNode) {
   
      // for values in arrays we aren't pre-warned of the coming paths (Clarinet gives 
      // no call to onkey like it does for values in objects) so if we are in an array 
      // we need to create this path ourselves. The key will be len(parentNode) because
      // array keys are always sequential numbers.

      var parentNode = nodeOf( head( possiblyInconsistentAscent));
      
      return isOfType( Array, parentNode)
      ?
         pathFound( possiblyInconsistentAscent, len(parentNode), newDeepestNode)
      :  
         possiblyInconsistentAscent // nothing needed, return unchanged
      ;
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
         fire( ROOT_FOUND, newDeepestNode);
                    
         return pathFound( ascent, ROOT_PATH, newDeepestNode);         
      }

      // we discovered a non-root node
                 
      var arrayConsistentAscent  = arrayIndicesAreKeys( ascent, newDeepestNode),      
          ancestorBranches       = tail( arrayConsistentAscent),
          previouslyUnmappedName = keyOf( head( arrayConsistentAscent));
          
      appendBuiltContent( ancestorBranches, previouslyUnmappedName, newDeepestNode );
                                                                                                         
      return cons( namedNode( previouslyUnmappedName, newDeepestNode ), ancestorBranches);                                                                          
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
   function namedNode(key, node) {
      return {key:key, node:node};
   }
     
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number|Object} newDeepestName the key. If we are in an array will be a number, otherwise a string. May
    *    take the special value ROOT_PATH if the root node has just been found
    * @param {String|Number|Object|Array|Null|undefined} [maybeNewDeepestNode] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function pathFound(ascent, newDeepestName, maybeNewDeepestNode) {

      if( ascent ) { // if not root
      
         // if we have the key but (unless adding to an array) no known value yet, at least put 
         // that key in the output but against no defined value:      
         appendBuiltContent( ascent, newDeepestName, maybeNewDeepestNode );
      }
   
      var ascentWithNewPath = cons( namedNode( newDeepestName, maybeNewDeepestNode), ascent);
     
      fire( PATH_FOUND, ascentWithNewPath);
 
      return ascentWithNewPath;
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ascent ) {

      fire( NODE_FOUND, ascent);
                          
      // pop the complete node and its path off the list:                                    
      return tail( ascent);
   }      
                 
   return { 
      openobject : function (ascent, firstKey) {

         var ascentAfterNodeFound = nodeFound(ascent, {});         
         
         // It'd be odd but firstKey could be the empty string like {'':'foo'}. This is valid json even though it 
         // isn't very nice. So can't do !firstKey here, have to compare against undefined
         return defined(firstKey)
         ?          
            // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
            // perminantly onto pathList yet because we haven't identified what is at that key yet. Give null as the
            // value because we haven't seen that far into the json yet          
            pathFound(ascentAfterNodeFound, firstKey)
         :
            ascentAfterNodeFound
         ;
      },
    
      openarray: function (ascent) {
         return nodeFound(ascent, []);
      },

      // called by Clarinet when keys are found in objects               
      key: pathFound,
      
      // Called by Clarinet when primitive values are found, ie Strings and Numbers.
      // because these are always leaves in the JSON, we find and finish the node in one
      // step, which can be expressed as functional composition:  
      value: compose( curNodeFinished, nodeFound ),
      
      // we make no distinction in how we handle object and arrays closing. For both, interpret as the end
      // of the current node.
      closeobject: curNodeFinished,
      closearray: curNodeFinished       
   };
}