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
   ,     nodeStack = [] // TODO: use fastlist? https://github.com/isaacs/fast-list
         // array of strings - the path from the root of the dom to the node currently being parsed
   ,     pathStack = []
   
         // the root node. This is not always the same as nodeStack[0], for example after finishing parsing
         // the nodeStack will be empty but this will preserve a reference to the root element after parsing is
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
         keyDiscovered(undefined, foundNode);                  
         
         // store a reference to the root node (root var declared at top of file)
         root = foundNode;
            
         // nodeStack will be empty, let's give it its first value            
         nodeStack.push(foundNode);
         
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
   
      var parentOfFoundNode = lastOf(nodeStack);
            
      if( isArray(parentOfFoundNode) ) {
         // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there is for objects)
         // so we need to notify of the paths when we find the items: 
         keyDiscovered(curKey, foundNode);
      }
      
      // add the newly found node to its parent
      parentOfFoundNode[curKey] = foundNode;
      pathStack.push(curKey);
   
      nodeStack.push(foundNode);                        
   }   
  
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number} key the key. If we are in an array will be a number, otherwise a string. 
    * @param {String|Number|Object|Array|Null|undefined} [value] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function keyDiscovered(key, value) {
      
      var fullPath = defined(key)? pathStack.concat(key) : pathStack;

      // if we have the key but no known value yet, at least put that key in the output 
      // but against no defined value:
      if( key && !defined(value) ) {
         lastOf(nodeStack)[key] = undefined;
      }   
      
      notify(PATH_FOUND_EVENT, fullPath, nodeStack.concat([value]) );
      curKey = key;      
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {
      
      // we need to go up one level in the parsed json's tree
      var completeNode = nodeStack.pop(),
          parentOfCompleteNode = lastOf(nodeStack);
      
      // notify of the found node now that we don't have the curNode on the nodeStack anymore
      // but we still want the
      // pathstack to contain everything for this call: 
      notify(NODE_FOUND_EVENT, pathStack, nodeStack.concat([completeNode]) );      
            
      pathStack.pop();   
         
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
         // perminantly onto pathStack yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         keyDiscovered(firstKey);
      }
   };
   
   clarinet.onopenarray = function () {
      nodeFound([]);
      // We haven't discovered a key in the json because we don't know if the array is empty or not. So, set 
      // curKey in case there are contents
      curKey = 0;
   };

   // called by Clarinet when keys are found in objects               
   clarinet.onkey = keyDiscovered;   
               
   clarinet.onvalue = function (value) {
   
      // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
      // can't have descendants.
   
      nodeFound(value);
                        
      curNodeFinished();
   };         
   
   clarinet.onend =
   clarinet.oncloseobject =
   clarinet.onclosearray =       
      curNodeFinished;      
      
   /* finally, return a function to get the root of the json (or undefined if not yet found) */      
   return function() {
      return root;
   }           
}