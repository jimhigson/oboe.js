$(function(){

   var requestOboe = oboe.parser();            
   
   /* A tiny layer of glue to fix together oboe's callback and a request for soma to render the data */
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
         '!.activity.heading'   : renderTemplateWithNewData( template, 'heading' )                        
      ,  '!.activity.$data[*]'  :  renderTemplateWithNewData( template, 'data' )
      });         
   }
   
   function SocialStatsView( template ) {   
      requestOboe.onFind({         
         '!.$socialStats.*' : renderTemplateWithNewData( template, 'socialStats' )            
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
      ,  '!.activitySummary.$byType.*'          :                renderTemplateWithNewData( template, 'byType' )          
      ,  '!.activitySummary.$calendar.weeks[*].days[*]' : renderTemplateWithNewData( template, 'calendar' )
      });
   }
                      
   /* For a named module, finds the element in the DOM for it and wraps it in a soma template                           
    */
   function templateForModule(moduleName) {   
      return soma.template.create($('[data-module=' + moduleName + ']')[0]);
   }                      
                 
   SocialStatsView(templateForModule('socialStats'));                    
   ActivityView(templateForModule('tables'));
   RecentAchievementsView(templateForModule('recentAchievements'));
   UserView(templateForModule('accountBar'));
   UserView(templateForModule('user')); 
   ActivitySummaryView(templateForModule('activitySummary'));
   
   // ok, let's simulate a slow connection and feed the response into our oboe:
   FakeAjax.fetch(5, 5, requestOboe.read.bind(requestOboe));      
});