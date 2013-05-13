var RandomJson = (function() {

   // 20 random names from here: http://listofrandomnames.com/index.cfm?generated
   // locations are 20 top from here: https://en.wikipedia.org/wiki/Largest_cities_of_the_European_Union_by_population_within_city_limits
   var PEOPLE = [
      {firstname:"Brett"      , surname:"Stearman"    , location:"London, United Kingdom"}
   ,  {firstname:"Pansy"      , surname:"Brunson"     , location:"Berlin, Germany"}
   ,  {firstname:"Roger"      , surname:"Selvage"     , location:"Madrid, Spain"}
   ,  {firstname:"Victor"     , surname:"Stucky"      , location:"Rome, Italy"}
   ,  {firstname:"Buster"     , surname:"Damiano"     , location:"Paris, France"}
   ,  {firstname:"Kelle"      , surname:"Demaio"      , location:"Bucharest, Romania"}
   ,  {firstname:"Lea"        , surname:"Pozo"        , location:"Hamburg, Germany"}
   ,  {firstname:"Grazyna"    , surname:"Sylvest"     , location:"Budapest, Hungary"}
   ,  {firstname:"Jesusita"   , surname:"Wiebe"       , location:"Vienna, Austria"}
   ,  {firstname:"Yulanda"    , surname:"Lachapelle"  , location:"Warsaw, Poland"}
   ,  {firstname:"Emely"      , surname:"Holmberg"    , location:"Barcelona, Spain"}
   ,  {firstname:"Tu"         , surname:"Dizon"       , location:"Munich, Germany"}
   ,  {firstname:"Jimmie"     , surname:"Lynn"        , location:"Milan, Italy"}
   ,  {firstname:"Pok"        , surname:"Branner"     , location:"Prague, Czech Republic"}
   ,  {firstname:"Josette"    , surname:"Swann"       , location:"Sofia, Bulgaria"}
   ,  {firstname:"Lazaro"     , surname:"Neufeld"     , location:"Brussels, Belgium"}
   ,  {firstname:"Rudy"       , surname:"Renninger"   , location:"Birmingham, United Kingdom"}
   ,  {firstname:"Felipe"     , surname:"Kilburn"     , location:"Cologne, Germany"}
   ,  {firstname:"Jorge"      , surname:"Swearngin"   , location:"Naples, Italy"}
   ,  {firstname:"Joette"     , surname:"Varney"      , location:"Stockholm, Sweden"}
   ];
   
   var LOREMS = [
      "Lorem ipsum dolor sit amet" ,
      "consectetur adipisicing " ,
      "elit, sed do " ,
      "eiusmod tempor incididunt" ,
      "ut labore et" ,
      "dolore magna aliqua." ,
      "Ut enim" ,
      "ad minim veniam" ,
      "quis nostrud" ,
      "exercitation" ,
      "ullamco laboris nisi" ,
      "ut aliquip ex ea commodo consequat." ,
      "Duis aute" ,
      "irure dolor in reprehenderit"
   ];
   
   function randomFrom( array ) {
      return array[ Math.floor(Math.random() * array.length) ];
   }
   
   /** The json template has placeholders like {{Boolean}} or {{Name}}. Traverse it and replace them to make
    *  a sample page. 
    */
   function expandJsonTemplate( json ) {
         
      // let's pick a name for the user:         
      var user = randomFrom(PEOPLE);      

      // traveerse json recursively, replacing some special tokens with random values:      
      function replacePlaceholders(templateString){
         
         var changed;
         
         do{
            changed = false;
         
            templateString = templateString.replace(
   
               "{{Boolean}}", 
               function(){ 
                  changed = true; 
                  return Math.random() > 0.5 
               }
               
            ).replace(
            
               /\{\{Number(?: (\d+) to (\d+))?\}\}/, 
               function(match, from, to){
                  // by default, go from 0 to 10
                  from = from || 1;
                  to = to || 10;
                
                  changed = true; 
                  return Math.round(Math.random() * (to - from +1) + from) 
               }
               
            ).replace(
                        
               /\{\{One from ([\w\s]*)\}\}/, 
               function(match, choices){                
                  changed = true; 
                  return randomFrom(choices.split(' ')); 
               }
               
            ).replace(
               "{{Lorem}}", 
               function(){
                  changed = true;
                  return randomFrom(LOREMS);
               }            
            ).replace("{{Firstname}}", user.firstname)
             .replace("{{Surname}}", user.surname)
             .replace("{{Location}}", user.location)
             ;
            
            
         } while( changed );
         
         return templateString;
      }
      
      for( var i in json ) {
      
         switch( json[i].constructor.name ) {
            
            case "Object":
            case "Array":         
               json[i] = expandJsonTemplate(json[i]);
               break;
            
            case "String":
               json[i] = replacePlaceholders( json[i] );
               break;                       
         }
      }
                     
      return json;         
   }
   
   return {
      expandJsonTemplate: expandJsonTemplate
   };
}());   