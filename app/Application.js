JD.setContext("app/Application.js");
JD.require(
  "exlib/jquery-1.5.min.js",
  "lib/config/Config.js",
  "lib/UI.js",
  function () {
    //depps defined at Config.js
    //getRandomInt defined at MathUtil.js loaded at UI.js
    var src = depps[getRandomInt(depps.length)];

    //renderDepp defined at UI.js
    $(function() {
      renderDepp(src);
    });
  }
);
