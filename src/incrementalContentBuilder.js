/** 
 * This file provides various listeners which can be used to build up
 * a changing ascent based on the callbacks provided by Clarinet. It listens
 * to the low-level events from Clarinet and emits higher-level ones.
 *  
 * The building up is stateless so to track a JSON file
 * clarinetListenerAdaptor.js is required to store the ascent state
 * between calls.
 */


var keyOf = attr('key');
var nodeOf = attr('node');


/** 
 * A special value to use in the path list to represent the path 'to' a root 
 * object (which doesn't really have any path). This prevents the need for 
 * special-casing detection of the root object and allows it to be treated 
 * like any other object. We might think of this as being similar to the 
 * 'unnamed root' domain ".", eg if I go to 
 * http://en.wikipedia.org./wiki/En/Main_page the dot after 'org' deliminates 
 * the unnamed root of the DNS.
 * 
 * This is kept as an object to take advantage that in Javascript's OO objects 
 * are guaranteed to be distinct, therefore no other object can possibly clash 
 * with this one. Strings, numbers etc provide no such guarantee. 
 **/
var ROOT_PATH = {};


/**
 * Create a new set of handlers for clarinet's events, bound to the emit 
 * function given.  
 */ 
function incrementalContentBuilder( emit ) {


   function arrayIndicesAreKeys( possiblyInconsistentAscent, newDeepestNode) {
   
      /* for values in arrays we aren't pre-warned of the coming paths 
         (Clarinet gives no call to onkey like it does for values in objects) 
         so if we are in an array we need to create this path ourselves. The 
         key will be len(parentNode) because array keys are always sequential 
         numbers. */

      var parentNode = nodeOf( head( possiblyInconsistentAscent));
      
      return      isOfType( Array, parentNode)
               ?
                  pathFound(  possiblyInconsistentAscent, 
                              len(parentNode), 
                              newDeepestNode
                  )
               :  
                  // nothing needed, return unchanged
                  possiblyInconsistentAscent 
               ;
   }
                 
   function nodeFound( ascent, newDeepestNode ) {
      
      if( !ascent ) {
         // we discovered the root node,
         emit( ROOT_FOUND, newDeepestNode);
                    
         return pathFound( ascent, ROOT_PATH, newDeepestNode);         
      }

      // we discovered a non-root node
                 
      var arrayConsistentAscent  = arrayIndicesAreKeys( ascent, newDeepestNode),      
          ancestorBranches       = tail( arrayConsistentAscent),
          previouslyUnmappedName = keyOf( head( arrayConsistentAscent));
          
      appendBuiltContent( 
         ancestorBranches, 
         previouslyUnmappedName, 
         newDeepestNode 
      );
                                                                                                         
      return cons( 
               namedNode( previouslyUnmappedName, newDeepestNode ), 
               ancestorBranches
      );                                                                          
   }


   /**
    * Add a new value to the object we are building up to represent the
    * parsed JSON
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
    * @param {String|Number|Object} newDeepestName the key. If we are in an 
    *    array will be a number, otherwise a string. May take the special 
    *    value ROOT_PATH if the root node has just been found
    *    
    * @param {String|Number|Object|Array|Null|undefined} [maybeNewDeepestNode] 
    *    usually this won't be known so can be undefined. Can't use null 
    *    to represent unknown because null is a valid value in JSON
    **/  
   function pathFound(ascent, newDeepestName, maybeNewDeepestNode) {

      if( ascent ) { // if not root
      
         // If we have the key but (unless adding to an array) no known value
         // yet. Put that key in the output but against no defined value:      
         appendBuiltContent( ascent, newDeepestName, maybeNewDeepestNode );
      }
   
      var ascentWithNewPath = cons( 
                                 namedNode( newDeepestName, 
                                            maybeNewDeepestNode), 
                                 ascent
                              );
     
      emit( PATH_FOUND, ascentWithNewPath);
 
      return ascentWithNewPath;
   }


   /**
    * For when the current node ends
    */
   function curNodeFinished( ascent ) {

      emit( NODE_FOUND, ascent);
                          
      // pop the complete node and its path off the list:                                    
      return tail( ascent);
   }      
                 
   return { 

      openobject : function (ascent, firstKey) {

         var ascentAfterNodeFound = nodeFound(ascent, {});         

         /* It is a perculiarity of Clarinet that for non-empty objects it
            gives the first key with the openobject event instead of
            in a subsequent key event.
                      
            firstKey could be the empty string in a JSON object like 
            {'':'foo'} which is technically valid.
            
            So can't check with !firstKey, have to see if has any 
            defined value. */
         return defined(firstKey)
         ?          
            /* We know the first key of the newly parsed object. Notify that 
               path has been found but don't put firstKey permanently onto 
               pathList yet because we haven't identified what is at that key 
               yet. Give null as the value because we haven't seen that far 
               into the json yet */
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
      
      /* Emitted by Clarinet when primitive values are found, ie Strings,
         Numbers, and null.
         Because these are always leaves in the JSON, we find and finish the 
         node in one step, expressed as functional composition: */
      value: compose( curNodeFinished, nodeFound ),
      
      // we make no distinction in how we handle object and arrays closing.
      // For both, interpret as the end of the current node.
      closeobject: curNodeFinished,
      closearray: curNodeFinished       
   };
}