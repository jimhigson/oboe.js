/**
 * A special value to use in the path list to represent the path 'to' a root object (which doesn't really
 * have any path). This prevents the need for special-casing detection of the root object and allows it
 * to be treated like any other object.
 * 
 * This is kept as an object to take advantage that in an OO language, objects are guaranteed to be
 * distinct, therefore no other object can possibly clash with this one.
 */
var ROOT_PATH = {}; 


/**
 * Listen to the given clarinet instance and progressively builds and stores the json based on the callbacks it provides.
 * 
 * Notify on the given event bus when interesting things happen.
 * 
 * Returns a function which gives access to the content built up so far
 * 
 * @param clarinet our source of low-level events
 * @param {Function} notify a handle on an event bus to fire higher level events on when a new node 
 *    or path is found  
 */ 
function incrementalParsedContent( clarinet, notify ) {

   // All of the state of this jsonBuilder is kept isolated in these vars. The remainder of the logic is to maintain
   // this state and notify the callbacks 
    
   var            
         // array of nodes from curNode up to the root of the document.
         // the root is at the far end of the list, the current node is at the close end (the head) 
         nodeList
   
         // array of strings - the path from the root of the dom to the node currently being parsed
         // the root is at the far end of the list, the current node is at the close end (the head)
   ,     pathList
   
   ,     root;



   function addChildToParent(child, parent) {

      if (isArray(parent)) {
         // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there 
         // is for objects)
         // so we need to notify of the paths when we find the items:
         pathDiscovered(parent.length, child);
      }

      // add the newly found node to its parent
      parent[head(pathList)] = child;
   }

   /**
    * Manage the state and notifications for when a new node is found.
    *  
    * @param {*} foundNode the thing that has been found in the json
    * @function
    */                 
   function nodeFound( foundNode ) {
   
      if( !nodeList ) {
           
         // we discovered the root node
         root = foundNode;
         pathDiscovered(ROOT_PATH, foundNode);
                           
      } else {
         // we discovered a node with a parent      
         addChildToParent(foundNode, head(nodeList));
      }
                             
      // and add it to our list:                                    
      nodeList = cons(foundNode, nodeList);                                  
   }   
  
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number|Object} key the key. If we are in an array will be a number, otherwise a string. May
    *    take the special value ROOT_PATH if the root node has just been found
    * @param {String|Number|Object|Array|Null|undefined} [value] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function pathDiscovered(key, value) {
      
      // if we have the key but no known value yet, at least put that key in the output 
      // but against no defined value:
      if( !defined(value) ) {
         head(nodeList)[key] = undefined;
      }   

      pathList = cons(key, pathList);
     
      notify(PATH_FOUND_EVENT, pathList, cons(value, nodeList) );
 
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {

      notify(NODE_FOUND_EVENT, pathList, nodeList );
                          
      // pop the complete node and its path off the lists:                
      nodeList = tail(nodeList);                           
      pathList = tail(pathList);
   }      
    
   /* 
    * Finally, assign listeners to clarinet. Mostly these are just wrappers and pass-throughs for the higher
    * level functions above. 
    */     
   clarinet.onopenobject = function (firstKey) {

      nodeFound({});
      
      // It'd be odd but firstKey could be the empty string. This is valid json even though it isn't very nice.
      // so can't do !firstKey here, have to compare against undefined
      if( defined(firstKey) ) {
      
         // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
         // perminantly onto pathList yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         pathDiscovered(firstKey);
      }
   };
   
   clarinet.onopenarray = function () {
      nodeFound([]);
   };

   // called by Clarinet when keys are found in objects               
   clarinet.onkey = pathDiscovered;   
               
   clarinet.onvalue = function (value) {
   
      // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
      // can't have descendants.
   
      nodeFound(value);
                        
      curNodeFinished();
   };         
   
   clarinet.oncloseobject =
   clarinet.onclosearray =       
      curNodeFinished;      
      
   /* finally, return a function to get the root of the json (or undefined if not yet found) */      
   return function() {
      return root;
   }           
}