/* 
   This is a slightly hacked-up browser only version of clarinet 
   
      *  some features removed to help keep browser Oboe under 
         the 5k micro-library limit
      *  plug directly into event bus
   
   For the original go here:
      https://github.com/dscape/clarinet
 */

function clarinet(eventBus) {
  "use strict";
   
  var MAX_BUFFER_LENGTH = 64 * 1024
  ,   stringTokenPattern = /[\\"\n]/g
  ,   _n = 0
  
      // states
  ,   BEGIN                = _n++
  ,   VALUE                = _n++ // general stuff
  ,   OPEN_OBJECT          = _n++ // {
  ,   CLOSE_OBJECT         = _n++ // }
  ,   OPEN_ARRAY           = _n++ // [
  ,   CLOSE_ARRAY          = _n++ // ]
  ,   STRING               = _n++ // ""
  ,   OPEN_KEY             = _n++ // , "a"
  ,   CLOSE_KEY            = _n++ // :
  ,   TRUE                 = _n++ // r
  ,   TRUE2                = _n++ // u
  ,   TRUE3                = _n++ // e
  ,   FALSE                = _n++ // a
  ,   FALSE2               = _n++ // l
  ,   FALSE3               = _n++ // s
  ,   FALSE4               = _n++ // e
  ,   NULL                 = _n++ // u
  ,   NULL2                = _n++ // l
  ,   NULL3                = _n++ // l
  ,   NUMBER_DECIMAL_POINT = _n++ // .
  ,   NUMBER_DIGIT         = _n   // [0-9]

      // setup initial parser values
  ,   bufferCheckPosition = MAX_BUFFER_LENGTH
  ,   c                    = ""
  ,   p                    = ""
  ,   closed               = false
  ,   error                = null
  ,   state                = BEGIN
  ,   stack                = []
  ,   position             = 0
  ,   column               = 0  //mostly for error reporting
  ,   line                 = 1
  ,   slashed              = false
  ,   unicodeI             = 0
  ,   unicodeS             = null
  ,   depth                = 0
  ,   textNode             = ""
  ,   numberNode           = "";

  function checkBufferLength () {
     
    var maxActual = 0;
     
    if (textNode.length > MAX_BUFFER_LENGTH) {
      emitError("Max buffer length exceeded: textNode");
      maxActual = Math.max(maxActual, textNode.length);
    }
    if (numberNode.length > MAX_BUFFER_LENGTH) {
      emitError("Max buffer length exceeded: numberNode");
      maxActual = Math.max(maxActual, numberNode.length);
    }
     
    bufferCheckPosition = (MAX_BUFFER_LENGTH - maxActual)
                               + position;
  }

  eventBus(STREAM_DATA).on(write);

   /* At the end of the http content close the clarinet 
    This will provide an error if the total content provided was not 
    valid json, ie if not all arrays, objects and Strings closed properly */
  eventBus(STREAM_END).on(end);   


  function emit(event, data) {
     // TODO: store refs to singles then inline
    eventBus(event).emit(data);
  }

  function closeValue(event) {

    if (textNode) {
      emit(event, textNode);
    }
    textNode = "";
  }

  function emitError (er) {
    closeValue(SAX_VALUE);
    er += "\nLn: "+line+
          "\nCol: "+column+
          "\nChr: "+c;
    er = new Error(er);
    error = er;
    emit(FAIL_EVENT, errorReport(undefined, undefined, er));
  }

  function end() {
    if (state !== VALUE || depth !== 0)
      emitError("Unexpected end");

    closeValue(SAX_VALUE);
    closed = true;
  }

  function write (chunk) {
         
    // this used to throw the error but inside Oboe we will have already
    // gotten the error when it was emitted. The important thing is to
    // not continue with the parse.
    if (error)
      return;
      
    if (closed) return emitError("Cannot write after close");

    var i = 0;
    c = chunk[0]; 

    while (c) {
      p = c;
      c = chunk.charAt(i++);
      if(!c) break;

      position ++;
      if (c === "\n") {
        line ++;
        column = 0;
      } else column ++;
      switch (state) {

        case BEGIN:
          if (c === "{") state = OPEN_OBJECT;
          else if (c === "[") state = OPEN_ARRAY;
          else if (c !== '\r' && c !== '\n' && c !== ' ' && c !== '\t')
            emitError("Non-whitespace before {[.");
        continue;

        case OPEN_KEY:
        case OPEN_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(state === OPEN_KEY) stack.push(CLOSE_KEY);
          else {
            if(c === '}') {
              emit(SAX_OPEN_OBJECT);
              emit(SAX_CLOSE_OBJECT);
              state = stack.pop() || VALUE;
              continue;
            } else  stack.push(CLOSE_OBJECT);
          }
          if(c === '"')
             state = STRING;
          else 
             emitError("Malformed object key should start with \" ");
        continue;

        case CLOSE_KEY:
        case CLOSE_OBJECT:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;

          if(c===':') {
            if(state === CLOSE_OBJECT) {
              stack.push(CLOSE_OBJECT);
              // TODO: make two events here
              closeValue(SAX_OPEN_OBJECT);
              depth++;
            } else closeValue(SAX_KEY);
            state  = VALUE;
          } else if (c==='}') {
            closeValue(SAX_VALUE);
            emit(SAX_CLOSE_OBJECT);
            depth--;
            state = stack.pop() || VALUE;
          } else if(c===',') {
            if(state === CLOSE_OBJECT)
              stack.push(CLOSE_OBJECT);
            closeValue(SAX_VALUE);
            state  = OPEN_KEY;
          } else emitError('Bad object');
        continue;

        case OPEN_ARRAY: // after an array there always a value
        case VALUE:
          if (c === '\r' || c === '\n' || c === ' ' || c === '\t') continue;
          if(state===OPEN_ARRAY) {
            emit(SAX_OPEN_ARRAY);
            depth++;             
            state = VALUE;
            if(c === ']') {
              emit(SAX_CLOSE_ARRAY);
              depth--;
              state = stack.pop() || VALUE;
              continue;
            } else {
              stack.push(CLOSE_ARRAY);
            }
          }
               if(c === '"') state = STRING;
          else if(c === '{') state = OPEN_OBJECT;
          else if(c === '[') state = OPEN_ARRAY;
          else if(c === 't') state = TRUE;
          else if(c === 'f') state = FALSE;
          else if(c === 'n') state = NULL;
          else if(c === '-') { // keep and continue
            numberNode += c;
          } else if(c==='0') {
            numberNode += c;
            state = NUMBER_DIGIT;
          } else if('123456789'.indexOf(c) !== -1) {
            numberNode += c;
            state = NUMBER_DIGIT;
          } else               emitError("Bad value");
        continue;

        case CLOSE_ARRAY:
          if(c===',') {
            stack.push(CLOSE_ARRAY);
            closeValue(SAX_VALUE);
            state  = VALUE;
          } else if (c===']') {
            closeValue(SAX_VALUE);
            emit(SAX_CLOSE_ARRAY);
            depth--;
            state = stack.pop() || VALUE;
          } else if (c === '\r' || c === '\n' || c === ' ' || c === '\t')
              continue;
          else emitError('Bad array');
        continue;

        case STRING:
          // thanks thejh, this is an about 50% performance improvement.
          var starti              = i-1;
           
          STRING_BIGLOOP: while (true) {

            // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
            while (unicodeI > 0) {
              unicodeS += c;
              c = chunk.charAt(i++);
              if (unicodeI === 4) {
                // TODO this might be slow? well, probably not used too often anyway
                textNode += String.fromCharCode(parseInt(unicodeS, 16));
                unicodeI = 0;
                starti = i-1;
              } else {
                unicodeI++;
              }
              // we can just break here: no stuff we skipped that still has to be sliced out or so
              if (!c) break STRING_BIGLOOP;
            }
            if (c === '"' && !slashed) {
              state = stack.pop() || VALUE;
              textNode += chunk.substring(starti, i-1);
              if(!textNode) {
                 emit(SAX_VALUE, "");
              }
              break;
            }
            if (c === '\\' && !slashed) {
              slashed = true;
              textNode += chunk.substring(starti, i-1);
               c = chunk.charAt(i++);
              if (!c) break;
            }
            if (slashed) {
              slashed = false;
                   if (c === 'n') { textNode += '\n'; }
              else if (c === 'r') { textNode += '\r'; }
              else if (c === 't') { textNode += '\t'; }
              else if (c === 'f') { textNode += '\f'; }
              else if (c === 'b') { textNode += '\b'; }
              else if (c === 'u') {
                // \uxxxx. meh!
                unicodeI = 1;
                unicodeS = '';
              } else {
                textNode += c;
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
              textNode += chunk.substring(starti, i-1);
              break;
            }
            i = reResult.index+1;
            c = chunk.charAt(reResult.index);
            if (!c) {
              textNode += chunk.substring(starti, i-1);
              break;
            }
          }
        continue;

        case TRUE:
          if (c==='')  continue; // strange buffers
          if (c==='r') state = TRUE2;
          else emitError( 'Invalid true started with t'+ c);
        continue;

        case TRUE2:
          if (c==='')  continue;
          if (c==='u') state = TRUE3;
          else emitError('Invalid true started with tr'+ c);
        continue;

        case TRUE3:
          if (c==='') continue;
          if(c==='e') {
            emit(SAX_VALUE, true);
            state = stack.pop() || VALUE;
          } else emitError('Invalid true started with tru'+ c);
        continue;

        case FALSE:
          if (c==='')  continue;
          if (c==='a') state = FALSE2;
          else emitError('Invalid false started with f'+ c);
        continue;

        case FALSE2:
          if (c==='')  continue;
          if (c==='l') state = FALSE3;
          else emitError('Invalid false started with fa'+ c);
        continue;

        case FALSE3:
          if (c==='')  continue;
          if (c==='s') state = FALSE4;
          else emitError('Invalid false started with fal'+ c);
        continue;

        case FALSE4:
          if (c==='')  continue;
          if (c==='e') {
            emit(SAX_VALUE, false);
            state = stack.pop() || VALUE;
          } else emitError('Invalid false started with fals'+ c);
        continue;

        case NULL:
          if (c==='')  continue;
          if (c==='u') state = NULL2;
          else emitError('Invalid null started with n'+ c);
        continue;

        case NULL2:
          if (c==='')  continue;
          if (c==='l') state = NULL3;
          else emitError('Invalid null started with nu'+ c);
        continue;

        case NULL3:
          if (c==='') continue;
          if(c==='l') {
            emit(SAX_VALUE, null);
            state = stack.pop() || VALUE;
          } else emitError('Invalid null started with nul'+ c);
        continue;

        case NUMBER_DECIMAL_POINT:
          if(c==='.') {
            numberNode += c;
            state       = NUMBER_DIGIT;
          } else emitError('Leading zero not followed by .');
        continue;

        case NUMBER_DIGIT:
          if('0123456789'.indexOf(c) !== -1) numberNode += c;
          else if (c==='.') {
            if(numberNode.indexOf('.')!==-1)
              emitError('Invalid number has two dots');
            numberNode += c;
          } else if (c==='e' || c==='E') {
            if(numberNode.indexOf('e')!==-1 ||
               numberNode.indexOf('E')!==-1 )
               emitError('Invalid number has two exponential');
            numberNode += c;
          } else if (c==="+" || c==="-") {
            if(!(p==='e' || p==='E'))
              emitError('Invalid symbol in number');
            numberNode += c;
          } else {
             if (numberNode)
                emit(SAX_VALUE, parseFloat(numberNode));
             numberNode = "";
             i--; // go back one
            state = stack.pop() || VALUE;
          }
        continue;

        default:
          emitError("Unknown state: " + state);
      }
    }
    if (position >= bufferCheckPosition)
      checkBufferLength();
  }

}
