JohnnyDepp.js: script loader library
---
##resolve dependencies
this library resolve dependencies

##example
in Application.js
    JD.require(
      "lib/Foo.js",
      "lib/Bar.js",
      function() {
        //on load callback
      }
    );

in lib/Foo.js
    JD.require(
      "../config/Config.js",
      function() {
        //on load callback
      }
    );

Application.js loads

 * lib/Foo.js
 * config/Config.js
 * lib/Bar.js

