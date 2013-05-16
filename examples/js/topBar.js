
function initTopBar( requestOboe ) {
   "use strict";
   
   var button = $('#loadButton').click(function(){
   
      var jsonToLoad = JSON.stringify(RandomJson.randomiseMapOrder(RandomJson.expandJsonTemplate(dataTemplate)));
   
      // ok, let's simulate a slow connection and feed the response into our oboe:
      FakeAjax.fetch(jsonToLoad, 5, 5, requestOboe.read.bind(requestOboe));
   });
   
}   