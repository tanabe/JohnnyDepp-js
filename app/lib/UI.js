//this is UI.js
JD.require(
  "exlib/jquery-1.5.min.js",
  "lib/config/Config.js",
  "lib/util/MathUtil.js",
  function () {
    //callback
  }
);
var renderDepp = function(src) {
  $("#imagePlaceHolder").html("<img src=" + src + ">");
};

