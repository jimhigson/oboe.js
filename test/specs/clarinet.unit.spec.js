
// test cases borrowed from
//    https://github.com/dscape/clarinet/blob/master/test/clarinet.js
var docs   =
    { empty_array :
      { text      : '[]'
      , events    :
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_CLOSE_ARRAY , undefined]
        ]
      }
    , just_slash :
      { text      : '["\\\\"]'
      , events    :
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , "\\"]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , zero_byte    :
      { text       : '{"foo": "\\u0000"}'
      , events     :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE       , "\u0000"]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , empty_value  :
      { text       : '{"foo": ""}'
      , events     :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE       , ""]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , three_byte_utf8 :
      { text          : '{"matzue": "松江", "asakusa": "浅草"}'
      , events        :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "matzue"]
        , [SAX_VALUE       , "松江"]
        , [SAX_KEY         , "asakusa"]
        , [SAX_VALUE       , "浅草"]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , four_byte_utf8 :
      { text          : '{ "U+10ABCD": "􊯍" }'
      , events        :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "U+10ABCD"]
        , [SAX_VALUE       , "􊯍"]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , bulgarian    :
      { text       : '["Да Му Еба Майката"]'
      , events     :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , "Да Му Еба Майката"]
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , codepoints_from_unicodes  :
      { text       : '["\\u004d\\u0430\\u4e8c\\ud800\\udf02"]'
      , events     :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , "\u004d\u0430\u4e8c\ud800\udf02"]
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , empty_object :
      { text       : '{}'
      , events     :
        [ [SAX_OPEN_OBJECT  , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , foobar   :
      { text   : '{"foo": "bar"}'
      , events :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE       , "bar"]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , as_is    :
      { text   : "{\"foo\": \"its \\\"as is\\\", \\\"yeah\", \"bar\": false}"
      , events :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE       , 'its "as is", "yeah']
        , [SAX_KEY         , "bar"]
        , [SAX_VALUE       , false]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , array    :
      { text   : '["one", "two"]'
      , events : 
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , 'one']
        , [SAX_VALUE      , 'two']
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , array_fu :
      { text   : '["foo", "bar", "baz",true,false,null,{"key":"value"},' +
                 '[null,null,null,[]]," \\\\ "]'
      , events : 
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , 'foo']
        , [SAX_VALUE       , 'bar']
        , [SAX_VALUE       , 'baz']
        , [SAX_VALUE       , true]
        , [SAX_VALUE       , false]
        , [SAX_VALUE       , null]
        , [SAX_OPEN_OBJECT  , 'key']
        , [SAX_VALUE       , 'value']
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , null]
        , [SAX_VALUE       , null]
        , [SAX_VALUE       , null]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [SAX_VALUE       , " \\ "]
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , simple_exp    :
      { text   : '[10e-01]'
      , events : 
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , 10e-01]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , nested   :
      { text   : '{"a":{"b":"c"}}'
      , events :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "a"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "b"]
        , [SAX_VALUE       , "c"]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , nested_array  :
      { text        : '{"a":["b", "c"]}'
      , events      :
          [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "a"]
          , [SAX_OPEN_ARRAY   , undefined]
          , [SAX_VALUE       , 'b']
          , [SAX_VALUE       , 'c']
          , [SAX_CLOSE_ARRAY  , undefined]
          , [SAX_CLOSE_OBJECT , undefined]
          
          
          ]
      }
    , array_of_objs :
      { text        : '[{"a":"b"}, {"c":"d"}]'
      , events      :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_OPEN_OBJECT  , 'a']
        , [SAX_VALUE       , 'b']
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_OPEN_OBJECT  , 'c']
        , [SAX_VALUE       , 'd']
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , two_keys  :
      { text    : '{"a": "b", "c": "d"}'
      , events  :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "a"]
        , [SAX_VALUE       , "b"]
        , [SAX_KEY         , "c"]
        , [SAX_VALUE       , "d"]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , key_true  :
      { text    : '{"foo": true, "bar": false, "baz": null}'
      , events  :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE       , true]
        , [SAX_KEY         , "bar"]
        , [SAX_VALUE       , false]
        , [SAX_KEY         , "baz"]
        , [SAX_VALUE       , null]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , obj_strange_strings  :
      { text               : 
        '{"foo": "bar and all\\\"", "bar": "its \\\"nice\\\""}'
      , events             :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "foo"]
        , [SAX_VALUE         , 'bar and all"']
        , [SAX_KEY           , "bar"]
        , [SAX_VALUE         , 'its "nice"']
        , [SAX_CLOSE_OBJECT   , undefined]
        
        
        ]
      } 
    , bad_foo_bar         :
      { text              : 
          '["foo", "bar"'
       , events           :
         [ [SAX_OPEN_ARRAY   , undefined]
         , [SAX_VALUE       , 'foo']
         , [SAX_VALUE       , 'bar']
         , [FAIL_EVENT       , undefined]
         ]
       }
    , string_invalid_escape:
      { text             : 
          '["and you can\'t escape thi\s"]'
       , events          :
         [ [SAX_OPEN_ARRAY   , undefined]
         , [SAX_VALUE       , 'and you can\'t escape this']
         , [SAX_CLOSE_ARRAY  , undefined]
        ]
       }
    , nuts_and_bolts :
      { text         : '{"boolean, true": true' +
                       ', "boolean, false": false' +
                       ', "null": null }'
       , events          :
         [ [SAX_OPEN_OBJECT , undefined]
         , [SAX_VALUE       , "boolean, true"]
         , [SAX_VALUE        , true]
         , [SAX_KEY          , "boolean, false"]
         , [SAX_VALUE        , false]
         , [SAX_KEY          , "null"]
         , [SAX_VALUE        , null]
         , [SAX_CLOSE_OBJECT  , undefined]
         
         
         ]
      }
    , frekin_string:
      { text    : '["\\\\\\"\\"a\\""]'
      , events  :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , '\\\"\"a\"']
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , array_of_string_insanity  :
      { text    : '["\\\"and this string has an escape at the beginning",' +
                  '"and this string has no escapes"]'
      , events  :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , "\"and this string has an escape at the beginning"]
        , [SAX_VALUE       , "and this string has no escapes"]
        , [SAX_CLOSE_ARRAY  , undefined]
        
        
        ]
      }
    , non_utf8           :
      { text   : 
        '{"CoreletAPIVersion":2,"CoreletType":"standalone",' +
        '"documentation":"A corelet that provides the capability to upload' +
        ' a folder’s contents into a user’s locker.","functions":[' + 
        '{"documentation":"Displays a dialog box that allows user to ' +
        'select a folder on the local system.","name":' +
        '"ShowBrowseDialog","parameters":[{"documentation":"The ' +
        'callback function for results.","name":"callback","required":' +
        'true,"type":"callback"}]},{"documentation":"Uploads all mp3 files' +
        ' in the folder provided.","name":"UploadFolder","parameters":' +
        '[{"documentation":"The path to upload mp3 files from."' +
        ',"name":"path","required":true,"type":"string"},{"documentation":' +
        ' "The callback function for progress.","name":"callback",' +
        '"required":true,"type":"callback"}]},{"documentation":"Returns' +
        ' the server name to the current locker service.",' +
        '"name":"GetLockerService","parameters":[]},{"documentation":' +
        '"Changes the name of the locker service.","name":"SetLockerSer' +
        'vice","parameters":[{"documentation":"The value of the locker' +
        ' service to set active.","name":"LockerService","required":true' +
        ',"type":"string"}]},{"documentation":"Downloads locker files to' +
        ' the suggested folder.","name":"DownloadFile","parameters":[{"' +
        'documentation":"The origin path of the locker file.",' +
        '"name":"path","required":true,"type":"string"},{"documentation"' +
        ':"The Window destination path of the locker file.",' +
        '"name":"destination","required":true,"type":"integer"},{"docum' +
        'entation":"The callback function for progress.","name":' +
        '"callback","required":true,"type":"callback"}]}],' +
        '"name":"LockerUploader","version":{"major":0,' +
        '"micro":1,"minor":0},"versionString":"0.0.1"}'
      , events : 
        [ [ SAX_OPEN_OBJECT  , "CoreletAPIVersion"]
        , [ SAX_VALUE       , 2 ]
        , [ SAX_KEY         , "CoreletType"]
        , [ SAX_VALUE       , "standalone" ]
        , [ SAX_KEY         , "documentation"]
        , [ SAX_VALUE       , "A corelet that provides the capability to upload a folder’s contents into a user’s locker."]
        , [ SAX_KEY          , "functions"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "Displays a dialog box that allows user to select a folder on the local system."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "ShowBrowseDialog"]
        , [ SAX_KEY         , "parameters"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The callback function for results."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "Uploads all mp3 files in the folder provided."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "UploadFolder"]
        , [ SAX_KEY         , "parameters"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The path to upload mp3 files from."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "path"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "string"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The callback function for progress."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true ]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "Returns the server name to the current locker service."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "GetLockerService"]
        , [ SAX_KEY         , "parameters"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "Changes the name of the locker service."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "SetLockerService"]
        , [ SAX_KEY         , "parameters"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The value of the locker service to set active."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "LockerService" ]
        , [ SAX_KEY         , "required" ]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "string"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "Downloads locker files to the suggested folder."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "DownloadFile"]
        , [ SAX_KEY         , "parameters"]
        , [ SAX_OPEN_ARRAY   , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The origin path of the locker file."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "path"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "string"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The Window destination path of the locker file."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "destination"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "integer"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_OPEN_OBJECT  , "documentation"]
        , [ SAX_VALUE       , "The callback function for progress."]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_KEY         , "required"]
        , [ SAX_VALUE       , true]
        , [ SAX_KEY         , "type"]
        , [ SAX_VALUE       , "callback"]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_CLOSE_ARRAY  , undefined]
        , [ SAX_KEY         , "name"]
        , [ SAX_VALUE       , "LockerUploader"]
        , [ SAX_KEY         , "version"]
        , [ SAX_OPEN_OBJECT  , "major"]
        , [ SAX_VALUE       , 0]
        , [ SAX_KEY         , "micro"]
        , [ SAX_VALUE       , 1]
        , [ SAX_KEY         , "minor"]
        , [ SAX_VALUE       , 0]
        , [ SAX_CLOSE_OBJECT , undefined]
        , [ SAX_KEY         , "versionString"]
        , [ SAX_VALUE       , "0.0.1"]
        , [ SAX_CLOSE_OBJECT , undefined]
        ]
      }
    , array_of_arrays    :
      { text   : '[[[["foo"]]]]'
      , events : 
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_OPEN_ARRAY  , undefined]
        , [SAX_OPEN_ARRAY  , undefined]
        , [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , "foo"]
        , [SAX_CLOSE_ARRAY , undefined]
        , [SAX_CLOSE_ARRAY , undefined]
        , [SAX_CLOSE_ARRAY , undefined]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , low_overflow :
      { text       : '[-9223372036854775808]'
      , events     : 
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , -9223372036854775808]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , high_overflow :
      { text       : '[9223372036854775808]'
      , events     : 
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , 9223372036854775808]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , floats       :
      { text       : '[0.1e2, 1e1, 3.141569, 10000000000000e-10]'
      , events     :
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , 0.1e2]
        , [SAX_VALUE      , 1e1]
        , [SAX_VALUE      , 3.141569]
        , [SAX_VALUE      , 10000000000000e-10]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , numbers_game :
      { text       : '[1,0,-1,-0.3,0.3,1343.32,3345,3.1e124,'+
                     ' 9223372036854775807,-9223372036854775807,0.1e2, ' +
                     '1e1, 3.141569, 10000000000000e-10,' +
                     '0.00011999999999999999, 6E-06, 6E-06, 1E-06, 1E-06,'+
                     '"2009-10-20@20:38:21.539575", 9223372036854775808,' +
                     '123456789,-123456789,' +
                     '2147483647, -2147483647]'
      , events     :
        [ [SAX_OPEN_ARRAY  , undefined]
        , [SAX_VALUE      , 1]
        , [SAX_VALUE      , 0]
        , [SAX_VALUE      , -1]
        , [SAX_VALUE      , -0.3]
        , [SAX_VALUE      , 0.3]
        , [SAX_VALUE      , 1343.32]
        , [SAX_VALUE      , 3345]
        , [SAX_VALUE      , 3.1e124]
        , [SAX_VALUE      , 9223372036854775807]
        , [SAX_VALUE      , -9223372036854775807]
        , [SAX_VALUE      , 0.1e2]
        , [SAX_VALUE      , 1e1]
        , [SAX_VALUE      , 3.141569]
        , [SAX_VALUE      , 10000000000000e-10]
        , [SAX_VALUE      , 0.00011999999999999999]
        , [SAX_VALUE      , 6E-06]
        , [SAX_VALUE      , 6E-06]
        , [SAX_VALUE      , 1E-06]
        , [SAX_VALUE      , 1E-06]
        , [SAX_VALUE      , "2009-10-20@20:38:21.539575"]
        , [SAX_VALUE      , 9223372036854775808]
        , [SAX_VALUE      , 123456789]
        , [SAX_VALUE      , -123456789]
        , [SAX_VALUE      , 2147483647]
        , [SAX_VALUE      , -2147483647]
        , [SAX_CLOSE_ARRAY , undefined]
        
        
        ]
      }
    , johnsmith  :
      { text     : '{ "firstName": "John", "lastName" : "Smith", "age" : ' +
                   '25, "address" : { "streetAddress": "21 2nd Street", ' + 
                   '"city" : "New York", "state" : "NY", "postalCode" : ' +
                   ' "10021" }, "phoneNumber": [ { "type" : "home", ' + 
                   '"number": "212 555-1234" }, { "type" : "fax", ' + 
                   '"number": "646 555-4567" } ] }'
      , events   :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "firstName"]
        , [SAX_VALUE        , "John"]
        , [SAX_KEY          , "lastName"]
        , [SAX_VALUE        , "Smith"]
        , [SAX_KEY          , "age"]
        , [SAX_VALUE        , 25]
        , [SAX_KEY          , "address"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "streetAddress"]
        , [SAX_VALUE        , "21 2nd Street"]
        , [SAX_KEY          , "city"]
        , [SAX_VALUE        , "New York"]
        , [SAX_KEY          , "state"]
        , [SAX_VALUE        , "NY"]
        , [SAX_KEY          , "postalCode"]
        , [SAX_VALUE        , "10021"]
        , [SAX_CLOSE_OBJECT  , undefined]
        , [SAX_KEY          , "phoneNumber"]
        , [SAX_OPEN_ARRAY    , undefined]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "type"]
        , [SAX_VALUE        , "home"]
        , [SAX_KEY          , "number"]
        , [SAX_VALUE        , "212 555-1234"]
        , [SAX_CLOSE_OBJECT  , undefined]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "type"]
        , [SAX_VALUE        , "fax"]
        , [SAX_KEY          , "number"]
        , [SAX_VALUE        , "646 555-4567"]
        , [SAX_CLOSE_OBJECT  , undefined]
        , [SAX_CLOSE_ARRAY   , undefined]
        , [SAX_CLOSE_OBJECT  , undefined]
        ]
      }
    , array_null :
      { text     : '[null,false,true]'
      , events   :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , null]
        , [SAX_VALUE       , false]
        , [SAX_VALUE       , true]
        , [SAX_CLOSE_ARRAY  , undefined]
        ]
      }
    , empty_array_comma :
      { text    : '{"a":[],"c": {}, "b": true}'
      , events  :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "a"]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [SAX_KEY         , "c"]
        , [SAX_OPEN_OBJECT  , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_KEY         , "b"]
        , [SAX_VALUE       , true]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    , incomplete_json_terminates_ending_in_number :
      { text    : '[[1,2,3],[4,5'
      , events  :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , 1]
        , [SAX_VALUE       , 2]
        , [SAX_VALUE       , 3]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , 4]    
        , [FAIL_EVENT       , undefined]    
        ]
      }
    , incomplete_json_terminates_ending_in_comma :
      { text    : '[[1,2,3],'
      , events  :
        [ [SAX_OPEN_ARRAY   , undefined]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , 1]
        , [SAX_VALUE       , 2]
        , [SAX_VALUE       , 3]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [FAIL_EVENT       , undefined]
        ]
      }
    , json_org  :
      { text    : 
          ('{\r\n' +
          '          "glossary": {\n' +
          '              "title": "example glossary",\n\r' +
          '      \t\t"GlossDiv": {\r\n' +
          '                  "title": "S",\r\n' +
          '      \t\t\t"GlossList": {\r\n' +
          '                      "GlossEntry": {\r\n' +
          '                          "ID": "SGML",\r\n' +
          '      \t\t\t\t\t"SortAs": "SGML",\r\n' +
          '      \t\t\t\t\t"GlossTerm": "Standard Generalized ' + 
          'Markup Language",\r\n' +
          '      \t\t\t\t\t"Acronym": "SGML",\r\n' +
          '      \t\t\t\t\t"Abbrev": "ISO 8879:1986",\r\n' +
          '      \t\t\t\t\t"GlossDef": {\r\n' +
          '                              "para": "A meta-markup language,' +
          ' used to create markup languages such as DocBook.",\r\n' +
          '      \t\t\t\t\t\t"GlossSeeAlso": ["GML", "XML"]\r\n' +
          '                          },\r\n' +
          '      \t\t\t\t\t"GlossSee": "markup"\r\n' +
          '                      }\r\n' +
          '                  }\r\n' +
          '              }\r\n' +
          '          }\r\n' +
          '      }\r\n')
      , events  :
        [ [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "glossary"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "title"]
        , [SAX_VALUE       , "example glossary"]
        , [SAX_KEY         , "GlossDiv"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "title"]
        , [SAX_VALUE       , "S"]
        , [SAX_KEY         , "GlossList"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "GlossEntry"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "ID"]
        , [SAX_VALUE       , "SGML"]
        , [SAX_KEY         , "SortAs"]
        , [SAX_VALUE       , "SGML"]
        , [SAX_KEY         , "GlossTerm"]
        , [SAX_VALUE       , "Standard Generalized Markup Language"]
        , [SAX_KEY         , "Acronym"]
        , [SAX_VALUE       , "SGML"]
        , [SAX_KEY         , "Abbrev"]
        , [SAX_VALUE       , 'ISO 8879:1986']
        , [SAX_KEY         , "GlossDef"]
        , [SAX_OPEN_OBJECT , undefined]
        , [SAX_VALUE       , "para"]
        , [SAX_VALUE       , 'A meta-markup language, used to create markup languages such as DocBook.']
        , [SAX_KEY         , "GlossSeeAlso"]
        , [SAX_OPEN_ARRAY   , undefined]
        , [SAX_VALUE       , "GML"]
        , [SAX_VALUE       , "XML"]
        , [SAX_CLOSE_ARRAY  , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_KEY         , "GlossSee"]
        , [SAX_VALUE       , "markup"]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        , [SAX_CLOSE_OBJECT , undefined]
        
        
        ]
      }
    };

