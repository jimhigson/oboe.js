function prettyPrintEvent(event){

   switch(event) {
      case     HTTP_START:  return 'start';
      case     STREAM_DATA: return 'data';
      case     STREAM_END:  return 'end';
      case     SAX_VALUE        : return 'sax_val';
      case     SAX_KEY          : return 'sax_key';
      case     SAX_OPEN_OBJECT  : return 'sax_oo';
      case     SAX_CLOSE_OBJECT : return 'sax_co';
      case     SAX_OPEN_ARRAY   : return 'sax_oa';
      case     SAX_CLOSE_ARRAY  : return 'sax_ca';
      case     FAIL_EVENT       : return 'fail';
      default: return 'unknown(' + event + ')'
   }
}
