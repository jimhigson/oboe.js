// this file is the concatenation of several js files. See https://github.com/jimhigson/oboe.js/tree/master/src for the unconcatenated source
(function  (window, Object, Array, Error, undefined ) {/*
   Call a single function with the given arguments.
   Basically, a more functional version of the slightly more OO Function#apply for when we don't care about
   the context of the call
 */
function apply(fn, args) {
   return fn.apply(undefined, args);
}

/*
   Call each of a list of functions with the same arguments, where the arguments are given as an
   array. Ignores any return values from the functions.
 */
function applyAll( fns, args ) {

   fns.forEach(function( fn ){
      apply(fn, args);
   });
}

/*
   Call each of a list of functions with the same arguments, where the arguments are given using varargs
   array. Ignores any return values from the functions.
 */
function callAll( fns /*, arg1, arg2, arg3...*/ ) {
   applyAll(fns, toArray(arguments, 1));
}


/** Call a list of functions with the same args until one returns a truthy result.
 *
 *  Returns the first return value that is given that is truthy.
 * 
 *  If none are found, calls onFail and returns whatever that gives, or if no onFail is given,
 *  returns undefined
 * 
 *  @param {Function[]} fns
 *  @param {*} args
 *  @param {Function} [onFail]
 */
function firstMatching( fns, args, onFail ) {

   var maybeMatch;

   for (var i = 0; i < len(fns); i++) {
      
      maybeMatch = apply(fns[i], args);            
            
      if( maybeMatch ) {
         return maybeMatch;
      }      
   }  
   
   return onFail && onFail();
}

/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.    
 */
function partialComplete( fn /* arg1, arg2, arg3 ... */ ) {

   var boundArgs = toArray(arguments, 1);

   return function() {
      var callArgs = boundArgs.concat(toArray(arguments));            
         
      return fn.apply(this, callArgs);
   }; 
}
function lastOf(array) {
   return array[len(array)-1];
}

/**
 * Returns true if the given candidate is of type T
 * 
 * @param {Function} T
 * @param {*} maybeSomething
 */
function isOfType(T, maybeSomething){
   return maybeSomething && maybeSomething.constructor === T;
}

var isArray = partialComplete(isOfType, Array);
var isString = partialComplete(isOfType, String);

function pluck(key, object){
   return object[key];
}

var len = partialComplete(pluck, 'length');

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

/** I don't like saying foo !=== undefined very much because of the double-negative. I find
 *  defined(foo) easier to read.
 *  
 * @param {*} value anything
 */ 
function defined( value ) {
   return value !== undefined;
}

function always(){return true}
(function(){

   /** If no implementation of a method called (methodName) exists fill it in with the
    *  implementation given as (filler).
    */ 
   function fillIn(type, methodName, filler) {
      var proto = type.prototype;
      proto[methodName] = proto[methodName] || filler;
   }

   /**
    * Here we have a minimal set of polyfills needed to let the code run in older browsers such
    * as IE8.
    * 
    * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
    * to make a custom build without this. However, it is as small as it can be to get the job done.
    * 
    */
   
   fillIn(Array, 'every', function(func) {
      for( var i = 0 ; i < len(this) ; i++ ) {      
         if( !func( this[i] ) ) {
            return false;
         }    
      }   
      return true;   
   });   
   
   // Array.forEach has to be a polyfill, clarinet expects it
   // Ignoring all but function argument since not needed, eg can't take a context       
   fillIn(Array, 'forEach', function( func ){
        
      this.every(function(item){
         func(item); return true;
      });        
      
   });         
         
   // A similarly minimalist implementation of .reduce. Array.reduce in Javascript is
   // similar to fold in other languages.
   fillIn(Array, 'reduce', function( func, curValue ){         
   
      // let's use the .forEach we just declared above to implement .filter
      this.forEach(function(item){               
         curValue = func(curValue, item);
      });
      
      return curValue;
   });
   
   // Array.filter has to be a polyfill, clarinet expects it.
   // Ignoring all but function argument since not needed, eg can't take a context
   fillIn(Array, 'filter', function( filterCondition ){         
   
      // let's use the .reduce we declared above to implement .filter:
      return this.reduce(function(matchesSoFar, item){      
         if( filterCondition( item ) ) {
            matchesSoFar.push(item);
         }
         return matchesSoFar;                  
      }, []);
      
   });
   
           
   // allow binding. Minimal version which includes binding of context only, not arguments as well
   fillIn(Function, 'bind', function( context /*, arg1, arg2 ... */ ){
      var f = this;
   
      return function( /* yet more arguments */ ) {                        
         return f.apply(context, arguments);
      }
   });   

})();
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
 *    
 * Fetch something over ajax, calling back as often as new data is available.
 * 
 * None of the parameters are optional.
 * 
 * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
 * @param {String} url
 * @param {String|Object|undefined} data
 * @param {Function} progressCallback in form Function(String nextResponseDrip)
 *    A callback to be called repeatedly as the input comes in.
 *    Will be passed the new string since the last call.
 * @param {Function} doneCallback in form Function(String wholeResponse)
 *    A callback to be called when the request is complete.
 *    Will be passed the total response
 * @param {String} data some content to be sent with the request. Only valid
 *                 if method is POST or PUT.
 */
function streamingXhr(method, url, data, progressCallback, doneCallback) {
   
   /* Given a value from the user to send as the request body, return in a form
      that is suitable to sending over the wire. Which is, either a string or
      null.   
      
      TODO: make a streamingXhrTest to validate this works. Can sinon stub XHRs?
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }   
   
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
         
   var xhr = new XMLHttpRequest(),
   
       browserSupportsXhr2 = ('onprogress' in xhr),    
       listenToXhr = browserSupportsXhr2? listenToXhr2 : listenToXhr1,
       
       numberOfCharsAlreadyGivenToCallback = 0;

   function handleProgress() {
      
      var textSoFar = xhr.responseText;
      
      // give the new text to the callback.
      // on older browsers, the new text will alwasys be the whole response. 
      // On newer/better ones it'll be just the little bit that we got since last time:         
      progressCallback( textSoFar.substr(numberOfCharsAlreadyGivenToCallback) );

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
            
   listenToXhr( xhr, handleProgress, doneCallback);
   
   xhr.open(method, url, true);
   xhr.send(validatedRequestBody(data));   
}

var jsonPathSyntax = (function() {

   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
   // allowing new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)
   
   var regexSource = partialComplete(pluck, 'source');
   
   function r(componentRegexes) {
   
      return RegExp( componentRegexes.map(regexSource).join('') );
   }
   
   function jsonPathClause() {
      
      var strings = toArray(arguments);
      
      strings.unshift(/^/);
      
      return r(strings);
   }
   
   function unquotedArrayNotation(contents) {
      return r([/\[/, contents, /\]/]);
   }
   
   var possiblyCapturing =           /(\$?)/
   ,   namedNode =                   /(\w+)/
   ,   namePlaceholder =             /()/
   ,   namedNodeInArrayNotation =    /\["(\w+)"\]/
   ,   numberedNodeInArrayNotation = unquotedArrayNotation( /(\d+)/ )
   ,   anyNodeInArrayNotation =      unquotedArrayNotation( /\*/ )
   ,   fieldList =                      /{([\w ]*?)}/
   ,   optionalFieldList =           /(?:{([\w ]*?)})?/
    
                  
   ,   jsonPathNamedNodeInObjectNotation     = jsonPathClause(possiblyCapturing, namedNode, optionalFieldList)
                                                                                       //   foo
   
   ,   jsonPathNamedNodeInArrayNotation      = jsonPathClause(possiblyCapturing, namedNodeInArrayNotation, optionalFieldList)
                                                                                       //   ["foo"]
       
   ,   jsonPathNumberedNodeInArrayNotation   = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation, optionalFieldList)
                                                                                       //   [2]
   
   ,   jsonPathStarInObjectNotation          = jsonPathClause(possiblyCapturing, /\*/, optionalFieldList)
                                                                                       //   *
   
   ,   jsonPathStarInArrayNotation           = jsonPathClause(possiblyCapturing, anyNodeInArrayNotation, optionalFieldList)
                                                                                       //   [*]
   
   ,   jsonPathPureDuckTyping                = jsonPathClause(possiblyCapturing, namePlaceholder, fieldList)
   
   ,   jsonPathDoubleDot                     = jsonPathClause(/\.\./)                  //   ..
   
   ,   jsonPathDot                           = jsonPathClause(/\./)                    //   .
   
   ,   jsonPathBang                          = jsonPathClause(possiblyCapturing, /!/)  //   !
   
   ,   emptyString                           = jsonPathClause(/$/)                     //   nada!
   
   ,   
   //  see jsonPathNodeDescription below
       nodeDescriptors = [
            jsonPathNamedNodeInObjectNotation
         ,  jsonPathNamedNodeInArrayNotation
         ,  jsonPathNumberedNodeInArrayNotation
         ,  jsonPathStarInObjectNotation
         ,  jsonPathStarInArrayNotation
         ,  jsonPathPureDuckTyping 
         ].map(regexDescriptor)
   ;      

   /** allows exporting of a regular expression under a generified function interface
    * @param regex
    */
   function regexDescriptor(regex) {
      return function(candidate){
         return regex.exec(candidate);
      }
   }

   /** export several regular expressions under a single function, presenting the same interface
    *  as regexDescriptor above.
    */
   function jsonPathNodeDescription( candidate ) {   
      return firstMatching(nodeDescriptors, [candidate]);
   }
   
   /* we export only a single function. When called, this function injects into a scope the
      descriptor functions from this scope which we want to make available elsewhere. 
    */
   return function (fn){      
      return fn( 
          jsonPathNodeDescription,
          regexDescriptor(jsonPathDoubleDot),
          regexDescriptor(jsonPathDot),
          regexDescriptor(jsonPathBang),
          regexDescriptor(emptyString) );
   }; 

}());
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
 * 
 *   String jsonPath -> (String[] pathStack, Object[] nodeStack) -> Boolean|Object
 *    
 * The returned function returns false if there was no match, the node which was captured (using $)
 * if any expressions in the jsonPath are capturing, or true if there is a match but no capture.
 */  
