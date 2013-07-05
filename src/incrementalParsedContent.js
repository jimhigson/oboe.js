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
         // If we're in an object, curKey will be a string. If in an array, a number. It is the name of the attribute 
         // of curNode that we are currently parsing
         curKey
         
         // array of nodes from curNode up to the root of the document.
         // the root is at the far end of the list, the current node is at the close end (the head) 
   ,     nodeList
   
         // array of strings - the path from the root of the dom to the node currently being parsed
         // the root is at the far end of the list, the current node is at the close end (the head)
   ,     pathList
   
         // the root node. This is not always the same as nodeList[0], for example after finishing parsing
         // the nodeList will be empty but this will preserve a reference to the root element after parsing is
         // finished
   ,     root;


   /**
    * Manage the state and notifications for when a new node is found.
    * 
    * Valid values are either rootNodeFound or nonRootNodeFound. Will initially be rootNodeFound, 
    * but reassigned to nonRootNodeFound after the first call.
    * 
    * @param {*} foundNode the thing that has been found in the json
    * @function
    */   
   var nodeFound =
      /**
       * This function is one of the possible values of nodeFound, for the sub-case where we have never found
       * a node before
       * 
       * @param {*} foundNode
       */   
      function rootNodeFound( foundNode ) {
    
         // Notify path listeners (eg to '!' or '*') that the root path has been satisfied. This callback is specific
         // to finding the root node because non-root nodes will have their paths notified as their keys are 
         // discovered. Because this is the root, it can't have a key, hence undefined
         pathDiscovered(ROOT_PATH, foundNode);                  
         
         // store a reference to the root node (root var declared at top of file)
         root = foundNode;
         
         pathList = cons(ROOT_PATH, pathList);
         nodeList = cons(foundNode, nodeList);
         
         // the next node to be found won't be the root. Reassign this function:
         nodeFound = nonRootNodeFound;      
      };
      
   /**
    * This function is one of the possible values of nodeFound, for the sub-case where we have found
    * a node before
    * 
    * @param {*} foundNode
    */              
   function nonRootNodeFound( foundNode ) {
   
      var parentOfFoundNode = head(nodeList);
            
      if( isArray(parentOfFoundNode) ) {
         // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there is for objects)
         // so we need to notify of the paths when we find the items: 
         pathDiscovered(curKey, foundNode);
      }
      
      // add the newly found node to its parent
      parentOfFoundNode[curKey] = foundNode;

      pathList = cons(curKey,   pathList);                                    
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

      // TODO: note the 2 cons. could this modify pathList? whenever called it is getting added to anyway
      //    if we have the value, but why not build up path list ahead of having the value?
      // that would only work if were possible to remove curKey altogether and always use head(pathList) 
      // instead because would involve      
      notify(PATH_FOUND_EVENT, cons(key, pathList), cons(value, nodeList) );
      curKey = key;      
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {

      notify(NODE_FOUND_EVENT, pathList, nodeList );
            
      if( head( pathList ) == ROOT_PATH ) {
         // The root node has finished so no more parsing will happen.
         // We've notified of the complete node already so let's finish it here.
         return;
      }
                
      // pop the complete node and its path off the lists:                
      nodeList = tail(nodeList);                           
      pathList = tail(pathList);
      
      var parentOfCompleteNode = head(nodeList);         
         
      if( isArray(parentOfCompleteNode) ) {
         // we're going back to an array, the curKey (the key the next item will be given) needs to match
         // the length of that array:
         curKey = len(parentOfCompleteNode);
      } else {
         // we're in an object, curKey has been used now and we don't know what the next key will 
         // be so mark as unknown:
         curKey = undefined;
      }            
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
      // We haven't discovered a key in the json because we don't know if the array is empty or not. So, set 
      // curKey in case there are contents
      curKey = 0;
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