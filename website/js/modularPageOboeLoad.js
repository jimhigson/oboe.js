$(function(){

   var requestOboe = oboe.parser();            
   
   function renderTemplateWithNewData( template, fieldName ) {
      return function(data) {      
         template.scope[fieldName] = data;
         template.render();
      }
   }

   function setupActivityView( templateElement ) {
      var template = soma.template.create(templateElement);
   
      requestOboe.onFind({         
         '!.activity.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '!.activity.$data[*]':  renderTemplateWithNewData( template, 'data' )
      });         
   }
   
   function setupRecentAchievementsView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({         
         '!.recentAchievements.$awards[*]' : renderTemplateWithNewData( template, 'awards' )
      });         
   }   
   
   function setupUserView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({
         '!.user' : renderTemplateWithNewData( template, 'user' )
      });
   }
   
   function setupActivitySummaryView(templateElement) {
      var template = soma.template.create(templateElement);
            
      template.scope.calendar = [[]];                  
      requestOboe.onFind({
         '!.activitySummary.totalNumber' :                renderTemplateWithNewData( template, 'totalNumber' ) 
      ,  '!.activitySummary.$calendar.weeks[*].days[*]' : renderTemplateWithNewData( template, 'calendar' )
      });
   }
                      
   function elementForModule(moduleName) {
      return $('[data-module=' + moduleName + ']')[0];
   }                      
                      
   var exampleJsonResponse = JSON.stringify(randomiseMapOrder(expandJsonTemplate(dataTemplate)));
         
   loadThrottled(exampleJsonResponse, 5, 5, function(nextDrip){
      requestOboe.read(nextDrip);
   });
   
   setupActivityView(elementForModule('tables'));
   setupRecentAchievementsView(elementForModule('recentAchievements'));
   setupUserView(elementForModule('accountBar'));
   setupUserView(elementForModule('user'));
   setupActivitySummaryView(elementForModule('activitySummary'));   

});