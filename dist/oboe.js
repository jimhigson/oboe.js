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


function varArgs(fn){

   // nb: can't use len() here because it is defined using partialComplete which is defined using varargs.
   // While recursive definition is possible in js, it is a stateful language and at this point there is no way
   // that len can be defined
   var numberOfFixedArguments = fn.length -1;
         
   return function(){
   
      var numberOfVaraibleArguments = arguments.length - numberOfFixedArguments,
      
          argumentsToFunction = Array.prototype.slice.call(arguments);
          
      // remove the end of the array and push it back onto itself as a sub-array (sometimes to implement a functional
      // machine we have to sit on top of a *very* non-functional one)
      argumentsToFunction.push( argumentsToFunction.splice(numberOfFixedArguments, numberOfVaraibleArguments) );   
      
      return fn.apply( this, argumentsToFunction );
   }       
}

/**
 *  Call a list of functions with the same args until one returns a truthy result. Equivalent to || in javascript
 *  
 *  So:
 *       lazyUnion([f1,f2,f3 ... fn])( p1, p2 ... pn )
 *       
 *  Is equivalent to: 
 *       apply(f1, [p1, p2 ... pn]) || apply(f2, [p1, p2 ... pn]) || apply(f3, [p1, p2 ... pn]) ... apply(fn, [p1, p2 ... pn])  
 *   
 *  @returns the first return value that is given that is truthy.
 */
var lazyUnion = varArgs(function(fns) {

   return varArgs(function(params){

      var maybeValue;

      for (var i = 0; i < len(fns); i++) {

         maybeValue = apply(fns[i], params);

         if( maybeValue ) {
            return maybeValue;
         }
      }
   });
});

/**
 * Call a list of functions, so long as they continue to return a truthy result. Returns the last result, or the
 * first non-truthy one.
 * 
 */
function lazyIntersection(fn1, fn2) {

   return function (param) {
                                                              
      return fn1(param) && fn2(param);
   };   
}

/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.
 */
var partialComplete = varArgs(function( fn, boundArgs ) {

   return varArgs(function( callArgs ) {
            
      return fn.apply(this, boundArgs.concat(callArgs));
   }); 
});


var compose = varArgs(function(fns) {

   var functionList = asList(fns);
   
   function next(valueSoFar, curFn) {  
      return curFn(valueSoFar);   
   }
   
   return function(startValue){
     
      return foldR(next, startValue, functionList);
   }
});

/**
 * Returns true if the given candidate is of type T
 * 
 * @param {Function} T
 * @param {*} maybeSomething
 */
function isOfType(T, maybeSomething){
   return maybeSomething && maybeSomething.constructor === T;
}
function pluck(key, object){
   return object[key];
}

var attr = partialComplete(partialComplete, pluck),
    len = attr('length'),    
    isString = partialComplete(isOfType, String);

/** I don't like saying foo !=== undefined very much because of the double-negative. I find
 *  defined(foo) easier to read.
 *  
 * @param {*} value anything
 */ 
function defined( value ) {
   return value !== undefined;
}

function always(){return true}

/**
 * Returns true if object o has a key named like every property in the properties array.
 * Will give false if any are missing, or if o is not an object.
 * 
 * @param {Object} o
 * @param {String[]} fieldList
 */
function hasAllProperties(fieldList, o) {

   return      (o instanceof Object) 
            &&
               listEvery(function (field) {         
                  return (field in o);         
               }, fieldList);
}

function cons(x, xs) {
   return [x, xs];
}

var head = attr(0);
var tail = attr(1);
var emptyList = null;

function reverseList(list){

   // js re-implementation of 3rd solution from:
   //    http://www.haskell.org/haskellwiki/99_questions/Solutions/5
   function reverseInner( list, reversed ) {
      if( !list ) {
         return reversed;
      }
      
      return reverseInner(tail(list), cons(head(list), reversed))
   }

   return reverseInner(list, emptyList);
}

function listAsArray(list){
   // could be done as a reduce

   if( !list ) {
      return [];
   } else {
      var array = listAsArray(tail(list));
      array.unshift(head(list)); 
      return array;
   }
}

