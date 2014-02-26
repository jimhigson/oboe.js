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
  eventBus(STREAM_END).on( write.bind(undefined, null));   


  function emit(event, data) {
    eventBus(event).emit(data);
  }

  function emitNode(event, data) {
    closeValue();
    emit(event, data);
  }

  function closeValue(event) {

    if (textNode) {
      emit((event ? event : SAX_VALUE), textNode);
    }
    textNode = "";
  }

  function closeNumber() {
    if (numberNode)
      emit(SAX_VALUE, parseFloat(numberNode));
    numberNode = "";
  }


  function emitError (er) {
    closeValue();
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

    closeValue();
    closed = true;
  }

  function write (chunk) {
         
    // this used to throw the error but inside Oboe we will have already
    // gotten the error when it was emitted. The important thing is to
    // not continue with the parse.
    if (error)
      return;
      
    if (closed) return emitError(
       "Cannot write after close. Assign an onready handler.");
    if (chunk === null) return end();
    var i = 0, localc = chunk[0], localp = p;

    while (localc) {
      localp = localc;
      c = localc = chunk.charAt(i++);
      // if chunk doesnt have next, like streaming char by char
      // this way we need to check if previous is really previous
      // if not we need to reset to what the parser says is the previous
      // from buffer
      if(localp !== localc ) p = localp;
      else localp = p;

      if(!localc) break;

      position ++;
      if (localc === "\n") {
        line ++;
        column = 0;
      } else column ++;
      switch (state) {

        case BEGIN:
          if (localc === "{") state = OPEN_OBJECT;
          else if (localc === "[") state = OPEN_ARRAY;
          else if (localc !== '\r' && localc !== '\n' && localc !== ' ' && localc !== '\t')
            emitError("Non-whitespace before {[.");
        continue;

        case OPEN_KEY:
        case OPEN_OBJECT:
          if (localc === '\r' || localc === '\n' || localc === ' ' || localc === '\t') continue;
          if(state === OPEN_KEY) stack.push(CLOSE_KEY);
          else {
            if(localc === '}') {
              emit(SAX_OPEN_OBJECT);
              depth++;
              emit(SAX_CLOSE_OBJECT);
              depth--;
              state = stack.pop() || VALUE;
              continue;
            } else  stack.push(CLOSE_OBJECT);
          }
          if(localc === '"')
             state = STRING;
          else 
             emitError("Malformed object key should start with \" " + localc);
        continue;

        case CLOSE_KEY:
        case CLOSE_OBJECT:
          if (localc === '\r' || localc === '\n' || localc === ' ' || localc === '\t') continue;

          if(localc===':') {
            if(state === CLOSE_OBJECT) {
              stack.push(CLOSE_OBJECT);
              closeValue(SAX_OPEN_OBJECT);
              depth++;
            } else closeValue(SAX_KEY);
            state  = VALUE;
          } else if (localc==='}') {
            emitNode(SAX_CLOSE_OBJECT);
            depth--;
            state = stack.pop() || VALUE;
          } else if(localc===',') {
            if(state === CLOSE_OBJECT)
              stack.push(CLOSE_OBJECT);
            closeValue();
            state  = OPEN_KEY;
          } else emitError('Bad object');
        continue;

        case OPEN_ARRAY: // after an array there always a value
        case VALUE:
          if (localc === '\r' || localc === '\n' || localc === ' ' || localc === '\t') continue;
          if(state===OPEN_ARRAY) {
            emit(SAX_OPEN_ARRAY);
            depth++;             
            state = VALUE;
            if(localc === ']') {
              emit(SAX_CLOSE_ARRAY);
              depth--;
              state = stack.pop() || VALUE;
              continue;
            } else {
              stack.push(CLOSE_ARRAY);
            }
          }
               if(localc === '"') state = STRING;
          else if(localc === '{') state = OPEN_OBJECT;
          else if(localc === '[') state = OPEN_ARRAY;
          else if(localc === 't') state = TRUE;
          else if(localc === 'f') state = FALSE;
          else if(localc === 'n') state = NULL;
          else if(localc === '-') { // keep and continue
            numberNode += localc;
          } else if(localc==='0') {
            numberNode += localc;
            state = NUMBER_DIGIT;
          } else if('123456789'.indexOf(localc) !== -1) {
            numberNode += localc;
            state = NUMBER_DIGIT;
          } else               emitError("Bad value");
        continue;

        case CLOSE_ARRAY:
          if(localc===',') {
            stack.push(CLOSE_ARRAY);
            closeValue(SAX_VALUE);
            state  = VALUE;
          } else if (localc===']') {
            emitNode(SAX_CLOSE_ARRAY);
            depth--;
            state = stack.pop() || VALUE;
          } else if (localc === '\r' || localc === '\n' || localc === ' ' || localc === '\t')
              continue;
          else emitError('Bad array');
        continue;

        case STRING:
          // thanks thejh, this is an about 50% performance improvement.
          var starti              = i-1;
           
          STRING_BIGLOOP: while (true) {

            // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
            while (unicodeI > 0) {
              unicodeS += localc;
              localc = chunk.charAt(i++);
              if (unicodeI === 4) {
                // TODO this might be slow? well, probably not used too often anyway
                textNode += String.fromCharCode(parseInt(unicodeS, 16));
                unicodeI = 0;
                starti = i-1;
              } else {
                unicodeI++;
              }
              // we can just break here: no stuff we skipped that still has to be sliced out or so
              if (!localc) break STRING_BIGLOOP;
            }
            if (localc === '"' && !slashed) {
              state = stack.pop() || VALUE;
              textNode += chunk.substring(starti, i-1);
              if(!textNode) {
                 emit(SAX_VALUE, "");
              }
              break;
            }
            if (localc === '\\' && !slashed) {
              slashed = true;
              textNode += chunk.substring(starti, i-1);
               localc = chunk.charAt(i++);
              if (!localc) break;
            }
            if (slashed) {
              slashed = false;
                   if (localc === 'n') { textNode += '\n'; }
              else if (localc === 'r') { textNode += '\r'; }
              else if (localc === 't') { textNode += '\t'; }
              else if (localc === 'f') { textNode += '\f'; }
              else if (localc === 'b') { textNode += '\b'; }
              else if (localc === 'u') {
                // \uxxxx. meh!
                unicodeI = 1;
                unicodeS = '';
              } else {
                textNode += localc;
              }
              localc = chunk.charAt(i++);
              starti = i-1;
              if (!localc) break;
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
            localc = chunk.charAt(reResult.index);
            if (!localc) {
              textNode += chunk.substring(starti, i-1);
              break;
            }
          }
        continue;

        case TRUE:
          if (localc==='')  continue; // strange buffers
          if (localc==='r') state = TRUE2;
          else emitError( 'Invalid true started with t'+ localc);
        continue;

        case TRUE2:
          if (localc==='')  continue;
          if (localc==='u') state = TRUE3;
          else emitError('Invalid true started with tr'+ localc);
        continue;

        case TRUE3:
          if (localc==='') continue;
          if(localc==='e') {
            emit(SAX_VALUE, true);
            state = stack.pop() || VALUE;
          } else emitError('Invalid true started with tru'+ localc);
        continue;

        case FALSE:
          if (localc==='')  continue;
          if (localc==='a') state = FALSE2;
          else emitError('Invalid false started with f'+ localc);
        continue;

        case FALSE2:
          if (localc==='')  continue;
          if (localc==='l') state = FALSE3;
          else emitError('Invalid false started with fa'+ localc);
        continue;

        case FALSE3:
          if (localc==='')  continue;
          if (localc==='s') state = FALSE4;
          else emitError('Invalid false started with fal'+ localc);
        continue;

        case FALSE4:
          if (localc==='')  continue;
          if (localc==='e') {
            emit(SAX_VALUE, false);
            state = stack.pop() || VALUE;
          } else emitError('Invalid false started with fals'+ localc);
        continue;

        case NULL:
          if (localc==='')  continue;
          if (localc==='u') state = NULL2;
          else emitError('Invalid null started with n'+ localc);
        continue;

        case NULL2:
          if (localc==='')  continue;
          if (localc==='l') state = NULL3;
          else emitError('Invalid null started with nu'+ localc);
        continue;

        case NULL3:
          if (localc==='') continue;
          if(localc==='l') {
            emit(SAX_VALUE, null);
            state = stack.pop() || VALUE;
          } else emitError('Invalid null started with nul'+ localc);
        continue;

        case NUMBER_DECIMAL_POINT:
          if(localc==='.') {
            numberNode += localc;
            state       = NUMBER_DIGIT;
          } else emitError('Leading zero not followed by .');
        continue;

        case NUMBER_DIGIT:
          if('0123456789'.indexOf(localc) !== -1) numberNode += localc;
          else if (localc==='.') {
            if(numberNode.indexOf('.')!==-1)
              emitError('Invalid number has two dots');
            numberNode += localc;
          } else if (localc==='e' || localc==='E') {
            if(numberNode.indexOf('e')!==-1 ||
               numberNode.indexOf('E')!==-1 )
               emitError('Invalid number has two exponential');
            numberNode += localc;
          } else if (localc==="+" || localc==="-") {
            if(!(localp==='e' || localp==='E'))
              emitError('Invalid symbol in number');
            numberNode += localc;
          } else {
            closeNumber();
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
