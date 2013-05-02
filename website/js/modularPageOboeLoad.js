$(function(){

   var requestOboe = oboe.parser();            
   
   function renderTemplateWithNewData( template, fieldName ) {
      var scope = template.scope;
      
      return function(data) {      
         // when oboe finds new data, put it in the template scope
         // and re-render the template: 
         scope[fieldName] = data;
         template.render();
      }
   }

   function ActivityView( template ) {
   
      requestOboe.onFind({         
         '!.activity.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '!.activity.$data[*]':  renderTemplateWithNewData( template, 'data' )
      });         
   }
   
   function RecentAchievementsView( template ) {
      
      requestOboe.onFind({         
         '!.recentAchievements.$awards[*]' : renderTemplateWithNewData( template, 'awards' )
      });         
   }   
   
   function UserView( template ) {
      
      requestOboe.onFind({
         '!.user' : renderTemplateWithNewData( template, 'user' )
      });
   }
   
   function ActivitySummaryView(template) {
            
      template.scope.calendar = [[]];                  
      requestOboe.onFind({
         '!.activitySummary.totalNumber' :                renderTemplateWithNewData( template, 'totalNumber' ) 
      ,  '!.activitySummary.$calendar.weeks[*].days[*]' : renderTemplateWithNewData( template, 'calendar' )
      });
   }
                      
   /* For a named module, finds the element in the DOM for it and wraps it in a soma template                           
    */
   function templateForModule(moduleName) {   
      return soma.template.create($('[data-module=' + moduleName + ']')[0]);
   }                      
                                     
   ActivityView(templateForModule('tables'));
   RecentAchievementsView(templateForModule('recentAchievements'));
   UserView(templateForModule('accountBar'));
   UserView(templateForModule('user'));
   ActivitySummaryView(templateForModule('activitySummary'));
   
   // ok, let's simulate a slow connection and feed the response into our oboe:
   FakeAjax.fetch(5, 5, requestOboe.read.bind(requestOboe));      
});