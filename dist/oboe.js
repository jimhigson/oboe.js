// this file is the concatenation of several js files. See https://github.com/jimhigson/oboe.js/tree/master/src for the unconcatenated source
(function (window, Object, Array, undefined) {function lastOf(array) {
   return array[len(array)-1];
}

function isArray(a) {
   return a && a.constructor === Array;
}

function len(array){
   return array.length;
}

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

function isString(thing) {
   return typeof thing == 'string';
}

/*
   Call each of a list of functions with the same arguments, ignoring any return
   values.
 */
function callAll( fns, scope /*, arg1, arg2, arg3...*/ ) {

   var args = toArray(arguments, 2);

   fns.forEach(function( fn ){
      fn.apply(scope, args);
   });
}

/* call a list of functions with the same args until one returns truthy.

   Returns the first return value that is given that is non-truthy.
   
   If none are found, calls onFail and returns whatever that gives    
 */
function firstMatching( fns, args, onFail ) {

   var rtn;

   for (var i = 0; i < len(fns); i++) {
            
      if( rtn = fns[i].apply(undefined, args) ) {
         return rtn;
      }      
   }  
   
   return onFail();
}


/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.    
 */
function partialComplete( fn /* arg1, arg2, arg3 ... */ ) {

   var args = toArray(arguments);
   args[0] = undefined; // the first argument to bind should be undefined since we
                        // wish to specify no context

   return fn.bind.apply(fn, args); 
}

function always(){return true}
(function(arrayProto, functionProto){

   /**
    * Here we have a minimal set of polyfills needed to let the code run in older browsers such
    * as IE8.
    * 
    * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
    * to make a custom build without this. However, it is as small as it can be to get the job done.
    * 
    */
   
   // Array.forEach has to be a polyfill, clarinet expects it
   // Ignoring all but function argument since not needed, eg can't take a context       
   arrayProto.forEach = arrayProto.forEach || function( func ){
         
      for( var i = 0 ; i < len(this) ; i++ ) {      
         func( this[i] );    
      }      
   };         
   
   
   // Array.filter has to be a polyfill, clarinet expects it.
   // Ignoring all but function argument since not needed, eg can't take a context   
   arrayProto.filter = arrayProto.filter || function( func ){
         
      var out = [];
   
      // let's use the .forEach we just declared above to implement .filter
      this.forEach(function(item){      
         if( func( item ) ) {
            out.push(item);
         }                  
      });
      
      return out;
   };
   
    
   functionProto.bind = functionProto.bind || function( context /*, arg1, arg2 ... */ ){
      var f = this,
          boundArgs = toArray(arguments, 1);
   
      return function( /* yet more arguments */ ) {
         var callArgs = boundArgs.concat(toArray(arguments));            
            
         return f.apply(context, callArgs);
      }
   };

})(Array.prototype, Function.prototype);
;(function (clarinet) {
  // non node-js needs to set clarinet debug on root
  var env
    , fastlist
    ;

if(typeof process === 'object' && process.env) env = process.env;
else env = window;

if(typeof FastList === 'function') {
  fastlist = FastList;
} else if (typeof require === 'function') {
  try { fastlist = require('fast-list'); } catch (exc) { fastlist = Array; }
} else fastlist = Array;

  clarinet.parser            = function (opt) { return new CParser(opt);};
  clarinet.CParser           = CParser;
  clarinet.CStream           = CStream;
  clarinet.createStream      = createStream;
  clarinet.MAX_BUFFER_LENGTH = 64 * 1024;
  clarinet.DEBUG             = (env.CDEBUG==='debug');
  clarinet.INFO              = (env.CDEBUG==='debug' || env.CDEBUG==='info');
  clarinet.EVENTS            =
    [ "value"
    , "string"
    , "key"
    , "openobject"
    , "closeobject"
    , "openarray"
    , "closearray"
    , "error"
    , "end"
    , "ready"
    ];

  var buffers     = [ "textNode", "numberNode" ]
    , streamWraps = clarinet.EVENTS.filter(function (ev) {
          return ev !== "error" && ev !== "end";
        })
    , S           = 0
    , Stream
    ;

  clarinet.STATE =
    { BEGIN                             : S++
    , VALUE                             : S++ // general stuff
    , OPEN_OBJECT                       : S++ // {
    , CLOSE_OBJECT                      : S++ // }
    , OPEN_ARRAY                        : S++ // [
    , CLOSE_ARRAY                       : S++ // ]
    , TEXT_ESCAPE                       : S++ // \ stuff
    , STRING                            : S++ // ""
    , BACKSLASH                         : S++
    , END                               : S++ // No more stack
    , OPEN_KEY                          : S++ // , "a"
    , CLOSE_KEY                         : S++ // :
    , TRUE                              : S++ // r
    , TRUE2                             : S++ // u
    , TRUE3                             : S++ // e
    , FALSE                             : S++ // a
    , FALSE2                            : S++ // l
    , FALSE3                            : S++ // s
    , FALSE4                            : S++ // e
    , NULL                              : S++ // u
    , NULL2                             : S++ // l
    , NULL3                             : S++ // l
    , NUMBER_DECIMAL_POINT              : S++ // .
    , NUMBER_DIGIT                      : S++ // [0-9]
    };

  for (var s_ in clarinet.STATE) clarinet.STATE[clarinet.STATE[s_]] = s_;

  // switcharoo
  S = clarinet.STATE;

  if (!Object.create) {
    Object.create = function (o) {
      function f () { this["__proto__"] = o; }
      f.prototype = o;
      return new f;
    };
  }

  if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function (o) {
      return o["__proto__"];
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a;
    };
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(clarinet.MAX_BUFFER_LENGTH, 10)
      , maxActual = 0
      ;
    for (var i = 0, l = buffers.length; i < l; i ++) {
      var len = parser[buffers[i]].length;
      if (len > maxAllowed) {
        switch (buffers[i]) {
          case "text":
            closeText(parser);
          break;

          default:
            error(parser, "Max buffer length exceeded: "+ buffers[i]);
        }
      }
      maxActual = Math.max(maxActual, len);
    }
    parser.bufferCheckPosition = (clarinet.MAX_BUFFER_LENGTH - maxActual)
                               + parser.position;
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i ++) {
      parser[buffers[i]] = "";
    }
  }

  var stringTokenPattern = /[\\"\n]/g;

  function CParser (opt) {
    if (!(this instanceof CParser)) return new CParser (opt);

    var parser = this;
    clearBuffers(parser);
    parser.bufferCheckPosition = clarinet.MAX_BUFFER_LENGTH;
    parser.q        = parser.c = parser.p = "";
    parser.opt      = opt || {};
    parser.closed   = parser.closedRoot = parser.sawRoot = false;
    parser.tag      = parser.error = null;
    parser.state    = S.BEGIN;
    parser.stack    = new fastlist();
    // mostly just for error reporting
    parser.position = parser.column = 0;
    parser.line     = 1;
    parser.slashed  = false;
    parser.unicodeI = 0;
    parser.unicodeS = null;
    emit(parser, "onready");
  }

  CParser.prototype =
    { end    : function () { end(this); }
    , write  : write
    , resume : function () { this.error = null; return this; }
    , close  : function () { return this.write(null); }
    };

  try        { Stream = require("stream").Stream; }
  catch (ex) { Stream = function () {}; }

  function createStream (opt) { return new CStream(opt); }

  function CStream (opt) {
    if (!(this instanceof CStream)) return new CStream(opt);

    this._parser = new CParser(opt);
    this.writable = true;
    this.readable = true;

    var me = this;
    Stream.apply(me);

    this._parser.onend = function () { me.emit("end"); };
    this._parser.onerror = function (er) {
      me.emit("error", er);
      me._parser.error = null;
    };

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, "on" + ev,
        { get          : function () { return me._parser["on" + ev]; }
        , set          : function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser["on"+ev] = h;
              return h;
            }
            me.on(ev, h);
          }
        , enumerable   : true
        , configurable : false
        });
    });
  }

  CStream.prototype = Object.create(Stream.prototype,
    { constructor: { value: CStream } });

  CStream.prototype.write = function (data) {
    this._parser.write(data.toString());
    this.emit("data", data);
    return true;
  };

  CStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) this._parser.write(chunk.toString());
    this._parser.end();
    return true;
  };

  CStream.prototype.on = function (ev, handler) {
    var me = this;
    if (!me._parser["on"+ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser["on"+ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]]
                 : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        me.emit.apply(me, args);
      };
    }
    return Stream.prototype.on.call(me, ev, handler);
  };

  CStream.prototype.destroy = function () {
    clearBuffers(this._parser);
    this.emit("close");
  };

  function emit(parser, event, data) {
    if(clarinet.INFO) console.log('-- emit', event, data);
    if (parser[event]) parser[event](data);
  }

  function emitNode(parser, event, data) {
    closeValue(parser);
    emit(parser, event, data);
  }

  function closeValue(parser, event) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) {
      emit(parser, (event ? event : "onvalue"), parser.textNode);
    }
    parser.textNode = "";
  }

  function closeNumber(parser) {
    if (parser.numberNode)
      emit(parser, "onvalue", parseFloat(parser.numberNode));
    parser.numberNode = "";
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, " ");
    return text;
  }

  function error (parser, er) {
    closeValue(parser);
    er += "\nLine: "+parser.line+
          "\nColumn: "+parser.column+
          "\nChar: "+parser.c;
    er = new Error(er);
    parser.error = er;
    emit(parser, "onerror", er);
    return parser;
  }

  function end(parser) {
    if (parser.state !== S.VALUE) error(parser, "Unexpected end");
    closeValue(parser);
    parser.c      = "";
    parser.closed = true;
    emit(parser, "onend");
    CParser.call(parser, parser.opt);
    return parser;
  }

  function write (chunk) {
    var parser = this;
    if (this.error) throw this.error;
    if (parser.closed) return error(parser,
      "Cannot write after close. Assign an onready handler.");
    if (chunk === null) return end(parser);
    var i = 0, c = chunk[0], p = parser.p;
    if (clarinet.DEBUG) console.log('write -> [' + chunk + ']');
    while (c) {
      p = c;
      parser.c = c = chunk.charAt(i++);
      // if chunk doesnt have next, like streaming char by char
      // this way we need to check if previous is really previous
      // if not we need to reset to what the parser says is the previous
      // from buffer
      if(p !== c ) parser.p = p;
      else p = parser.p;

      if(!c) break;

      if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
      parser.position ++;
      if (c === "\n") {
        parser.line ++;
        parser.column = 0;
      } else parser.column ++;
      switch (parser.state) {

        case S.BEGIN:
          if (c === "{") parser.state = S.OPEN_OBJECT;
          else if (c === "[") parser.state = S.OPEN_ARRAY;
          else if (c !== '\r' && c !== '\n' && c !== ' ' && c !== '\t')
            error(parser, "Non-whitespace before {[.");
        continue;

        case S.OPEN_KEY:
        case S.OPEN_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(parser.state === S.OPEN_KEY) parser.stack.push(S.CLOSE_KEY);
          else {
            if(c === '}') {
              emit(parser, 'onopenobject');
              emit(parser, 'oncloseobject');
              parser.state = parser.stack.pop() || S.VALUE;
              continue;
            } else  parser.stack.push(S.CLOSE_OBJECT);
          }
          if(c === '"') parser.state = S.STRING;
          else error(parser, "Malformed object key should start with \"");
        continue;

        case S.CLOSE_KEY:
        case S.CLOSE_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          var event = (parser.state === S.CLOSE_KEY) ? 'key' : 'object';
          if(c===':') {
            if(parser.state === S.CLOSE_OBJECT) {
              parser.stack.push(S.CLOSE_OBJECT);
              closeValue(parser, 'onopenobject');
            } else closeValue(parser, 'onkey');
            parser.state  = S.VALUE;
          } else if (c==='}') {
            emitNode(parser, 'oncloseobject');
            parser.state = parser.stack.pop() || S.VALUE;
          } else if(c===',') {
            if(parser.state === S.CLOSE_OBJECT)
              parser.stack.push(S.CLOSE_OBJECT);
            closeValue(parser);
            parser.state  = S.OPEN_KEY;
          } else error(parser, 'Bad object');
        continue;

        case S.OPEN_ARRAY: // after an array there always a value
        case S.VALUE:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(parser.state===S.OPEN_ARRAY) {
            emit(parser, 'onopenarray');
            parser.state = S.VALUE;
            if(c === ']') {
              emit(parser, 'onclosearray');
              parser.state = parser.stack.pop() || S.VALUE;
              continue;
            } else {
              parser.stack.push(S.CLOSE_ARRAY);
            }
          }
               if(c === '"') parser.state = S.STRING;
          else if(c === '{') parser.state = S.OPEN_OBJECT;
          else if(c === '[') parser.state = S.OPEN_ARRAY;
          else if(c === 't') parser.state = S.TRUE;
          else if(c === 'f') parser.state = S.FALSE;
          else if(c === 'n') parser.state = S.NULL;
          else if(c === '-') { // keep and continue
            parser.numberNode += c;
          } else if(c==='0') {
            parser.numberNode += c;
            parser.state = S.NUMBER_DIGIT;
          } else if('123456789'.indexOf(c) !== -1) {
            parser.numberNode += c;
            parser.state = S.NUMBER_DIGIT;
          } else               error(parser, "Bad value");
        continue;

        case S.CLOSE_ARRAY:
          if(c===',') {
            parser.stack.push(S.CLOSE_ARRAY);
            closeValue(parser, 'onvalue');
            parser.state  = S.VALUE;
          } else if (c===']') {
            emitNode(parser, 'onclosearray');
            parser.state = parser.stack.pop() || S.VALUE;
          } else if (c === '\r' || c === '\n' || c === ' ' || c === '\t')
              continue;
          else error(parser, 'Bad array');
        continue;

        case S.STRING:
          // thanks thejh, this is an about 50% performance improvement.
          var starti              = i-1
            , slashed = parser.slashed
            , unicodeI = parser.unicodeI
            ;
          STRING_BIGLOOP: while (true) {
            if (clarinet.DEBUG)
              console.log(i,c,clarinet.STATE[parser.state]
                         ,slashed);
            // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
            while (unicodeI > 0) {
              parser.unicodeS += c;
              c = chunk.charAt(i++);
              if (unicodeI === 4) {
                // TODO this might be slow? well, probably not used too often anyway
                parser.textNode += String.fromCharCode(parseInt(parser.unicodeS, 16));
                unicodeI = 0;
                starti = i-1;
              } else {
                unicodeI++;
              }
              // we can just break here: no stuff we skipped that still has to be sliced out or so
              if (!c) break STRING_BIGLOOP;
            }
            if (c === '"' && !slashed) {
              parser.state = parser.stack.pop() || S.VALUE;
              parser.textNode += chunk.substring(starti, i-1);
              if(!parser.textNode) {
                 emit(parser, "onvalue", "");
              }
              break;
            }
            if (c === '\\' && !slashed) {
              slashed = true;
              parser.textNode += chunk.substring(starti, i-1);
              c = chunk.charAt(i++);
              if (!c) break;
            }
            if (slashed) {
              slashed = false;
                   if (c === 'n') { parser.textNode += '\n'; }
              else if (c === 'r') { parser.textNode += '\r'; }
              else if (c === 't') { parser.textNode += '\t'; }
              else if (c === 'f') { parser.textNode += '\f'; }
              else if (c === 'b') { parser.textNode += '\b'; }
              else if (c === 'u') {
                // \uxxxx. meh!
                unicodeI = 1;
                parser.unicodeS = '';
              } else {
                parser.textNode += c;
              }
              c = chunk.charAt(i++);
              starti = i-1;
              if (!c) break;
              else continue;
            }

            stringTokenPattern.lastIndex = i;
            var reResult = stringTokenPattern.exec(chunk);
            if (reResult === null) {
              i = chunk.length+1;
              parser.textNode += chunk.substring(starti, i-1);
              break;
            }
            i = reResult.index+1;
            c = chunk.charAt(reResult.index);
            if (!c) {
              parser.textNode += chunk.substring(starti, i-1);
              break;
            }
          }
          parser.slashed = slashed;
          parser.unicodeI = unicodeI;
        continue;

        case S.TRUE:
          if (c==='')  continue; // strange buffers
          if (c==='r') parser.state = S.TRUE2;
          else error(parser, 'Invalid true started with t'+ c);
        continue;

        case S.TRUE2:
          if (c==='')  continue;
          if (c==='u') parser.state = S.TRUE3;
          else error(parser, 'Invalid true started with tr'+ c);
        continue;

        case S.TRUE3:
          if (c==='') continue;
          if(c==='e') {
            emit(parser, "onvalue", true);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid true started with tru'+ c);
        continue;

        case S.FALSE:
          if (c==='')  continue;
          if (c==='a') parser.state = S.FALSE2;
          else error(parser, 'Invalid false started with f'+ c);
        continue;

        case S.FALSE2:
          if (c==='')  continue;
          if (c==='l') parser.state = S.FALSE3;
          else error(parser, 'Invalid false started with fa'+ c);
        continue;

        case S.FALSE3:
          if (c==='')  continue;
          if (c==='s') parser.state = S.FALSE4;
          else error(parser, 'Invalid false started with fal'+ c);
        continue;

        case S.FALSE4:
          if (c==='')  continue;
          if (c==='e') {
            emit(parser, "onvalue", false);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid false started with fals'+ c);
        continue;

        case S.NULL:
          if (c==='')  continue;
          if (c==='u') parser.state = S.NULL2;
          else error(parser, 'Invalid null started with n'+ c);
        continue;

        case S.NULL2:
          if (c==='')  continue;
          if (c==='l') parser.state = S.NULL3;
          else error(parser, 'Invalid null started with nu'+ c);
        continue;

        case S.NULL3:
          if (c==='') continue;
          if(c==='l') {
            emit(parser, "onvalue", null);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid null started with nul'+ c);
        continue;

        case S.NUMBER_DECIMAL_POINT:
          if(c==='.') {
            parser.numberNode += c;
            parser.state       = S.NUMBER_DIGIT;
          } else error(parser, 'Leading zero not followed by .');
        continue;

        case S.NUMBER_DIGIT:
          if('0123456789'.indexOf(c) !== -1) parser.numberNode += c;
          else if (c==='.') {
            if(parser.numberNode.indexOf('.')!==-1)
              error(parser, 'Invalid number has two dots');
            parser.numberNode += c;
          } else if (c==='e' || c==='E') {
            if(parser.numberNode.indexOf('e')!==-1 ||
               parser.numberNode.indexOf('E')!==-1 )
               error(parser, 'Invalid number has two exponential');
            parser.numberNode += c;
          } else if (c==="+" || c==="-") {
            if(!(p==='e' || p==='E'))
              error(parser, 'Invalid symbol in number');
            parser.numberNode += c;
          } else {
            closeNumber(parser);
            i--; // go back one
            parser.state = parser.stack.pop() || S.VALUE;
          }
        continue;

        default:
          error(parser, "Unknown state: " + parser.state);
      }
    }
    if (parser.position >= parser.bufferCheckPosition)
      checkBufferLength(parser);
    return parser;
  }

})(typeof exports === "undefined" ? clarinet = {} : exports);

/**
 * An xhr wrapper that calls a callback whenever some more of the
 * response is available, without waiting for all of it.
 * 
 * This probably needs more development and testing more than most other parts 
 * of Oboe.
 *
 * TODO:
 *    error handling
 *    allow setting of request params
 */
var streamingXhr = (function (XHR) {
   
   /* xhr2 already supports everything that we need so very little abstraction required.\
   *  listenToXhr2 is one of two possible values to use as listenToXhr  
   */
   function listenToXhr2(xhr, progressListener, completeListener) {      
      xhr.onprogress = progressListener;
      xhr.onload = completeListener;
   }

   /* xhr1 supports little so a bit more work is needed 
    * listenToXhr1 is one of two possible values to use as listenToXhr  
    */           
   function listenToXhr1(xhr, progressListener, completeListener){
   
      // unfortunately there is no point polling the responsetext, these bad old browsers rarely make
      // that possible. Instead, we'll just have to wait for the request to be complete, degrading gracefully
      // to standard Ajax.      
   
      // handle the request being complete: 
      xhr.onreadystatechange = function() {     
         if(xhr.readyState == 4 && xhr.status == 200) {
            progressListener();             
            completeListener();
         }                           
      };
   }
      
   function browserSupportsXhr2(){
      return ('onprogress' in new XHR());
   }      
   
   /* listenToXhr will be set to the appropriate function for XHR1 or XHR2 depending on what the browser
    * supports
    * 
    * @function
    * 
    * @param {XmlHttpRequest} xhr
    * @param {Function} progressListener
    * @param {Function} completeListener
    */
   var listenToXhr = browserSupportsXhr2()? listenToXhr2 : listenToXhr1;
      
   /**
    * Fetch something over ajax, calling back as often as new data is available.
    * 
    * None of the parameters are optional.
    * 
    * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
    * @param {String} url
    * @param {String|null} data
    * @param {Function(String nextResponseDrip)} progressCallback
    *    A callback to be called repeatedly as the input comes in.
    *    Will be passed the new string since the last call.
    * @param {Function(String wholeResponse)} doneCallback
    *    A callback to be called when the request is complete.
    *    Will be passed the total response
    * @param {String} data some content to be sent with the request. Only valid
    *                 if method is POST or PUT.
    */
   return function(method, url, data, progressCallback, doneCallback) {
      // TODO: in if in node, use require('http') instead of ajax
      
      var xhr = new XHR(),
          numberOfCharsGivenToCallback = 0;

      xhr.open(method, url, true);
      xhr.send(data);

      function handleProgress() {
         
         var textSoFar = xhr.responseText,
         
             // on older browsers, newText will be the whole response. One better ones,
             // it'll be just the sliver of test we got since last time:         
             newText = textSoFar.substr(numberOfCharsGivenToCallback);

         progressCallback( newText );

         numberOfCharsGivenToCallback = len(textSoFar);
      }
               
      listenToXhr( xhr, handleProgress, doneCallback);
   };

})(XMLHttpRequest);

/**
 * One function is exposed. This function takes a jsonPath spec (as a string) and returns a function to test candidate
 * paths for matches. The candidate paths are arrays of strings representing the path from the root of the parsed json to
 * some node in the json.
 * 
 * Naming convention (like erlang) is to start unused variables with an underscore, to avoid confusion with accidental non-use.
 * This is usually where several functions need to keep the same signature but not all use all of the parameters.
 * 
 * This file is coded in a pure functional style. That is, no function has side effects, every function evaluates to the
 * same value for the same arguments and no variables are reassigned. There is also quite a heavy use of partial completion
 * unfortunately Javascript doesn't have currying so this is done via Function.bind() with null as the scope.
 * 
 */
var jsonPathCompiler = (function () {
   
   /**
    * Expression for:
    *    *
    *    [*]
    *    
    * Normally, this would be compiled into a jsonPath parser by partially completing
    *    previousExpr, capturing, name to give a function which takes just the particularities
    *    of the path being evaluated: pathStack, nodeStack, stackIndex. 
    *    
    *    All other fooExpr functions follow this same signature. My means of partial completion, we end up with a parser
    *    in which each function has a reference to the previous one. Once a function is happy that its part of the jsonPath
    *    matches, it delegates the remaining matching to the next function in the chain.
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */
   function unnamedNodeExpr(previousExpr, capturing, _nameless, pathStack, nodeStack, stackIndex ){
   
      // a '*' doesn't put any extra criteria on the matching, it just defers to the previous expression:
      var previous = previousExpr(pathStack, nodeStack, stackIndex-1);                   
               
      return previous && returnValueForMatch(capturing, previous, nodeStack, stackIndex);
   }
   
   /**
    * Expression for a named path node, expressed as:
    *    foo
    *    ["foo"]
    *    [2]
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found
    */
   function namedNodeExpr(previousExpr, capturing, name, pathStack, nodeStack, stackIndex ) {
                                            
      // in implementation, is like unnamednodeExpr except that we need the name to match.
      // Once name matches, defer to unnamedNodeExpr:                                                                  
      return (pathStack[stackIndex] == name) && unnamedNodeExpr(previousExpr, capturing, name, pathStack, nodeStack, stackIndex );               
   }      
   
   /**
    * Expression for .. (double dot) token              
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */   
   function multipleUnnamedNodesExpr(previousExpr, _neverCaptures, _nameless, pathStack, nodeStack, stackIndex ) {
            
      // past the start, not a match:
      if( stackIndex < -1 ) {
         return false;
      }
   
      return stackIndex == -1 || // -1 is the root 
             previousExpr(pathStack, nodeStack, stackIndex) || 
             multipleUnnamedNodesExpr(previousExpr, undefined, undefined, pathStack, nodeStack, stackIndex-1);         
   }      
   
   /**
    * Expression for $ - matches only the root element of the json
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */   
   function rootExpr(_cantHaveExprsBeforeRoot, capturing, _nameless, _pathStack, nodeStack, stackIndex ){
      return stackIndex == -1 && returnValueForMatch(capturing, true, nodeStack, stackIndex);
   }   
         
   /**
    * Expression for the empty string. As the jsonPath parser generates the path parser, it will eventually
    * run out of tokens and get to the empty string. So, all generated parsers will be wrapped in this function.
    * 
    * Initialises the stackIndex and kicks off the other expressions.   
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */   
   function statementExpr(startingExpr, _neverCaptures, _nameless, pathStack, nodeStack){
   
      // kick off the parsing by passing through to the first expression with the stackIndex set to the
      // top of the stack:
      var exprMatch = startingExpr(pathStack, nodeStack, len(pathStack)-1);
                            
      // Returning exactly true indicates that there has been a match but no node is captured. 
      // By default, the node at the top of the stack gets returned. Just like in css4 selector 
      // spec, if there is no $, the last node in the selector is the one being styled.                      
                      
      return exprMatch === true ? lastOf(nodeStack) : exprMatch;
   }      
              
   /** extraction of some common logic used by expression when they have matched.
    *  If is a capturing node, will return it's item on the nodestack. Otherwise, will return the item
    *  from the nodestack given by the previous expression, or true if none
    */
   function returnValueForMatch(capturing, previousExprEvaluation, nodeStack, stackIndex) {
      return capturing? nodeStack[stackIndex+1] : (previousExprEvaluation || true);
   }

   /** If jsonPath matches the given regular expression pattern, return a partially completed version of expr
    *  which is ready to be used as a jsonPath parser. 
    *  
    *  This function is designed to be partially completed with the pattern and expr, leaving a function
    *  which can be stored in the tokenExprs array. tokenExpr(pattern, expr) is a shorthand for this
    *  partial completion.
    *  
    *  Returns undefined on no match
    *  
    * @param {RegExp} pattern
    * @param {Function} parserGenerator a function which knows how to generate a parser. Either a partial completion of
    *    exprParserGenerator with the expr given, or passthroughParserGenerator.
    * @param {String} jsonPath
    * @param {Function} parserGeneratedSoFar
    * 
    * @param {Function(Function, String)} onSuccess a function to pass the generated parser to if one can be made,
    *    also passes the remaining string from jsonPath that is still to parse
    * 
    * @return {*|undefined}
    */
   function generateTokenParserIfJsonPathMatchesPattern(pattern, parserGenerator, jsonPath, parserGeneratedSoFar, onSuccess) {
      var tokenMatch = pattern.exec(jsonPath);

      if(tokenMatch) {
         var compiledParser = parserGenerator(parserGeneratedSoFar, tokenMatch),
             remaining = jsonPath.substr(len(tokenMatch[0]));                
                               
         return onSuccess(remaining, compiledParser);
      }         
   }
   

   /**
    * For when a token match has been found. Compiles the parser for that token.
    * 
    * When partially completed with an expression function, can be used as the parserGenerator
    * argument to compileTokenToParserIfMatches. The other possible value is passthroughParserGenerator.
    * 
    * @param {Function} expr the expression that parses this token 
    * @param {Function} parserGeneratedSoFar the parser already found
    * @param {Array} tokenMatch the match given by the regex engine when the token was found
    */
   function exprParserGenerator( expr, parserGeneratedSoFar, tokenMatch ) {
      var capturing = !!tokenMatch[1],
          name = tokenMatch[2];      
         
      return partialComplete( expr, parserGeneratedSoFar, capturing, name);      
   }

   /**
    * Similar to exprParserGenerator but does not compile any new parser. Simply returns the parser so far.
    * This is useful for generating the parser when matching the '.' (dot) token. This token is a separator and 
    * because the generated jsonPath parser receives already separated input, there is nothing to do. 
    *  
    * @param {Function} parserGeneratedSoFar
    * @param {Array} _tokenMatch the found regular expression when this token was matched. Since we are not
    *    going to be using any expression function, this is ignored.
    */
   function passthroughParserGenerator(parserGeneratedSoFar, _tokenMatch) {
      return parserGeneratedSoFar;
   }   
              
   /**
    * Generate a function which parses the pattern in the given regex. If matches, returns a parser
    * generated from that token that processes the given expr, otherwise returns null.
    * 
    * @returns {Function(Function parserGeneratedSoFar, Function onSucess)}
    */
   function tokenMatcher(pattern, expr) {
   
      // most tokens generate their parser using exprParserGenerator, but if no expr is given, use 
      // passthroughParserGenerator instead
      var parserGenerator = expr? partialComplete( exprParserGenerator, expr) : passthroughParserGenerator;
       
      return partialComplete( generateTokenParserIfJsonPathMatchesPattern, pattern, parserGenerator );
   }
              
   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, allowing
   // new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)               
   var nameInObjectNotation    = /^(\$?)(\w+)/    
   ,   nameInArrayNotation     = /^(\$?)\["(\w+)"\]/         
   ,   numberInArrayNotation   = /^(\$?)\[(\d+)\]/
   ,   starInObjectNotation    = /^(\$?)\*/
   ,   starInArrayNotation     = /^(\$?)\[\*\]/      
   ,   doubleDot               = /^\.\./
   ,   dot                     = /^\./      
   ,   bang                    = /^(\$?)!/
   ,   emptyString             = /^$/;
     
   // A list of functions which test if a string matches the required patter and, if it does, returns
   // a generated parser for that expression     
   var tokenMatchers = [
       tokenMatcher(nameInObjectNotation   , namedNodeExpr)
   ,   tokenMatcher(nameInArrayNotation    , namedNodeExpr)         
   ,   tokenMatcher(numberInArrayNotation  , namedNodeExpr)
   ,   tokenMatcher(starInObjectNotation   , unnamedNodeExpr)
   ,   tokenMatcher(starInArrayNotation    , unnamedNodeExpr)         
   ,   tokenMatcher(doubleDot              , multipleUnnamedNodesExpr)
   ,   tokenMatcher(dot)                     // dot is just a separator so no expression given, it will not appear 
                                             // in the generated parser    
   ,   tokenMatcher(bang                   , rootExpr)             
   ,   tokenMatcher(emptyString            , statementExpr)
   ];


   /**
    * This value is one possible value for the onSuccess argument of compileTokenToParserIfMatches.
    * When this function is passed, compileTokenToParserIfMatches simply returns the compiledParser that it
    * made, regardless of if there is any remaining jsonPath to be compiled.
    * 
    * The other possible value is compileJsonPathToFunction, which causes it to recursively compile
    * the rest of the string.
    * 
    * @param {String} _remainingJsonPath since this function never recurs, anything left over is ignored.
    * @param {Function} compiledParser
    */
   function returnFoundParser(_remainingJsonPath, compiledParser){ 
      return compiledParser 
   }     
              
   /** 
    * Recursively compile a jsonPath into a function.
    * Each recursive call wraps the parser generated by its inner calls.
    * We parse the jsonPath spec from left to right, generating a parser which parses the found paths from 
    * right to left (or, deepest to shallowest path names).
    * 
    *    (String jsonPath, ((String[], Object[]) -> (Object|Boolean))) -> ((String[], Object[]) -> (Object|Boolean))
    *    
    * or, if we consider Expr = ((String[], Object[]) -> (Object|Boolean)) it can be expressed more simply as:
    * 
    *    (String jsonPath, Expr) -> Expr
    *    
    * In practice, an Expr is any of the functions from tokenExprs[*].expr after being partially completed by 
    * filling in the first three arguments
    * 
    * Note that this function's signature matches the onSuccess callback to compileTokenIfMatches, meaning that
    * compileTokenIfMatches is able to make our recursive call back to here for us.
    */
   function compileJsonPathToFunction( jsonPath, parserGeneratedSoFar ) {

      /**
       * Called when a matching token is found. 
       * 
       * @param {Function} parser the parser that has just been compiled
       * @param {String} remaining the remaining jsonPath that has not been compiled yet
       * 
       * On finding a match, we want to either continue parsing using a recursive call to compileJsonPathToFunction
       * or we want to stop and just return the parser that we've found so far.
       * 
       * We use the jsonPath rather than the remaining to branch on here because it is
       * valid to recur onto an empty string (there's a tokenExpr for that) but it is not
       * valid to recur past that point. 
       */
      var onFind = jsonPath? compileJsonPathToFunction : returnFoundParser;
             
      // to be called by firstMatching if no match could be found. Report the input
      // that could not be tokenized and leave to handlers up-stack to work out what to do.
      function onFail() {
         throw Error('"' + jsonPath + '" could not be tokenised')      
      }
      
      return firstMatching( tokenMatchers, [jsonPath, parserGeneratedSoFar, onFind], onFail );                              
   }

   /**
    * A function that, given a jsonPath string, returns a function that tests against that
    * jsonPath.
    * 
    *    String jsonPath -> (String[] pathStack, Object[] nodeStack) -> Boolean|Object
    *    
    * The returned function returns false if there was no match, the node which was captured (using $)
    * if any expressions in the jsonPath are capturing, or true if there is a match but no capture.
    */
   return function (jsonPath) {        
      try {
         // Kick off the recursive parsing of the jsonPath with a function which always returns true.
         // This means that jsonPaths which don't start with the root specifier ('!') can match at any depth
         // in the tree. So long as they match the part specified, they don't care what the ancestors of the
         // matched part are.         
         return compileJsonPathToFunction(jsonPath, always);
      } catch( e ) {
         throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
      }
   };
   
})();

/**
 * Listen to the given clarinet instance and progressively build up the json based on the callbacks it provides.
 * 
 * Notify the given callbacks when interesting things happen.
 * 
 * @param clarinet
 * @param {Function} nodeFoundCallback
 * @param {Function} pathFoundCallback
 */
function jsonBuilder( clarinet, nodeFoundCallback, pathFoundCallback ) {

   // All of the state of this jsonBuilder is kept isolated in these vars. The remainder of the logic is to maintain
   // this state and notify the callbacks 
    
   var   
         // If we're in an object, curKey will be a string. If in an array, a number. It is the name of the attribute 
         // of curNode that we are currently parsing
         curKey
         // array of nodes from curNode up to the root of the document.
   ,     nodeStack = [] // TODO: use fastlist? https://github.com/isaacs/fast-list
         // array of strings - the path from the root of the dom to the node currently being parsed
   ,     pathStack = []
   
         // the root node. This is not always the same as nodeStack[0], for example after finishing parsing
         // the nodeStack will be empty but this will preserve a reference to the root element after parsing is
         // finished
   ,     root;
   
   /**
    * Manage the state and notifications for when a new node is found.
    * 
    * Valid values are either rootNodeFound or nonRootNodeFound. Will initially be rootNodeFound, 
    * but reassigned to nonRootNodeFound after the first call.
    * 
    * @param {*} foundNode the thing that has been found in the json
    * @function
    */   
   var nodeFound =
      /**
       * This function is one of the possible values of nodeFound, for the sub-case where we have never found
       * a node before
       * 
       * @param {*} foundNode
       */   
      function rootNodeFound( foundNode ) {
    
         // Notify path listeners (eg to '!' or '*') that the root path has been satisfied. This callback is specific
         // to finding the root node because non-root nodes will have their paths notified as their keys are 
         // discovered. Because this is the root, it can't have a key, hence null
         keyDiscovered(undefined, foundNode);                  
         
         // store a reference to the root node (root var declared at top of file)
         root = foundNode;
            
         // nodeStack will be empty, let's give it its first value            
         nodeStack.push(foundNode);
         
         // the next node to be found won't be the root. Reassign this function:
         nodeFound = nonRootNodeFound;      
      };
      
   /**
    * This function is one of the possible values of nodeFound, for the sub-case where we have found
    * a node before
    * 
    * @param {*} foundNode
    */              
   function nonRootNodeFound( foundNode ) {
   
      var parentOfFoundNode = lastOf(nodeStack);
            
      if( isArray(parentOfFoundNode) ) {
         // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there is for objects)
         // so we need to notify of the paths when we find the items: 
         keyDiscovered(curKey, foundNode);
      }
      
      // add the newly found node to its parent
      parentOfFoundNode[curKey] = foundNode;
      pathStack.push(curKey);
   
      nodeStack.push(foundNode);                        
   }   
  
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number} key the key. If we are in an array will be a number, otherwise a string. 
    * @param {String|Number|Object|Array|Null|undefined} [value] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function keyDiscovered(key, value) {
      
      var fullPath = key === undefined? pathStack : pathStack.concat(key);
   
      pathFoundCallback(value, fullPath, nodeStack);
      curKey = key;      
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {
      
      // we need to go up one level in the parsed json's tree
      var completeNode = nodeStack.pop(),
          parentOfCompleteNode = lastOf(nodeStack);
      
      // notify of the found node now that we don't have the curNode on the nodeStack anymore
      // but we still want the
      // pathstack to contain everything for this call: 
      nodeFoundCallback( completeNode, pathStack, nodeStack );      
            
      pathStack.pop();   
         
      if( isArray(parentOfCompleteNode) ) {
         // we're going back to an array, the curKey (the key the next item will be given) needs to match
         // the length of that array:
         curKey = len(parentOfCompleteNode);
      } else {
         // we're in an object, curKey has been used now and we don't know what the next key will 
         // be so mark as unknown:
         curKey = undefined;
      }            
   }      
    
   /* 
    * Finally, assign listeners to clarinet. Mostly these are just wrappers and pass-throughs for the higher
    * level functions above. 
    */     
   clarinet.onopenobject = function (firstKey) {

      nodeFound({});
      
      // It'd be odd but firstKey could be the empty string. This is valid json even though it isn't very nice.
      // so can't do !firstKey here, have to compare against undefined
      if( firstKey !== undefined ) {
      
         // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
         // perminantly onto pathStack yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         keyDiscovered(firstKey);
      }
   };
   
   clarinet.onopenarray = function () {
      nodeFound([]);
      // We haven't discovered a key in the json because we don't know if the array is empty or not. So, set 
      // curKey in case there are contents
      curKey = 0;
   };

   // called by Clarinet when keys are found in objects               
   clarinet.onkey = keyDiscovered;   
               
   clarinet.onvalue = function (value) {
   
      // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
      // can't have descendants.
   
      nodeFound(value);
                        
      curNodeFinished();
   };         
   
   clarinet.onend =
   clarinet.oncloseobject =
   clarinet.onclosearray =       
      curNodeFinished;      
      
   return {
      getRoot: function() {
         return root;
      }
   };      
         
}

var oboe = (function(){
   "use strict";

   /**
    * @constructor 
    * @param {Object} options
    */      
   function OboeParser(options) {
   
      var clarinetParser = clarinet.parser(options),
          nodeFoundListeners     = [],
          pathMatchedListeners   = [];
   
      this._nodeFoundListeners   = nodeFoundListeners;
      this._pathMatchedListeners = pathMatchedListeners;
      
      this._errorListeners       = [];
      this._clarinet             = clarinetParser;               
      this._jsonBuilder          = jsonBuilder(
                                       clarinetParser, 
                                       this._notifyListeners.bind(this, nodeFoundListeners), 
                                       this._notifyListeners.bind(this, pathMatchedListeners)
                                   );
                                               
      clarinetParser.onerror     = function(e) {
                                       this.notifyErrors(e);
                                       
                                       // after parse errors the json is invalid so, we won't bother trying to recover, so just give up
                                       this.close();
                                   }.bind(this);
   }
   
   var oboeProto = OboeParser.prototype;

   /**
    * Ask this oboe instance to fetch the given url. Called via one of the public api methods.
    * 
    * @param {String} url
    * @param {Function (String|Array wholeParsedJson)} doneCallback a callback for when the request is
    *    complete. Will be passed the whole parsed json object (or array). Using this callback, oboe
    *    works in a very similar to normal ajax.
    */      
   oboeProto._fetch = function(method, url, data, doneCallback) {
      var self = this;

      // data must either be a string or null to give to streamingXhr as the request body:
      data = data? (isString(data)? data: JSON.stringify(data)) : null;      

      streamingXhr(
         method,
         url, 
         data,
         self.read.bind(self),
         function() {            
            self.close();
            
            doneCallback && doneCallback(self._jsonBuilder.getRoot());                                          
         });
               
      return self;
   };      

   /**
    * called when there is new text to parse
    * 
    * @param {String} nextDrip
    */
   oboeProto.read = function (nextDrip) {
      if( this.closed ) {
         throw Error('closed');
      }
   
      try {
         this._clarinet.write(nextDrip);
      } catch(e) {
         // we don't have to do anything here because we always assign a .onerror
         // to clarinet which will have already been called by the time this 
         // exception is thrown.                
      }
   };
            
   /**
    * called when the input is done
    * 
    */
   oboeProto.close = function () {
      this.closed = true;
      
      // we won't fire any more events again so forget our listeners:
      this._nodeFoundListeners = [];
      this._pathMatchedListeners = [];
      this._errorListeners = [];
      
      var clarinet = this._clarinet;
      
      // quit listening to clarinet as well. We've done with this stream:
      clarinet.onkey = 
      clarinet.onvalue = 
      clarinet.onopenobject = 
      clarinet.onopenarray = 
      clarinet.onend = 
      clarinet.oncloseobject =                         
      clarinet.onclosearray = 
      clarinet.onerror = undefined;
      
      clarinet.close();            
   };
   
   /**
    * Notify any of the listeners in a list that are interested in the path.
    * 
    * @param {Array} listenerList one of this._nodeFoundListeners or this._pathMatchedListeners
    */  
   oboeProto._notifyListeners = function ( listenerList, node, path, ancestors ) {
      
      var nodeList = ancestors.concat([node]);

      callAll( listenerList, this, node, path, ancestors, nodeList );
   };
   
   /**
    * 
    * @param error
    */
   oboeProto.notifyErrors = function(error) {
      callAll( this._errorListeners, undefined, error );            
   };
   

   /**
    * Create a new function that tests if something found in the json matches the pattern and, if it does,
    * calls the callback.
    * 
    * @param pattern
    * @param callback
    * @param context
    */
   function callIfPatternMatches( pattern, callback, context ) {
   
      context = context || window;   
   
      var test = jsonPathCompiler(pattern);
         
      /**
       * A function which when called with the details of something called in the parsed json, calls the listener
       * if it matches.
       * 
       * Will be called in the context of the current oboe instance from OboeParser#notifyListeners.
       */ 
     return function( node, path, ancestors, nodeList ) {
     
         var foundNode = test( path, nodeList );
        
         // Possible values for foundNode are now:
         //
         //    false: 
         //       we did not match
         //
         //    an object/array/string/number/null: 
         //       that node is the one that matched. Because json can have nulls, this can 
         //       be null.
         //
         //    undefined: like above, but we don't have the node yet. ie, we know there is a
         //       node that matches but we don't know if it is an array, object, string
         //       etc yet so we can't say anything about it. Null isn't used here because
         //       undefinedthat would be indistinguishable from us finding a node with a value of
         //       null.
         //                      
         if( foundNode !== false ) {                                 
           
            // change curNode to foundNode when it stops breaking tests
            try{
               callback.call(context, foundNode, path, ancestors );
            } catch(e) {
               this.notifyErrors(Error('Error thrown by callback ' + e.message));
            }
         }
      }   
   }
   
   /**
    * @returns {*} an identifier that can later be used to de-register this listener
    */
   function pushListener(listenerList, pattern, callback, context) {
         
      listenerList.push( callIfPatternMatches(pattern, callback, context) );            
   }

   /**
    * implementation behind .onPath() and .onFind: add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(listenerList, listenerMap) {
      for( var path in listenerMap ) {
         pushListener(listenerList, path, listenerMap[path]);
      }
   }
   
   /** implementation behind .onPath() and .onFind 
    */
   function on(listenerList, jsonPath, callback, context) {
      if( isString(jsonPath) ) {
         pushListener(listenerList, jsonPath, callback, context);
      } else {
         pushListeners(listenerList, jsonPath);
      }      
   }
   
   /**
    * Add a new json path to the parser, to be called as soon as the path is found, but before we know
    * what value will be in there.
    *
    * @param {String} jsonPath
    *    The jsonPath is a variant of JSONPath patterns and supports these special meanings.
    *    See http://goessner.net/articles/JsonPath/
    *          !                - root json object
    *          .                - path separator
    *          foo              - path node 'foo'
    *          ['foo']          - paFth node 'foo'
    *          [1]              - path node '1' (only for numbers indexes, usually arrays)
    *          *                - wildcard - all objects/properties
    *          ..               - any number of intermediate nodes (non-greedy)
    *          [*]              - equivalent to .*         
    *
    * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
    * 
    * @param {Object} [context] the context ('this') for the callback
    */
   oboeProto.onPath = function (jsonPath, callback, context) {
   
      on(this._pathMatchedListeners, jsonPath, callback, context);
      return this; // chaining
   };

   /**
    * Add a new json path to the parser, which will be called when a value is found at the given path
    *
    * @param {String} jsonPath supports the same syntax as .onPath.
    *
    * @param {Function} callback({Object}foundNode, {String[]}path, {Object[]}ancestors)
    * @param {Object} [context] the context ('this') for the callback
    */
   oboeProto.onFind = function (jsonPath, callback, context) {
   
      on(this._nodeFoundListeners, jsonPath, callback, context);
      return this; // chaining
   };
   
   /**
    * Add a new json path to the parser, which will be called when a value is found at the given path
    *
    * @param {Function} callback
    */
   oboeProto.onError = function (callback) {

      this._errorListeners.push(callback);
      return this; // chaining
   };

   /* finally, let's export factory methods for making a new oboe instance */ 
   var api = {
   
      /**
      * @param {Object} options an object of options. Passed though
      * directly to clarinet.js but oboe.js does not
      * currently provide options.
      * 
      * //TODO .create should probably go away in favour of http method based
      *  factory functions 
      */
      create:function(options){
         return new OboeParser(options);
      }   
   };
   
   
   
   function addHttpMethod(httpMethodName, mayHaveContent) {
         
      var 
          // make name like 'doGet' out of name like 'GET'
          apiMethodName = 'do' + httpMethodName.charAt(0) + httpMethodName.substr(1).toLowerCase(),
          dataArgumentIndex =     mayHaveContent?  1 : -1, // minus one = always undefined - method can't send data
          callbackArgumentIndex = mayHaveContent? 2 : 1,
         
      // put the method on the oboe prototype so that it can be called from oboe instances:
          method = oboeProto[apiMethodName] =
             
            function(firstArg) {

               var url, data, doneCallback;

               if (isString(firstArg)) {
                  // parameters specified as arguments
                  //
                  //  if mayHaveContext, signature is:
                  //     .method( url, content, callback )
                  //  else it is:
                  //     .method( url, callback )            
                  //                                
                  url = firstArg;
                  data = arguments[dataArgumentIndex];
                  doneCallback = arguments[callbackArgumentIndex]
               } else {
                  // parameters specified as options object:
                  url = firstArg.url;
                  data = firstArg.body;
                  doneCallback = firstArg.complete;
               }

               return this._fetch(httpMethodName, url, data, doneCallback);
            };   
      
      // make the above method available without creating an oboe instance first via
      // the public api:
      api[apiMethodName] = function(){
         return method.apply(new OboeParser({}), arguments)         
      };
   }
      
   /* for each of the http methods, add a corresponding method to 
      the public api and Oboe.prototype:
    */
   addHttpMethod('GET');   
   addHttpMethod('DELETE');   
   addHttpMethod('POST', true);   
   addHttpMethod('PUT', true);   
   
   return api;

})();window.oboe = oboe; })(window, Object, Array);