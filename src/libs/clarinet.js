/* 
   This is a slightly hacked-up browser only version of clarinet 
   
      *  some features removed to help keep browser Oboe under 
         the 5k micro-library limit
      *  plug directly into event bus
   
   For the original go here:
      https://github.com/dscape/clarinet
 */

function clarinet(eventBus) {

  var MAX_BUFFER_LENGTH = 64 * 1024
  ,   buffers     = [ "textNode", "numberNode" ]
  ,   _n          = 0
  ,   stringTokenPattern = /[\\"\n]/g;
  
  var BEGIN                             = _n++;
  var VALUE                             = _n++; // general stuff
  var OPEN_OBJECT                       = _n++; // {
  var CLOSE_OBJECT                      = _n++; // }
  var OPEN_ARRAY                        = _n++; // [
  var CLOSE_ARRAY                       = _n++; // ]
  var STRING                            = _n++; // ""
  var OPEN_KEY                          = _n++; // , "a"
  var CLOSE_KEY                         = _n++; // :
  var TRUE                              = _n++; // r
  var TRUE2                             = _n++; // u
  var TRUE3                             = _n++; // e
  var FALSE                             = _n++; // a
  var FALSE2                            = _n++; // l
  var FALSE3                            = _n++; // s
  var FALSE4                            = _n++; // e
  var NULL                              = _n++; // u
  var NULL2                             = _n++; // l
  var NULL3                             = _n++; // l
  var NUMBER_DECIMAL_POINT              = _n++; // .
  var NUMBER_DIGIT                      = _n;   // [0-9]

  function checkBufferLength (parser) {
    var maxActual = 0
      ;
    for (var i = 0, l = buffers.length; i < l; i ++) {
      var len = parser[buffers[i]].length;
      if (len > MAX_BUFFER_LENGTH) {
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
    parser.bufferCheckPosition = (MAX_BUFFER_LENGTH - maxActual)
                               + parser.position;
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i ++) {
      parser[buffers[i]] = "";
    }
  }


  function CParser () {
    var parser = this;
    clearBuffers(parser);
    parser.bufferCheckPosition = MAX_BUFFER_LENGTH;
    parser.q        = parser.c = parser.p = "";
    parser.closed   = parser.closedRoot = parser.sawRoot = false;
    parser.tag      = parser.error = null;
    parser.state    = BEGIN;
    parser.stack    = [];
    // mostly just for error reporting
    parser.position = parser.column = 0;
    parser.line     = 1;
    parser.slashed  = false;
    parser.unicodeI = 0;
    parser.unicodeS = null;
    parser.depth    = 0;
    emit(parser¡ªª, SAX_READY);

    eventBus(STREAM_DATA).on( write.bind(parser));

    /* At the end of the http content close the clarinet parser.
     This will provide an error if the total content provided was not 
     valid json, ie if not all arrays, objects and Strings closed properly */
    eventBus(STREAM_END).on( write.bind(parser, null));
  }

  function emit(parser, event, data) {
    if (parser[event]) parser[event](data);
  }

  function emitNode(parser, event, data) {
    closeValue(parser);
    emit(parser, event, data);
  }

  function closeValue(parser, event) {

    if (parser.textNode) {
      emit(parser, (event ? event : SAX_VALUE), parser.textNode);
    }
    parser.textNode = "";
  }

  function closeNumber(parser) {
    if (parser.numberNode)
      emit(parser, SAX_VALUE, parseFloat(parser.numberNode));
    parser.numberNode = "";
  }


  function error (parser, er) {
    closeValue(parser);
    er += "\nLn: "+parser.line+
          "\nCol: "+parser.column+
          "\nChr: "+parser.c;
    er = new Error(er);
    parser.error = er;
    emit(parser, SAX_ERROR, er);
    return parser;
  }

  function end(parser) {
    if (parser.state !== VALUE || parser.depth !== 0)
      error(parser, "Unexpected end");

    closeValue(parser);
    parser.c      = "";
    parser.closed = true;
    emit(parser, SAX_END);
    CParser.call(parser);
    return parser;
  }

  function write (chunk) {
    var parser = this;
    
    // this used to throw the error but inside Oboe we will have already
    // gotten the error when it was emitted. The important thing is to
    // not continue with the parse.
    if (this.error)
      return;
      
    if (parser.closed) return error(parser,
      "Cannot write after close. Assign an onready handler.");
    if (chunk === null) return end(parser);
    var i = 0, c = chunk[0], p = parser.p;

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

      parser.position ++;
      if (c === "\n") {
        parser.line ++;
        parser.column = 0;
      } else parser.column ++;
      switch (parser.state) {

        case BEGIN:
          if (c === "{") parser.state = OPEN_OBJECT;
          else if (c === "[") parser.state = OPEN_ARRAY;
          else if (c !== '\r' && c !== '\n' && c !== ' ' && c !== '\t')
            error(parser, "Non-whitespace before {[.");
        continue;

        case OPEN_KEY:
        case OPEN_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(parser.state === OPEN_KEY) parser.stack.push(CLOSE_KEY);
          else {
            if(c === '}') {
              emit(parser, SAX_OPEN_OBJECT);
              this.depth++;
              emit(parser, SAX_CLOSE_OBJECT);
              this.depth--;
              parser.state = parser.stack.pop() || VALUE;
              continue;
            } else  parser.stack.push(CLOSE_OBJECT);
          }
          if(c === '"') parser.state = STRING;
          else error(parser, "Malformed object key should start with \"");
        continue;

        case CLOSE_KEY:
        case CLOSE_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;

          if(c===':') {
            if(parser.state === CLOSE_OBJECT) {
              parser.stack.push(CLOSE_OBJECT);
              closeValue(parser, SAX_OPEN_OBJECT);
              this.depth++;
            } else closeValue(parser, SAX_KEY);
            parser.state  = VALUE;
          } else if (c==='}') {
            emitNode(parser, SAX_CLOSE_OBJECT);
             this.depth--;
             parser.state = parser.stack.pop() || VALUE;
          } else if(c===',') {
            if(parser.state === CLOSE_OBJECT)
              parser.stack.push(CLOSE_OBJECT);
            closeValue(parser);
            parser.state  = OPEN_KEY;
          } else error(parser, 'Bad object');
        continue;

        case OPEN_ARRAY: // after an array there always a value
        case VALUE:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(parser.state===OPEN_ARRAY) {
            emit(parser, SAX_OPEN_ARRAY);
            this.depth++;             
            parser.state = VALUE;
            if(c === ']') {
              emit(parser, SAX_CLOSE_ARRAY);
              this.depth--;
              parser.state = parser.stack.pop() || VALUE;
              continue;
            } else {
              parser.stack.push(CLOSE_ARRAY);
            }
          }
               if(c === '"') parser.state = STRING;
          else if(c === '{') parser.state = OPEN_OBJECT;
          else if(c === '[') parser.state = OPEN_ARRAY;
          else if(c === 't') parser.state = TRUE;
          else if(c === 'f') parser.state = FALSE;
          else if(c === 'n') parser.state = NULL;
          else if(c === '-') { // keep and continue
            parser.numberNode += c;
          } else if(c==='0') {
            parser.numberNode += c;
            parser.state = NUMBER_DIGIT;
          } else if('123456789'.indexOf(c) !== -1) {
            parser.numberNode += c;
            parser.state = NUMBER_DIGIT;
          } else               error(parser, "Bad value");
        continue;

        case CLOSE_ARRAY:
          if(c===',') {
            parser.stack.push(CLOSE_ARRAY);
            closeValue(parser, SAX_VALUE);
            parser.state  = VALUE;
          } else if (c===']') {
            emitNode(parser, SAX_CLOSE_ARRAY);
            this.depth--;
            parser.state = parser.stack.pop() || VALUE;
          } else if (c === '\r' || c === '\n' || c === ' ' || c === '\t')
              continue;
          else error(parser, 'Bad array');
        continue;

        case STRING:
          // thanks thejh, this is an about 50% performance improvement.
          var starti              = i-1
            , slashed = parser.slashed
            , unicodeI = parser.unicodeI
            ;
          STRING_BIGLOOP: while (true) {

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
              parser.state = parser.stack.pop() || VALUE;
              parser.textNode += chunk.substring(starti, i-1);
              if(!parser.textNode) {
                 emit(parser, SAX_VALUE, "");
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

        case TRUE:
          if (c==='')  continue; // strange buffers
          if (c==='r') parser.state = TRUE2;
          else error(parser, 'Invalid true started with t'+ c);
        continue;

        case TRUE2:
          if (c==='')  continue;
          if (c==='u') parser.state = TRUE3;
          else error(parser, 'Invalid true started with tr'+ c);
        continue;

        case TRUE3:
          if (c==='') continue;
          if(c==='e') {
            emit(parser, SAX_VALUE, true);
            parser.state = parser.stack.pop() || VALUE;
          } else error(parser, 'Invalid true started with tru'+ c);
        continue;

        case FALSE:
          if (c==='')  continue;
          if (c==='a') parser.state = FALSE2;
          else error(parser, 'Invalid false started with f'+ c);
        continue;

        case FALSE2:
          if (c==='')  continue;
          if (c==='l') parser.state = FALSE3;
          else error(parser, 'Invalid false started with fa'+ c);
        continue;

        case FALSE3:
          if (c==='')  continue;
          if (c==='s') parser.state = FALSE4;
          else error(parser, 'Invalid false started with fal'+ c);
        continue;

        case FALSE4:
          if (c==='')  continue;
          if (c==='e') {
            emit(parser, SAX_VALUE, false);
            parser.state = parser.stack.pop() || VALUE;
          } else error(parser, 'Invalid false started with fals'+ c);
        continue;

        case NULL:
          if (c==='')  continue;
          if (c==='u') parser.state = NULL2;
          else error(parser, 'Invalid null started with n'+ c);
        continue;

        case NULL2:
          if (c==='')  continue;
          if (c==='l') parser.state = NULL3;
          else error(parser, 'Invalid null started with nu'+ c);
        continue;

        case NULL3:
          if (c==='') continue;
          if(c==='l') {
            emit(parser, SAX_VALUE, null);
            parser.state = parser.stack.pop() || VALUE;
          } else error(parser, 'Invalid null started with nul'+ c);
        continue;

        case NUMBER_DECIMAL_POINT:
          if(c==='.') {
            parser.numberNode += c;
            parser.state       = NUMBER_DIGIT;
          } else error(parser, 'Leading zero not followed by .');
        continue;

        case NUMBER_DIGIT:
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
            parser.state = parser.stack.pop() || VALUE;
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

  return new CParser();
}
