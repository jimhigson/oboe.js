$(function(){

   var parser = oboe.parser();            
   
   function renderTemplateWithNewData( template, fieldName ) {
      return function(data) {
         template.scope[fieldName] = data;
         template.render();
      }
   }
   function renderTemplateWithNewDataParent( template, fieldName ) {
      return function(data, _path, ancestors) {
         var parentObject = ancestors[ancestors.length-1];
         
         template.scope[fieldName] = parentObject;
         template.render();
      }
   }   
   
   function setupActivityView( templateElement ) {
      var template = soma.template.create(templateElement);
   
      parser.onFind({         
         '$.activity.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '$.activity.data':     renderTemplateWithNewData( template, 'data' )
      });         
   }
   
   function setupRecentAchievementsView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      parser.onFind({         
         '$.recentAchievements.awards.*' : renderTemplateWithNewDataParent( template, 'awards' )
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
   
   
   var exampleJsonResponse = JSON.stringify(expandJsonTemplate(dataTemplate));      
   loadThrottled(exampleJsonResponse, 5, 5);
   
   setupActivityView($('#TableTemplate')[0]);
   setupRecentAchievementsView($('[data-module=recentAchievements]')[0]);

});