$(function(){

   var requestOboe = oboe.parser();            
   
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
   
      requestOboe.onFind({         
         '$.activity.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '$.activity.data[*]':     renderTemplateWithNewDataParent( template, 'data' )
      });         
   }
   
   function setupRecentAchievementsView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({         
         '$.recentAchievements.awards[*]' : renderTemplateWithNewDataParent( template, 'awards' )
      });         
   }   
   
   function setupUserView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({
         '$.user' : renderTemplateWithNewData( template, 'user' )
      });
   }
                      
   var exampleJsonResponse = JSON.stringify(expandJsonTemplate(dataTemplate));
         
   loadThrottled(exampleJsonResponse, 5, 5, function(nextDrip){
      requestOboe.read(nextDrip);
   });
   
   setupActivityView($('[data-module=tables]')[0]);
   setupRecentAchievementsView($('[data-module=recentAchievements]')[0]);
   setupUserView($('[data-module=accountBar]')[0]);
   setupUserView($('[data-module=user]')[0]);

});