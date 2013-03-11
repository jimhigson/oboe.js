
var pg = new ProgressiveJson();

pg.notifyOfObject('//foo/bar', function(object, ancestors){

   console.log('found in the json stream', object, 'at', ancestors);
});

var testJsonDrips = splitStringIntoSmallParts(
   Json.stringify( {
      ignoredObject: {
         foo:{}
      },
      foo: {
         bar:{
            // expect this object to be notified
            a:b,
            c:d
         }
      }
   })
);

function splitStringIntoSmallParts(input) {
   var parts = [];

   for( var i = 0; i< s.length ; i+= 4){
      parts.push(s.substr(i,4));
   }

   return parts;
}

testJsonDrips.forEach(function(jsonDrip){
   pg.read(jsonDrip);
});