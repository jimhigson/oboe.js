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

   function ActivityView( templateElement ) {
      var template = soma.template.create(templateElement);
   
      requestOboe.onFind({         
         '!.activity.heading' : renderTemplateWithNewData( template, 'heading' )            
      ,  '!.activity.$data[*]':  renderTemplateWithNewData( template, 'data' )
      });         
   }
   
   function RecentAchievementsView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({         
         '!.recentAchievements.$awards[*]' : renderTemplateWithNewData( template, 'awards' )
      });         
   }   
   
   function UserView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({
         '!.user' : renderTemplateWithNewData( template, 'user' )
      });
   }
   
   function ActivitySummaryView(templateElement) {
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
                                  
   ActivityView(elementForModule('tables'));
   RecentAchievementsView(elementForModule('recentAchievements'));
   UserView(elementForModule('accountBar'));
   UserView(elementForModule('user'));
   ActivitySummaryView(elementForModule('activitySummary'));
   
   // ok, let's simulate a slow connection:
   FakeAjax.loadThrottled(5, 5, requestOboe.read.bind(requestOboe));      
});