JohnnyDepp.js: script loader library
---
##resolve dependencies
this library resolve dependencies

##example
Application.js
    JD.requre(
      "lib/Foo.js",
      "lib/Bar.js",
      function() {
        //on load callback
      }
    );

lib/Foo.js
    JD.requre(
      "../config/Config.js",
      function() {
        //on load callback
      }
    );

Application.js loads

 * lib/Foo.js
 * config/Config.js
 * lib/Bar.js

