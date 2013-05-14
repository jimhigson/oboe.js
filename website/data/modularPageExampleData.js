var dataTemplate = 
{

   "user": {
      "firstname":"{{Firstname}}"
   ,  "surname":"{{Surname}}"
   ,  "avitar":"//placehold.it"
   ,  "location":"{{Location}}"
   }
      
,  "recentAchievements": {
      "awards":[
         {
            "segment":{
               "name": "{{Lorem}}"
            ,  "url": "/example-link"
            },         
            "type":"Personal Record",
            "when": "{{Number}} {{One from weeks days}} ago"
         }
      ,  {
            "segment":{
               "name": "{{Lorem}}"
            ,  "url": "/example-link"
            },      
            "type":"KOM",
            "when": "{{Number}} {{One from weeks days}} ago"
         }
      ,  {
            "segment":{
               "name": "{{Lorem}}"
            ,  "url": "/example-link"
            },      
            "type":"Personal Record",
            "when": "{{Number}} {{One from weeks days}} ago"
         }
      ,  {
            "segment":{
               "name": "{{Lorem}}"
            ,  "url": "/example-link"
            },      
            "type":"6th Overall",
            "when": "{{Number}} {{One from weeks days}} ago"
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
      "byType": {
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

,  "tables": {
      "heading"   :"Activity"
   ,  "data"      : [
         {heading:'Avg Rides / Week', value:'4'}
      ,  {heading:'Avg Distance / Week', value:'76km'}
      ,  {heading:'Avg Time / Week', value:'3 hr 59 m'}
      ]
   }
            
};