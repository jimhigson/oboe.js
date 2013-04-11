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
   
   function setupUserBarView( templateElement ) {
      var template = soma.template.create(templateElement);
      
      requestOboe.onFind({
         '$.user' : renderTemplateWithNewData( template, 'user' )
      });
   }
      
   function randomiseMapOrder(map) {
      var randomkeys = _.shuffle( _.keys(map) ),
          newMap = {};
      
      _.each( randomkeys, function( key ) {
         newMap[key] = map[key];      
      });
      
      return newMap;
   }      
         
   function expandJsonTemplate( jsonTemplate ) {
               
      return randomiseMapOrder(jsonTemplate);
            
   }
   
   function loadThrottled(fullData, dripSize, dripInterval) {
         
      var cursorPosition = 0;         
         
      var intervalId = window.setInterval(function(){
      
         var nextDrip = fullData.substr(cursorPosition, dripSize);         
         
         cursorPosition += dripSize;
         
         console.log('next drip is', nextDrip);
                  
         requestOboe.read(nextDrip);
         
         if( cursorPosition >= fullData.length ) {
            window.clearInterval(intervalId);
         }                                                        

      }, dripInterval);
   }
   
   
   var exampleJsonResponse = JSON.stringify(expandJsonTemplate(dataTemplate));      
   loadThrottled(exampleJsonResponse, 5, 5);
   
   setupActivityView($('[data-module=tables]')[0]);
   setupRecentAchievementsView($('[data-module=recentAchievements]')[0]);
   setupUserBarView($('[data-module=accountBar]')[0]);

});