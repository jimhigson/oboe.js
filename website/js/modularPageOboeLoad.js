$(function(){

   var parser = oboe.parser();            
   
   function renderTemplateWithNewData( template, fieldName ) {
      return function(data) {
         template.scope[fieldName] = data;
         template.render();
      }
   }
   
   function setupTableTemplate( cssSelector ) {
      var template = soma.template.create($(cssSelector)[0]);
   
      parser.onFind({         
         '$.table.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '$.table.data':     renderTemplateWithNewData( template, 'data' )
      });         
   }
         
   function expandJsonTemplate( jsonTemplate ) {
               
      return jsonTemplate;
      // TODO: expand examples out
      // TODO: ramdomise the order (even though the order is non-deterministic!).
   }
   
   function loadThrottled(fullData, dripSize, dripInterval) {
      
   
      var cursorPosition = 0;         
         
      var intervalId = window.setInterval(function(){
      
         var nextDrip = fullData.substr(cursorPosition, dripSize);         
         
         cursorPosition += dripSize;
         
         console.log('next drip is', nextDrip);
                  
         parser.read(nextDrip);
         
         if( cursorPosition >= fullData.length ) {
            window.clearInterval(intervalId);
         }                                                        

      }, dripInterval);
   }
   
   // some time later, let's start reading:
   window.setTimeout(function(){
      // pretend to fetch in the data:
      var exampleJsonResponse = JSON.stringify(expandJsonTemplate(dataTemplate));      
   
      loadThrottled(exampleJsonResponse, 20, 100);
   }, 1000);
   
   setupTableTemplate('#TableTemplate');

});