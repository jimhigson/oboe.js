/**
 * Detect if a given URL is cross-origin in the scope of the
 * current page.
 * 
 * Browser only (since cross-origin has no meaning in Node.js)
 *
 * @param {Object} pageLocation - as in window.location
 * @param {Object} urlOrigin - an object like window.location describing the 
 *    origin of some other url
 */
function isCrossOrigin(pageLocation, urlOrigin) {
   

   // match will have:
   //    1: protocol, with colon like 'http:' (or undefined) 
   //    2: host (or undefined)
   //    3: port (or undefined)

   return   (urlOrigin.protocol  && (urlOrigin.protocol  != pageLocation.protocol)) ||
            (urlOrigin.host      && (urlOrigin.host      != pageLocation.host))     ||
            (urlOrigin.port      && (urlOrigin.port      != pageLocation.port));
          
}

/* turn any url into an object like window.location */
function parseUrlOrigin(url) {
   // url could be domain-relative
   // url could give a domain

   // cross origin means:
   //    same domain
   //    same port
   //    some protocol
   // so, same everything up to the first (single) slash 
   // if such is given
   //
   // can ignore everything after that   
   
   var URL_HOST_PATTERN = /(\w+:(?:\/\/)?)?([\w.-]+)?(?::(\d+))?\/?/,
       urlHostMatch = URL_HOST_PATTERN.exec(url);

   if( !urlHostMatch ) {
      console.log('no match for', url);
      //throw new Error('could not parse url ' + url);
      urlHostMatch = {};
   }
   
   return {
      protocol:   urlHostMatch[1] || '',
      host:       urlHostMatch[2] || '',
      port:       urlHostMatch[3] || ''
   }
}
