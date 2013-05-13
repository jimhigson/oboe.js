var dataTemplate = 
{

   "user": {
      "usernameShort":"Jim"
   ,  "username":"Jim Higson"
   ,  "avitar":"//placehold.it/32"
   ,  "location":"London, United Kingdom"
   }

,  "pageInfo": {
   }

,  "barChart": {
   }
   
,  "imageSlider":{
   }
   
,  "map": {
      "minLat"    :""
   ,  "minLong"   :""
   ,  "maxLat"    :""
   ,  "maxLong"   :""
   ,  "points"    : [
      ]   
   }      
   
,  "recentAchievements": {
      "awards":[
         {
            "type":"Personal Record",
            "when": "2 days ago",
            "segment":{
               "name": "Ditching Beacon"
            ,  "url": "/example-link"
            }
         }
      ,  {
            "type":"KOM",
            "when": "7 days ago",
            "segment":{
               "name": "A406 to Town Hall"
            ,  "url": "/example-link"
            }
         }
      ,  {
            "type":"Personal Record",
            "when": "today",
            "segment":{
               "name": "Silly sprint"
            ,  "url": "/example-link"
            }
         }
      ,  {
            "type":"6th Overall",
            "when": "2 weeks ago",
            "segment":{
               "name": "Archway Rd climb"
            ,  "url": "/example-link"
            }
         }                                    
      ]
      
   }   
   
,  "socialStats": {
      "following":"{{Number 0 to 100}}"
   ,  "followers":"{{Number 0 to 100}}"
   ,  "kudos":    "{{Number 0 to 100}}"
   ,  "comments": "{{Number 0 to 100}}"
   }   
   
,  "activitySummary" : {
      "totalNumber":"{{Number 10 to 25}}"
   ,  "byType": {
         "cycling":"{{Number 3 to 10}}",
         "running":"{{Number 3 to 10}}"         
      }   
   ,  "calendar":{
         "weeks":[
            {  days:{mon:"{{Boolean}}", tue:"{{Boolean}}", wed:"{{Boolean}}", thur:"{{Boolean}}", fri:"{{Boolean}}", sat:"{{Boolean}}", sun:"{{Boolean}}"}
            ,  timeSpent:{hours:"{{Number 1 to 12}}", minutes:"{{Number 0 to 59}}"}
            }
            
         ,  {  days:{mon:"{{Boolean}}", tue:"{{Boolean}}", wed:"{{Boolean}}", thur:"{{Boolean}}", fri:"{{Boolean}}", sat:"{{Boolean}}", sun:"{{Boolean}}"}
            ,  timeSpent:{hours:"{{Number 1 to 12}}", minutes:"{{Number 0 to 59}}"}
            }
              
         ,  {  days:{mon:"{{Boolean}}", tue:"{{Boolean}}", wed:"{{Boolean}}", thur:"{{Boolean}}", fri:"{{Boolean}}", sat:"{{Boolean}}", sun:"{{Boolean}}"}
            ,  timeSpent:{hours:"{{Number 1 to 12}}", minutes:"{{Number 0 to 59}}"}
            }
               
         ,  {  days:{mon:"{{Boolean}}", tue:"{{Boolean}}", wed:"{{Boolean}}", thur:"{{Boolean}}", fri:"{{Boolean}}", sat:"{{Boolean}}", sun:"{{Boolean}}"}
            ,  timeSpent:{hours:"{{Number 1 to 12}}", minutes:"{{Number 0 to 59}}"}
            }
         ]
      }      
   }   

,  "activity": {
      "heading"   :"Activity"
   ,  "data"      : [
         {heading:'Avg Rides / Week', value:'4'}
      ,  {heading:'Avg Distance / Week', value:'76km'}
      ,  {heading:'Avg Time / Week', value:'3 hr 59 m'}
      ]
   }
            
};