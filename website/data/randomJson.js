// 20 random names from here: http://listofrandomnames.com/index.cfm?generated
var NAMES = [
   {first:"Brett"      , surname:"Stearman"    }
,  {first:"Pansy"      , surname:"Brunson"     }
,  {first:"Cleveland"  , surname:"Selvage"     }
,  {first:"Victor"     , surname:"Stucky"      }
,  {first:"Buster"     , surname:"Damiano"     }
,  {first:"Kelle"      , surname:"Demaio"      }
,  {first:"Lea"        , surname:"Pozo"        }
,  {first:"Grazyna"    , surname:"Sylvest"     }
,  {first:"Jesusita"   , surname:"Wiebe"       }
,  {first:"Yulanda"    , surname:"Lachapelle"  }
,  {first:"Emely"      , surname:"Holmberg"    }
,  {first:"Tu"         , surname:"Dizon"       }
,  {first:"Jimmie"     , surname:"Lynn"        }
,  {first:"Pok"        , surname:"Branner"     }
,  {first:"Josette"    , surname:"Swann"       }
,  {first:"Lazaro"     , surname:"Neufeld"     }
,  {first:"Rudy"       , surname:"Renninger"   }
,  {first:"Felipe"     , surname:"Kilburn"     }
,  {first:"Jorge"      , surname:"Swearngin"   }
,  {first:"Joette"     , surname:"Varney"      }
];

/** The json template has placeholders like {{Boolean}} or {{Name}}. Traverse it and replace them to make
 *  a sample page. 
 */
function expandJsonTemplate( json ) {
            
   // traveerse json recursively, replacing some special tokens with random values:
   
   function replacePlaceholders(templateString){
      
      var userName = NAMES[ Math.floor(Math.random() * NAMES.length) ];
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
         
            /\{\{Number (\d+) to (\d+)\}\}/, 
            function(match, from, to){ 
               changed = true; 
               return Math.round(Math.random() * (to - from +1) + from) 
            }
            
         ).replace("{{Firstname}}", userName.first)
          .replace("{{Surname}}", userName.surname);
         
         
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