// the call to jsonPathSyntax injects the syntaxes that are needed inside the compiler
var jsonPathCompiler = jsonPathSyntax(function (pathNodeSyntax, doubleDotSyntax, dotSyntax, bangSyntax, emptySyntax ) {

   var CAPTURING_INDEX = 1;
   var NAME_INDEX = 2;
   var FIELD_LIST_INDEX = 3;
     
   /**
    * Expression for a named path node, expressed as:
    *    foo
    *    ["foo"]
    *    [2]
    *    
    *    All other fooExpr functions follow this same signature. My means of function factories, we end up with a parser
    *    in which each function has a reference to the previous one. Once a function is happy that its part of the jsonPath
    *    matches, it delegates the remaining matching to the next function in the chain.       
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */
   function matchAgainstName(previousExpr, detection ) {

      // extract meaning from the detection      
      var name = detection[NAME_INDEX];

      if (!name) {
         return previousExpr; // don't wrap at all, return given expr as-is
      }
      
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */
      return function (pathStack, nodeStack, stackIndex) {
         // in implementation, is like unnamednodeExpr except that we need the name to match.
         // Once name matches, defer to unnamedNodeExpr:                                                                  
         return (pathStack[stackIndex] == name) && previousExpr(pathStack, nodeStack, stackIndex);
      };      
   }

   /**
    * Expression for a duck-typed node, expressed like:
    * 
    *    {spin, taste, colour}
    *    .particle{spin, taste, colour}
    *    *{spin, taste, colour}
    * 
    * @param {Function} previousExpr
    * @param {Array} detection
    */
   function matchAgainstDuckType(previousExpr, detection) {

      var fieldListStr = detection[FIELD_LIST_INDEX];

      if (!fieldListStr) {
         return previousExpr; // don't wrap at all, return given expr as-is
      }

      var requiredFields = fieldListStr.split(/\W+/);

      return function (pathStack, nodeStack, stackIndex) {

         var
             targetNode = nodeStack[stackIndex + 1],

             targetNodeHasRequiredFields =
                 (targetNode instanceof Object) &&
                 requiredFields.every(function (field) {

                    return (field in targetNode);

                 });

         return targetNodeHasRequiredFields && previousExpr(pathStack, nodeStack, stackIndex);
      }
   }

   /**
    * Expression for $
    * 
    * @param previousExpr
    * @param capturing
    */
   function capture( previousExpr, detection ) {

      // extract meaning from the detection      
      var capturing = !!detection[CAPTURING_INDEX];

      if (!capturing) {         
         return previousExpr; // don't wrap at all, return given expr as-is
      }
      
      return function (pathStack, nodeStack, stackIndex) {
         return previousExpr(pathStack, nodeStack, stackIndex) && (nodeStack[stackIndex + 1]);
      }
      
   }            
   
   
   /**
    * Moves onto the next item on the stack. Doesn't map neatly onto any particular language feature but
    * is a requirement for many. Eg, for jsnPath ".foo" we need consume1(exprWithNameSpecified)
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */
   function consume1(previousExpr) {
   
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */   
      return function( pathStack, nodeStack, stackIndex ){
                 
         return previousExpr(pathStack, nodeStack, stackIndex-1);
      };                                                                                                            
   }   
   
   /**
    * Expression for the .. (double dot) token. Consumes zero or more tokens from the input, the fewest that
    * are required for the previousExpr to match.
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */   
   function consumeMany(previousExpr) {
            
      var 
            // jsonPath .. is equivalent to !.. so if .. reaches the root
            // the match has suceeded.
          terminalCaseWhenArrivingAtRoot = rootExpr(),
          terminalCaseWhenPreviousExpressionIsSatisfied = previousExpr, 
          recursiveCase = consume1(consumeManyPartiallyCompleted),
          
          cases = [ terminalCaseWhenArrivingAtRoot, 
                    terminalCaseWhenPreviousExpressionIsSatisfied, 
                    recursiveCase
                  ];                        
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */            
      function consumeManyPartiallyCompleted(pathStack, nodeStack, stackIndex) {
      
         if( stackIndex < -1 ) {
            // have gone past the start, not a match:         
            return false;
         }      
                                                        
         return firstMatching(cases, arguments);
      }
      
      return consumeManyPartiallyCompleted;
   }      
   
   /**
    * Expression for $ - matches only the root element of the json
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */   
   function rootExpr() {
   
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */   
      return function(_pathStack, nodeStack, stackIndex ){
         return stackIndex == -1;
      };
   }   
         
   /**
    * Expression for the empty string. As the jsonPath parser generates the path parser, it will eventually
    * run out of tokens and get to the empty string. So, all generated parsers will be wrapped in this function.
    * 
    * Initialises the stackIndex and kicks off the other expressions.   
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */   
   function statementExpr(startingExpr) {
   
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */   
      return function(pathStack, nodeStack) {
   
         // kick off the parsing by passing through to the first expression with the stackIndex set to the
         // top of the stack:
         var exprMatch = startingExpr(pathStack, nodeStack, len(pathStack)-1);
                               
         // Returning exactly true indicates that there has been a match but no node is captured. 
         // By default, the node at the top of the stack gets returned. Just like in css4 selector 
         // spec, if there is no $, the last node in the selector is the one being styled.                      
                         
         return exprMatch === true ? lastOf(nodeStack) : exprMatch;
      };
   }      
                          
   /**
    * For when a token match has been found. Compiles the parser for that token.
    * If called with a zero-length list of 
    * 
    * When partially completed with an expression function, can be used as the parserGenerator
    * argument to compileTokenToParserIfMatches. The other possible value is passthroughParserGenerator.
    * 
    * @param {Function} exprs zero or more expressions that parses this token 
    * @param {Function} parserGeneratedSoFar the parser already found
    * @param {Array} detection the match given by the regex engine when the feature was found
    */
   function expressionsReader( exprs, parserGeneratedSoFar, detection ) {
                               
      // note that if exprs is zero-length, reduce (like fold) will pass back 
      // parserGeneratedSoFar without any special cases required                   
      return exprs.reduce(function( parserGeneratedSoFar, expr ){

         return expr(parserGeneratedSoFar, detection);      
               
      }, parserGeneratedSoFar);         
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
    * @param {Function} detector a function which can examine a jsonPath and returns an object describing the match
    *                   if there is a match for our particular feature at the start of the jsonPath.
    * @param {Function[]} exprs
    * 
    * @param {String} jsonPath
    * 
    * @param {Function} parserGeneratedSoFar
    * 
    * @param {Function(Function, String)} onSuccess a function to pass the generated parser to if one can be made,
    *    also passes the remaining string from jsonPath that is still to parse
    * 
    * @return {*|undefined}
    */
   function generateClauseReaderIfJsonPathMatchesRegex(detector, exprs, jsonPath, parserGeneratedSoFar, onSuccess) {
      var detected = detector(jsonPath);

      if(detected) {
         var compiledParser = expressionsReader(exprs, parserGeneratedSoFar, detected),
         
             unparsedJsonPath = jsonPath.substr(len(detected[0]));                
                               
         return onSuccess(unparsedJsonPath, compiledParser);
      }         
   }
                 
   /**
    * Generate a function which parses the pattern in the given regex. If matches, returns a parser
    * generated from that token that processes the given expr, otherwise returns no value (undefined).
    * 
    * @returns {Function(Function parserGeneratedSoFar, Function onSucess)}
    */
   function clauseMatcher(detector, exprs) {
        
      return partialComplete( generateClauseReaderIfJsonPathMatchesRegex, detector, exprs );
   }
                   
   // A list of functions which test if a string matches the required patter and, if it does, returns
   // a generated parser for that expression     
   var clauseMatchers = [

       clauseMatcher(pathNodeSyntax   , [consume1, matchAgainstName, matchAgainstDuckType, capture])        
   ,   clauseMatcher(doubleDotSyntax  , [consumeMany])
       
       // dot is a separator only (like whitespace in other languages) but rather than special case
       // it, the expressions can be an empty array.
   ,   clauseMatcher(dotSyntax        , [] )  
                                                 
   ,   clauseMatcher(bangSyntax       , [rootExpr, capture])             
   ,   clauseMatcher(emptySyntax      , [statementExpr])
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
      
      return firstMatching( clauseMatchers, [jsonPath, parserGeneratedSoFar, onFind], onFail );                              
   }

   // all the above is now captured in the closure of this immediately-called function. let's
   // return the function we wish to expose globally:
   return function(jsonPath){
        
      try {
         // Kick off the recursive parsing of the jsonPath with a function which always returns true.
         // This means that jsonPaths which don't start with the root specifier ('!') can match at any depth
         // in the tree. So long as they match the part specified, they don't care what the ancestors of the
         // matched part are.         
         return compileJsonPathToFunction(jsonPath, always);
      } catch( e ) {
         throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
      }
   }

});

/**
 * Listen to the given clarinet instance and progressively builds and stores the json based on the callbacks it provides.
 * 
 * Notify on the given event bus when interesting things happen.
 * 
 * Returns a function which gives access to the content built up so far
 * 
 * @param clarinet our source of low-level events
 * @param {Function} notify a handle on an event bus to fire higher level events on when a new node 
 *    or path is found  
 */
function incrementalParsedContent( clarinet, notify ) {

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
         // discovered. Because this is the root, it can't have a key, hence undefined
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
      
      var fullPath = defined(key)? pathStack.concat(key) : pathStack;

      // if we have the key but no known value yet, at least put that key in the output 
      // but against no defined value:
      if( key && !defined(value) ) {
         lastOf(nodeStack)[key] = undefined;
      }   
      
      notify(PATH_FOUND_EVENT, fullPath, nodeStack.concat([value]) );
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
      notify(NODE_FOUND_EVENT, pathStack, nodeStack.concat([completeNode]) );      
            
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
      if( defined(firstKey) ) {
      
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
      
   /* finally, return a function to get the root of the json (or undefined if not yet found) */      
   return function() {
      return root;
   }           
}
var NODE_FOUND_EVENT = 'n',
    PATH_FOUND_EVENT = 'p',
    ERROR_EVENT = 'e';

function pubSub(){

   var listeners = {n:[], p:[], e:[]};
                             
   return {
      notify:function ( eventId /* arguments... */ ) {
               
         applyAll( listeners[eventId], toArray(arguments,1) );
      },
      on:function( eventId, fn ) {      
         listeners[eventId].push(fn);
         return this; // chaining                                         
      }            
   };
}
/* 
   The API that is given out when a new Oboe instance is created.
    
   This file handles the peculiarities of being able to add listeners in a couple of different syntaxes
   and returns the object that exposes a small number of methods.
 */

function instanceApi(controller, eventBus, incrementalParsedContent){
   
   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         controller.addNewCallback(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addNodeOrPathListener( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         controller.addNewCallback(eventId, jsonPathOrListenerMap, callback.bind(callbackContext));
      } else {
         pushListeners(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }         

   return {      
      onPath: partialComplete(addNodeOrPathListener, PATH_FOUND_EVENT),
      
      onNode: partialComplete(addNodeOrPathListener, NODE_FOUND_EVENT),
      
      onError: partialComplete(eventBus.on, ERROR_EVENT),
      
      root: incrementalParsedContent
   };   

}


function oboeController(eventBus, clarinetParser, parsedContentSoFar) {
   
   clarinetParser.onerror =  
       function(e) {          
          eventBus.notify(ERROR_EVENT, e);
            
          // the json is invalid, give up and close the parser to prevent getting any more:
          clarinetParser.close();
       };
                              
   function start(httpMethodName, url, httpRequestBody, doneCallback) {                                                                                                                                                    
      streamingXhr(
         httpMethodName,
         url, 
         httpRequestBody,
         function (nextDrip) {
            // callback for when a bit more data arrives from the streaming XHR         
             
            try {
               clarinetParser.write(nextDrip);
            } catch(e) {
               // we don't have to do anything here because we always assign a .onerror
               // to clarinet which will have already been called by the time this 
               // exception is thrown.                
            }
         },
         function() {
            // callback for when the response is complete                     
            clarinetParser.close();
            
            doneCallback && doneCallback(parsedContentSoFar());
         });
   }
                 
   /**
    *  
    */
   function addNewCallback( eventId, pattern, callback ) {
   
      var test = jsonPathCompiler( pattern );
   
      // Add a new listener to the eventBus.
      // This listener first checks that he pattern matches then if it does, 
      // passes it onto the callback. 
      eventBus.on( eventId, function(path, nodeList){ 
      
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
         //       it would be indistinguishable from us finding a node with a value of
         //       null.
         //                      
         if( foundNode !== false ) {                                 
           
            // change curNode to foundNode when it stops breaking tests
            try{
               callback(foundNode, path, nodeList );
            } catch(e) {
               eventBus.notify(ERROR_EVENT, Error('Error thrown by callback: ' + e.message));
            }
         }
      });   
   }   
       
   /* the controller only needs to expose two methods: */                                          
   return { 
      addNewCallback : addNewCallback, 
      start          : start
   };                                                         
}
(function(){

   /* export public API */
   window.oboe = {
      doGet:   apiMethod('GET'),
      doDelete:apiMethod('DELETE'),
      doPost:  apiMethod('POST', true),
      doPut:   apiMethod('PUT', true)
   };
   
   function apiMethod(httpMethodName, mayHaveRequestBody) {
         
      var 
          // make name like 'doGet' out of name like 'GET'
          bodyArgumentIndex =     mayHaveRequestBody?  1 : -1, // minus one = always undefined - method can't send data
          callbackArgumentIndex = mayHaveRequestBody? 2 : 1;           
      

      return function(firstArg){
      
         // wire everything up:
         var eventBus = pubSub(),
             clarinetParser = clarinet.parser(),
             parsedContentSoFar = incrementalParsedContent(clarinetParser, eventBus.notify),             
             controller = oboeController( eventBus, clarinetParser, parsedContentSoFar),      
            
         // now work out what the arguments mean:   
             url, body, doneCallback;

         if (isString(firstArg)) {
            // parameters specified as arguments
            //
            //  if mayHaveContext, signature is:
            //     .method( url, content, callback )
            //  else it is:
            //     .method( url, callback )            
            //                                
            url = firstArg;
            body = arguments[bodyArgumentIndex];
            doneCallback = arguments[callbackArgumentIndex]
         } else {
            // parameters specified as options object:
            url = firstArg.url;
            body = firstArg.body;
            doneCallback = firstArg.complete;
         }

         // start the request:
         controller.start(httpMethodName, url, body, doneCallback);         
                  
         // return an api to control this oboe instance                   
         return instanceApi(controller, eventBus, parsedContentSoFar)           
      };
   }   

})();})(window, Object, Array, Error);