describe('clarinet', function(){

   var expectedEventNames = [ SAX_VALUE        
                            , SAX_KEY          
                            , SAX_OPEN_OBJECT  
                            , SAX_CLOSE_OBJECT 
                            , SAX_OPEN_ARRAY   
                            , SAX_CLOSE_ARRAY  
                            , FAIL_EVENT
                            ];
   
   for (var key in docs) {
      
      var doc = docs[key];
      
      describe('case ' + key, function(doc){
                  
         var bus = pubSub(),
             blackBoxRecording = eventBlackBox(bus, expectedEventNames);
         
         clarinet(bus);
         
         bus(STREAM_DATA).emit(doc.text);
         bus(STREAM_END).emit();

         var actualEventOrder = blackBoxRecording.map( function(e){
            return e.type; 
         });
         var expectedEventOrder = doc.events.map( function(a){
            return a[0];
         });         
         
         it('should have the correct event types', function(){
            expect( actualEventOrder ).toEqual( expectedEventOrder );
         });
         
         doc.events.forEach(function( expectedEvent, i ){

            var blackBoxSlice = blackBoxRecording[i];

            // don't worry about the value for error events:
            if(blackBoxSlice.type != FAIL_EVENT ){
               it( i + 'th event should have the correct event value', function(){
                  expect( blackBoxSlice.val  ).toEqual( expectedEvent[1] );
               });
            }
         });

      }.bind(null, doc));
   }
});
