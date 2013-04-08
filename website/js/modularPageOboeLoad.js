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
   
   function expandJsonTemplate( template ) {
               
      return template;
      // TODO: expand examples out
      // TODO: ramdomise the order.
   }
   
   function loadThrottled(parser, exampleData) {
      parser.read(exampleData);
   }
   
   // some time later, let's start reading:
   window.setTimeout(function(){
      // pretend to fetch in the data:
      var exampleJsonResponse = JSON.stringify(expandJsonTemplate(dataTemplate));      
   
      loadThrottled(parser, exampleJsonResponse);
   }, 1000);
   
   setupTableTemplate('#TableTemplate');

});