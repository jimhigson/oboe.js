/**
 * Listen to the given clarinet instance and progressively build up the json based on the callbacks it provides.
 * 
 * Notify the oboeInstance when interesting things happen.
 * 
 * @param clarinet
 * @param oboeInstance
 */
function jsonBuilder( clarinet, oboeInstance ) {

   // All of the state of this jsonBuilder is kept isolated in these vars. The remainder of the logic is to maintain
   // this state and notify the oboeInstance 
    
   var   // The node we are currently parsing. Either an object or an array. May be transiently set to primitives
         // for the sake of code simplification but won't stay that way between callbacks.
         curNode
         // If we're in an object, curKey will be a string. If in an array, a number. It is the name of the attribute 
         // of curNode that we are currently parsing
   ,     curKey
         // array of nodes from curNode up to the root of the document.
   ,     nodeStack = [] // TODO: use fastlist?
         // array of strings - the path from the root of the dom to the node currently being parsed
   ,     pathStack = []
   ;
  
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number} key the key. If we are in an array will be a number, otherwise a string. 
    * @param {*} value usually this won't be known so can be null
    **/  
   function keyDiscovered(key, value) {
   
      var fullPath = key === null? pathStack : pathStack.concat(key);
   
      oboeInstance.pathFound(value, fullPath, nodeStack);
      curKey = key;      
   }
      
   /**
    * manages the state and notifications for when the current node has ended
    * 
    * @param {*} thingFound the thing that has been found in the json
    */              
   function nodeFound( thingFound ) {

      var foundIn = curNode,
          thingIsRoot = !foundIn;

      if( thingIsRoot ) {
      
         // Parsed the root object. Notify path listeners (eg to '!' or '*') that the root path has been satisfied.
         // (because this is the root, it can't have a key, hence null)            
         keyDiscovered(null, thingFound);                  
      }

      if( isArray(foundIn) ) {
         // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there is for objects)
         // so we need to notify of the paths when we find the items: 
         keyDiscovered(curKey, thingFound);
      }
      
      // add the newly found node to its parent. Unless it is the root in which case there is no parent to add to:
      if( !thingIsRoot ) {
         foundIn[curKey] = thingFound;
         pathStack.push(curKey);
      }
                        
      curNode = thingFound;            
      nodeStack.push(curNode);                  
   }

   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {
   
      var nodeFinished = curNode;
   
      // go up one level in the parsed json's tree
      nodeStack.pop();
      curNode = lastOf(nodeStack);      
   
      oboeInstance.nodeFound( nodeFinished, pathStack, nodeStack );      
   
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
    
   /* 
    * Finally, assign listeners to clarinet. Mostly these are just wrappers and pass-throughs for the higher
    * level functions above.
    */
    
   clarinet.onopenobject = function (firstKey) {

      nodeFound({});
      
      if( firstKey !== undefined ) {
         // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
         // perminantly onto pathStack yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         keyDiscovered(firstKey, null);
      }
   };
   
   clarinet.onopenarray = function () {
      nodeFound([]);
      // We haven't discovered a key in the json because we don't know if the array is empty or not. So, set 
      // curKey in case there are contents
      curKey = 0;
   };
               
   clarinet.onkey = function (nextKey) {
      // called by Clarinet when keys are found in objects      
      keyDiscovered(nextKey, null);   
   };                  
               
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
         
}