function map(fn, list) {

   if( !list ) {
      return emptyList;
   } else {
      return cons(fn(head(list)), map(fn,tail(list)));
   }
}

/**
   @pram {Function} fn     (rightEval, curVal) -> result 
 */
function foldR(fn, startValue, list) {
      
   return list 
            ?  fn(foldR(fn, startValue, tail(list)), head(list))
            : startValue;
}

function listEvery(fn, list) {
   
   return !list || 
          fn(head(list)) && listEvery(fn, tail(list));
}

function asList(array){

   var l = emptyList;

   for( var i = array.length ; i--; ) {
      l = cons(array[i], l);      
   }

   return l;   
}

var list = varArgs(asList);

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

  
   // Array.forEach has to be a polyfill, clarinet expects it
   // Ignoring all but function argument since not needed, eg can't take a context
   //       Clarinet needs this          
   fillIn(Array, 'forEach', function( func ){
        
      for( var i = 0 ; i < len(this) ; i++ ) {      
         func(this[i]);    
      }              
   });         
         
  
   // Array.filter has to be a polyfill, clarinet expects it.
   // Ignoring all but function argument since not needed, eg can't take a context
   //       Clarinet needs this
   fillIn(Array, 'filter', function( filterCondition ){         
   
      var passes = [];
   
      // let's use the .forEach we declared above to implement .filter:
      this.forEach(function(item){      
         if( filterCondition( item ) ) {
            passes.push(item);
         }                  
      });
      
      return passes;
      
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
 * Fetch something over ajax, calling back as often as new data is available.
 * 
 * None of the parameters are optional.
 * 
 * @param {Function} notify a function to pass events to when something happens
 */
function streamingXhr(notify) {
        
   var 
      xhr = new XMLHttpRequest(),
   
      listenToXhr = 'onprogress' in xhr? listenToXhr2 : listenToXhr1,
       
      numberOfCharsAlreadyGivenToCallback = 0;   
      
   /** Given a value from the user to send as the request body, return in a form
    *  that is suitable to sending over the wire. Returns either a string, or null.        
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }      
   
   /** xhr2 already supports everything that we need so just a bit of abstraction required.
    *  listenToXhr2 is one of two possible values to use as listenToXhr  
    */
   function listenToXhr2(xhr) {         
      xhr.onprogress = handleInput;
      xhr.onload = handleDone;
   }
   
   /** xhr1 is quite primative so a bit more work is needed to connect to it 
    *  listenToXhr1 is one of two possible values to use as listenToXhr  
    */           
   function listenToXhr1(xhr){
   
      // unfortunately there is no point polling the responsetext, these bad old browsers 
      // don't make the partial text accessible - it is undefined until the request finishes 
      // and then it is everything.
      // Instead, we just have to wait for the request to be complete and degrade gracefully
      // to non-streaming Ajax.      
      xhr.onreadystatechange = function() {     
         if(xhr.readyState == 4 && xhr.status == 200) {
            handleDone();            
         }                            
      };
   }   
   
   /** 
    * Handle input from the underlying xhr: either a state change,
    * the progress event or the request being complete.
    */
   function handleInput() {
                        
      var textSoFar = xhr.responseText,
          newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);
      
      // give the new text to the callback.
      // on older browsers, the new text will alwasys be the whole response. 
      // On newer/better ones it'll be just the little bit that we got since last time.
      // On browsers which send progress events for the last bit of the response, if we
      // are responding to the laod event it is now empty         
      newText && notify( HTTP_PROGRESS_EVENT, newText ); 

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
   
   function handleDone() {
      // In Chrome 29 (not 28) no onprogress is fired when a response is complete before the
      // onload. We need to always do handleInput in case we get the load but have
      // not had a final progress event..   
      handleInput(); 
      
      notify( HTTP_DONE_EVENT );
   }
                      
   return {
   
     /**
      * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
      * @param {String} url
      * @param {String} data some content to be sent with the request. Only valid
      *                 if method is POST or PUT.
      */                                         
      req: function(method, url, data){                     
         listenToXhr( xhr );
         
         xhr.open(method, url, true);
         xhr.send(validatedRequestBody(data));         
      },
      
      abort: function() {
         // NB: can't do xhr.abort.bind(xhr) becaues IE doesn't allow binding of
         // XHR methods, even if Function.prototype.bind is polyfilled. I think they
         // are some kind of weird native non-js function or something.
         xhr.abort();
      }
   };   
}

var jsonPathSyntax = (function() {

   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
   // allowing new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)


   /** Allows exporting of a regular expression as a generified function interface by encapsulating just the exec
    *  function
    *  
    *  Could also be expressed as:
    *    Function.prototype.bind.bind(RegExp.prototype.exec),
    *    
    *  But that's far too confusing! (and not even smaller once minified and gzipped)
    *  
    *  @type {Function}
    *  
    *  @param {RegExp} regex the regular expression to export
    *  
    *  @returns a function which is equivalent to calling exec on that regular expression
    */
   var regexDescriptor =   function regexDescriptor(regex) {
                              return regex.exec.bind(regex);
                           }, 
  
       jsonPathClause =    varArgs(function( componentRegexes ) {
           
                              componentRegexes.unshift(/^/);
                           
                              return regexDescriptor(RegExp(componentRegexes.map(attr('source')).join('')));
                           }),

       possiblyCapturing =           /(\$?)/
   ,   namedNode =                   /(\w+|\*)/
   ,   namePlaceholder =             /()/
   ,   nodeInArrayNotation =         /\["(\w+)"\]/
   ,   numberedNodeInArrayNotation = /\[(\d+|\*)\]/
   ,   fieldList =                      /{([\w ]*?)}/
   ,   optionalFieldList =           /(?:{([\w ]*?)})?/
    
                  
   ,   jsonPathNamedNodeInObjectNotation     = jsonPathClause(possiblyCapturing, namedNode, optionalFieldList)
                                                                                       //   foo or *
   
   ,   jsonPathNamedNodeInArrayNotation      = jsonPathClause(possiblyCapturing, nodeInArrayNotation, optionalFieldList)
                                                                                       //   ["foo"]  
       
   ,   jsonPathNumberedNodeInArrayNotation   = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation, optionalFieldList)
                                                                                       //   [2] or [*]
      
   ,   jsonPathPureDuckTyping                = jsonPathClause(possiblyCapturing, namePlaceholder, fieldList)
   
   ,   jsonPathDoubleDot                     = jsonPathClause(/\.\./)                  //   ..
   
   ,   jsonPathDot                           = jsonPathClause(/\./)                    //   .
   
   ,   jsonPathBang                          = jsonPathClause(possiblyCapturing, /!/)  //   !
   
   ,   emptyString                           = jsonPathClause(/$/)                     //   nada!
   
   ;
   
  
   /* we export only a single function. When called, this function injects into a scope the
      descriptor functions from this scope which we want to make available elsewhere. 
    */
   return function (fn){      
      return fn( 
         lazyUnion(
            jsonPathNamedNodeInObjectNotation
         ,  jsonPathNamedNodeInArrayNotation
         ,  jsonPathNumberedNodeInArrayNotation
         ,  jsonPathPureDuckTyping 
         )
      ,  jsonPathDoubleDot
      ,  jsonPathDot
      ,  jsonPathBang
      ,  emptyString 
      );
   }; 

}());
var keyOf = attr('key');
var nodeOf = attr('node');


/**
 * A special value to use in the path list to represent the path 'to' a root object (which doesn't really
 * have any path). This prevents the need for special-casing detection of the root object and allows it
 * to be treated like any other object.
 * 
 * This is kept as an object to take advantage that in an OO language, objects are guaranteed to be
 * distinct, therefore no other object can possibly clash with this one.
 */
var ROOT_PATH = {r:1}; 


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
function incrementalContentBuilder( clarinet, notify ) {
   
   var            
         // array of nodes from curNode up to the root of the document.
         // the root is at the far end of the list, the current node is at the close end (the head) 
         ascent
      
   ,     rootNode;



   function checkForMissedArrayKey(ascent, newLeafNode) {
   
      // for arrays we aren't pre-warned of the coming paths (there is no call to onkey like there 
      // is for objects)
      // so we need to notify of the paths when we find the items:

      var parentNode = nodeOf(head(ascent));
      
      if (isOfType(Array, parentNode)) {

         pathFound(len(parentNode), newLeafNode);
      }
   }

   /**
    * Manage the state and notifications for when a new node is found.
    *  
    * @param {*} newLeafNode the thing that has been found in the json
    * @function
    */                 
   function nodeFound( newLeafNode ) {
      
      if( !ascent ) {
           
         // we discovered the root node, it has a special path
         rootNode = newLeafNode;
         pathFound(ROOT_PATH, newLeafNode);
         
         return;            
      } 
      
      checkForMissedArrayKey(ascent, newLeafNode);
      
      // the node is a non-root node
      var branches = tail(ascent),           
          parentBranch = head(branches),   
          oldLeaf = head(ascent),
          newLeaf = mapping(keyOf(oldLeaf), newLeafNode);      
   
      appendBuiltContent( parentBranch, newLeaf );
                                                                                                         
      ascent = cons(newLeaf, branches);                                                                          
   }


   /**
    * Add a new value to the top-level object which has been already output   
    */
   function appendBuiltContent( branch, leaf ){
      
      nodeOf(branch)[keyOf(leaf)] = nodeOf(leaf);
   }

   /**
    * Get a new key->node mapping
    * 
    * @param {String|Number} key
    * @param {Object|Array|String|Number|null} node a value found in the json
    */
   function mapping(key, node) {
      return {key:key, node:node};
   }
     
   /**
    * For when we find a new key in the json.
    * 
    * @param {String|Number|Object} key the key. If we are in an array will be a number, otherwise a string. May
    *    take the special value ROOT_PATH if the root node has just been found
    * @param {String|Number|Object|Array|Null|undefined} [maybeNode] usually this won't be known so can be undefined.
    *    can't use null because null is a valid value in some json
    **/  
   function pathFound(key, maybeNode) {
      
      var newLeaf = mapping(key, maybeNode);
      
      if( ascent ) { // if not root
      
         // if we have the key but (unless adding to an array) no known value yet, at least put 
         // that key in the output but against no defined value:      
         appendBuiltContent( head(ascent), newLeaf );
      }
   
      ascent = cons(newLeaf, ascent);
     
      notify(TYPE_PATH, ascent);
 
   }


   /**
    * manages the state and notifications for when the current node has ended
    */
   function curNodeFinished( ) {

      notify(TYPE_NODE, ascent);
                          
      // pop the complete node and its path off the lists:                                    
      ascent = tail(ascent);
   }      
    
   /* 
    * Assign listeners to clarinet.
    */     
    
   clarinet.onopenobject = function (firstKey) {

      nodeFound({});
      
      // It'd be odd but firstKey could be the empty string. This is valid json even though it isn't very nice.
      // so can't do !firstKey here, have to compare against undefined
      if( defined(firstKey) ) {
      
         // We know the first key of the newly parsed object. Notify that path has been found but don't put firstKey
         // perminantly onto pathList yet because we haven't identified what is at that key yet. Give null as the
         // value because we haven't seen that far into the json yet          
         pathFound(firstKey);
      }
   };
   
   clarinet.onopenarray = function () {
      nodeFound([]);
   };

   // called by Clarinet when keys are found in objects               
   clarinet.onkey = pathFound;   
               
   clarinet.onvalue = function (value) {
   
      // Called for strings, numbers, boolean, null etc. These nodes are declared found and finished at once since they 
      // can't have descendants.
   
      nodeFound(value);
                        
      curNodeFinished();
   };         
   
   clarinet.oncloseobject =
   clarinet.onclosearray =       
      curNodeFinished;      
      
   /* finally, return a function to get the root of the json (or undefined if not yet found) */      
   return function() {
      return rootNode;
   }           
}
/**
 * One function is exposed. This function takes a jsonPath spec (as a string) and returns a function to test candidate
 * paths for matches. The candidate paths are arrays of strings representing the path from the root of the parsed json to
 * some node in the json.
 * 
 * Naming convention (like erlang) is to start unused variables with an underscore, to avoid confusion with accidental non-use.
 * This is usually where several functions need to keep the same signature but not all use all of the parameters.
 * 
 * This file is coded in a pure functional style. That is, no function has side effects, every function evaluates to the
 * same value for the same arguments and no variables are reassigned.
 * 
 *   String jsonPath -> (List ascent) -> Boolean|Object
 *    
 * The returned function returns false if there was no match, the node which was captured (using $)
 * if any expressions in the jsonPath are capturing, or true if there is a match but no capture.
 */  
// the call to jsonPathSyntax injects the syntaxes that are needed inside the compiler
var jsonPathCompiler = jsonPathSyntax(function (pathNodeSyntax, doubleDotSyntax, dotSyntax, bangSyntax, emptySyntax ) {

   var CAPTURING_INDEX = 1;
   var NAME_INDEX = 2;
   var FIELD_LIST_INDEX = 3;

   var headKey = compose(keyOf, head);
                   
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
   function pathEqualClause(previousExpr, detection ) {

      // extract meaning from the detection      
      var name = detection[NAME_INDEX],
            
          condition = ( !name || name == '*' ) 
                           ?  always
                           :  function(ascent){return headKey(ascent) == name};
     
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */
      return lazyIntersection(condition, previousExpr);
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
   function duckTypeClause(previousExpr, detection) {

      var fieldListStr = detection[FIELD_LIST_INDEX];

      if (!fieldListStr) {
         return previousExpr; // don't wrap at all, return given expr as-is
      }

      var hasAllrequiredFields = partialComplete(hasAllProperties, asList(fieldListStr.split(/\W+/))),
          isMatch = compose( hasAllrequiredFields, nodeOf, head );

      return lazyIntersection(isMatch, previousExpr);
   }

   /**
    * Expression for $
    * 
    * @param previousExpr
    */
   function capture( previousExpr, detection ) {

      // extract meaning from the detection      
      var capturing = !!detection[CAPTURING_INDEX];

      if (!capturing) {         
         return previousExpr; // don't wrap at all, return given expr as-is
      }
      
      return lazyIntersection(previousExpr, head);
            
   }            
      
   /**
    * Moves onto the next item on the lists. Doesn't map neatly onto any particular language feature but
    * is a requirement for many. Eg, for jsnPath ".foo" we need consume1(exprWithNameSpecified)
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */
   function consume1(previousExpr) {
   
   
      if( previousExpr == always ) {
         // If there is no previous expression, this consume command is at the start of the jsonPath.
         // since jsonPath specifies what we'd like to find but not necessarily everything leading up to
         // it, we default to true. 
         // This is relevant for example in the jsonPath '*'. This should match the root obejct. Or,
         // '..*'            
         return always;
      }

      function notAtRoot(ascent){
         return headKey(ascent) != ROOT_PATH;
      }
      
      return lazyIntersection(
               // If we're already at the root but there are more expressions to satisfy,
               // can't consume any more. No match.
               
               // This check is why none of the other exprs have to be able to handle empty lists;
               // only consume1 moves onto the next token and it refuses to do so once it reaches
               // the list item in the list.       
               notAtRoot,
               
               // consider the next bit of the ascent by passing only the tail to the previous
               // expression 
               compose(previousExpr, tail) 
      );
                                                                                                               
   }   
   
   /**
    * Expression for the .. (double dot) token. Consumes zero or more tokens from the input, the fewest that
    * are required for the previousExpr to match.
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */   
   function consumeMany(previousExpr) {

      if( previousExpr == always ) {
         // If there is no previous expression, this consume command is at the start of the jsonPath.
         // since jsonPath specifies what we'd like to find but not necessarily everything leading up to
         // it, we default to true. 
         // This is relevant for example in the jsonPath '*'. This should match the root obejct. Or,
         // '..*'            
         return always;
      }
          
      var 
            // jsonPath .. is equivalent to !.. so if .. reaches the root
            // the match has suceeded.
          terminalCaseWhenArrivingAtRoot = rootExpr(),
          terminalCaseWhenPreviousExpressionIsSatisfied = previousExpr, 
          recursiveCase = consume1(consumeManyPartiallyCompleted),
          
          cases = lazyUnion(
                     terminalCaseWhenArrivingAtRoot
                  ,  terminalCaseWhenPreviousExpressionIsSatisfied
                  ,  recursiveCase
                  );                        
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */            
      function consumeManyPartiallyCompleted(ascent) {
      
         if( !ascent ) {
            // have gone past the start, not a match:         
            return false;
         }      
                                                        
         return cases(ascent);
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
      return function(ascent){
         return headKey(ascent) == ROOT_PATH;
      };
   }   
         
   /**
    * Expression for the empty string. As the jsonPath parser generates the path parser, it will eventually
    * run out of tokens and get to the empty string. So, all generated parsers will be wrapped in this function.
    * 
    * @returns {Function} a function which examines the descents on a path from the root of a json to a node
    *                     and decides if there is a match or not
    */   
   function statementExpr(lastClause) {
   
      /**
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */   
      return function(ascent) {
   
         // kick off the parsing by passing through to the lastExpression
         var exprMatch = lastClause(ascent);
                               
         // Returning exactly true indicates that there has been a match but no node is captured. 
         // By default, the node at the start of the lists gets returned. Just like in css4 selector 
         // spec, if there is no $, the last node in the selector is the one being styled.                      
         return exprMatch === true ? head(ascent) : exprMatch;
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
                     
      // note that if exprs is zero-length, fold will pass back 
      // parserGeneratedSoFar so we don't need to treat this as a special case
      return foldR( function( parserGeneratedSoFar, expr ){
      
         return expr(parserGeneratedSoFar, detection);
                     
      }, parserGeneratedSoFar, exprs );                     

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
   var clause = lazyUnion(

      clauseMatcher(pathNodeSyntax   , list(capture, duckTypeClause, pathEqualClause, consume1 ))        
   ,  clauseMatcher(doubleDotSyntax  , list(consumeMany))
       
       // dot is a separator only (like whitespace in other languages) but rather than special case
       // it, the expressions can be an empty array.
   ,  clauseMatcher(dotSyntax        , list() )  
                                                                                      
   ,  clauseMatcher(bangSyntax       , list(capture, rootExpr))             
   ,  clauseMatcher(emptySyntax      , list(statementExpr))
   
   ,   // if none of the above worked, we need to fail by throwing an error
      function (jsonPath) {
         throw Error('"' + jsonPath + '" could not be tokenised')      
      }
   );


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
                   
      return clause(jsonPath, parserGeneratedSoFar, onFind);                              
   }

   // all the above is now captured in the closure of this immediately-called function. let's
   // return the function we wish to expose globally:
   return function(jsonPath){
        
      try {
         // Kick off the recursive parsing of the jsonPath 
         return compileJsonPathToFunction(jsonPath, always);
      } catch( e ) {
         throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
      }
   }

});



function pubSub(){

   var listeners = {};
                             
   return {
      notify:varArgs(function ( eventId, parameters ) {
               
         listeners[eventId] && applyAll( listeners[eventId] , parameters );
      }),
      on:function( eventId, fn ) {
         (listeners[eventId] || (listeners[eventId] = [])).push(fn);
            
         return this; // chaining                                         
      }            
   };
}
var _S = 0,
    TYPE_NODE = _S++,
    TYPE_PATH = _S++,
    ERROR_EVENT = _S++,
    HTTP_PROGRESS_EVENT = _S++,
    HTTP_DONE_EVENT = _S++;
/* 
   The API that is given out when a new Oboe instance is created.
    
   This file handles the peculiarities of being able to add listeners in a couple of different syntaxes
   and returns the object that exposes a small number of methods.
 */

function instanceApi(instController){
   
   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         instController.addCallback(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addNodeOrPathListener( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         instController.addCallback(eventId, jsonPathOrListenerMap, callback.bind(callbackContext));
      } else {
         pushListeners(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }         

   instController.onPath = partialComplete(addNodeOrPathListener, TYPE_PATH); 
   instController.onNode = partialComplete(addNodeOrPathListener, TYPE_NODE); 

   return instController;   
}
/**
 * 
 * @param eventBus
 * @param clarinetParser
 * @param {Function} jsonRoot a function which returns the json root so far
 */
function instanceController(eventBus, clarinetParser, jsonRoot) {
  
   // eventBus methods are used lots. Shortcut them:
   var on = eventBus.on,
       notify = eventBus.notify,
       sxhr = streamingXhr(notify);  
  
   clarinetParser.onerror =  
       function(e) {          
          notify(ERROR_EVENT, e);
            
          // the json is invalid, give up and close the parser to prevent getting any more:
          clarinetParser.close();
       };
                              
   function fetch(httpMethodName, url, httpRequestBody, doneCallback) {                                                                                                                                                    
         
      on(HTTP_PROGRESS_EVENT,         
         function (nextDrip) {
            // callback for when a bit more data arrives from the streaming XHR         
             
            try {
               clarinetParser.write(nextDrip);
            } catch(e) {
               // we don't have to do anything here because we always assign a .onerror
               // to clarinet which will have already been called by the time this 
               // exception is thrown.                
            }
         }
      );
      
      on(HTTP_DONE_EVENT,
         function() {
            // callback for when the response is complete
                                 
            clarinetParser.close();
            
            doneCallback && doneCallback(jsonRoot());
         }
      );
      
      sxhr.req( httpMethodName,
                url, 
                httpRequestBody);
   }
                 
   /**
    *  
    */
   function addPathOrNodeListener( eventId, pattern, callback ) {
   
      var matchesJsonPath = jsonPathCompiler( pattern );
   
      // Add a new listener to the eventBus.
      // This listener first checks that he pattern matches then if it does, 
      // passes it onto the callback. 
      on( eventId, function( ascent ){ 
      
         try{
            var maybeMatchingMapping = matchesJsonPath( ascent );
         } catch(e) {
            // I'm hoping evaluating the jsonPath won't throw any Errors but in case it does I
            // want to catch as early as possible:
            notify(ERROR_EVENT, Error('Error evaluating pattern ' + pattern + ': ' + e.message));            
         }
        
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
         if( maybeMatchingMapping !== false ) {                                 
           
            try{
               notifyCallback(callback, maybeMatchingMapping, ascent);
               
            } catch(e) {
               notify(ERROR_EVENT, e);
            }
         }
      });   
   }   
   
   function notifyCallback(callback, matchingMapping, ascent) {
      // We're now calling back to outside of oboe where there is no concept of the
      // functional-style lists that we are using internally so convert into standard
      // arrays. Reverse the order because it is more natural to receive in order 
      // "root to leaf" than "leaf to root"             
            
      var descent     = reverseList(ascent),
      
            // for the path list, also need to remove the last item which is the special
            // token for the 'path' to the root node
          path       = listAsArray(tail(map(keyOf,descent))),
          ancestors  = listAsArray(map(nodeOf, descent)); 
      
      callback( nodeOf(matchingMapping), path, ancestors );  
   }
   
       
   /* the controller exposes two methods: */                                          
   return { 
      addCallback : addPathOrNodeListener, 
      onError     : partialComplete(on, ERROR_EVENT),
      fetch       : fetch,
      root        : jsonRoot     
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
                  
      return function(firstArg){
      
         // wire everything up:
         var eventBus = pubSub(),
             clarinetParser = clarinet.parser(),
             contentBuilder = incrementalContentBuilder(clarinetParser, eventBus.notify),             
             instController = instanceController( eventBus, clarinetParser, contentBuilder),
 
             /**
              * create a shortcutted version of controller.start, could also be done with .bind
              * in supporting browsers
              */
             start = function (url, body, callback){ 
                instController.fetch( httpMethodName, url, body, callback );
             };
             
         if (isString(firstArg)) {
         
            // parameters specified as arguments
            //
            //  if (mayHaveContext == true) method signature is:
            //     .method( url, content, callback )
            //
            //  else it is:
            //     .method( url, callback )            
            //                                
            start(   firstArg,                                       // url
                     mayHaveRequestBody? arguments[1] : undefined,   // body
                     arguments[mayHaveRequestBody? 2 : 1] );         // callback
         } else {
         
            
            // method signature is:
            //    .method({url:u, body:b, doneCallback:c})
            
            start(   firstArg.url,
                     firstArg.body,
                     firstArg.complete );
         }
                                           
         // return an api to control this oboe instance                   
         return instanceApi(instController, contentBuilder)           
      };
   }   

})();})(window, Object, Array, Error);