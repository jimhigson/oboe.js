/**
 * Detect if a given URL is cross-origin in the scope of the
 * current page.
 * 
 * Browser only (since cross-origin has no meaning in Node.js)
 * 
 * Actually, could we use withCredentials here?
 * 
 * @param url
 */
function isCrossOrigin(pageLocation, url) {
   
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
   
   var URL_HOST_PATTERN = /(\w+:)?\/\/([\w.]+)?(?::(\d+))?\//,
       urlHostMatch = URL_HOST_PATTERN.exec(url);
       
   // match will have:
   //    1: protocol, with colon like 'http:' (or undefined) 
   //    2: host (or undefined)
   //    3: port (or undefined)

   return (urlHostMatch[1] && (urlHostMatch[1] != pageLocation.protocol)) &&
          (urlHostMatch[2] && (urlHostMatch[2] != pageLocation.host)) &&
          (urlHostMatch[3] && (urlHostMatch[3] != pageLocation.port));
}
