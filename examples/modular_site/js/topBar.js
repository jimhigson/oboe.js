
function initTopBar( requestOboe ) {
   "use strict";
   
   $('#loadButton').click(loadNewFakeJson);
      
   function loadNewFakeJson(){
   
      var jsonToLoad = JSON.stringify(RandomJson.randomiseMapOrder(RandomJson.expandJsonTemplate(dataTemplate)));
   
      requestOboe.reset();
   
      // ok, let's simulate a slow connection and feed the response into our oboe:
      FakeAjax.fetch(jsonToLoad, 5, 5, requestOboe.read.bind(requestOboe));
   }   
   
}   