
function initTopBar( requestOboe ) {

   // ok, let's simulate a slow connection and feed the response into our oboe:
   FakeAjax.fetch(5, 5, requestOboe.read.bind(requestOboe));
   
   var button = $('#loadButton').click(function(){
      console.log('load');
   });
   
}   