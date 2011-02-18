(function(window) {
  var loadedScripts = [];
  var context = "";

  var getAbsolutePath = function(base, target) {
    var result = base.match(/^\/.*\//)[0];
    var tree = target.split(/\//);
    var fileName = tree.pop();
    while (tree.length > 0) {
      var next = tree.shift();
      if (/^\.\.$/.test(next)) {
        result = result.replace(/[^\/]+\/$/, "");
      } else {
        result += next + "/";
      }
    }
    result += fileName;
    return result;
  };

  var loadScript = function(path) {
    console.log("load script ", path);
    var fileName = path.match(/\/?([^\/]+\.js$)/)[1];
    console.log("target file name is ", fileName);

    if (/^https?/.test(path)) {
      context = "";
    } else {
      console.log("current context is ", context);

      if (context) {
        path = getAbsolutePath(context, "../config/Config.js");
        console.log("new path is ", path);
      } else {
        var tempAnchor = document.createElement("a");
        tempAnchor.href = path;
        console.log(tempAnchor.href);
        path = tempAnchor.href.match(/^[^\/]+:(.*)/)[1];
        context = path.match(new RegExp("(^.*)" + fileName))[1];
      }
    }
    console.log("path is ", path);
    script = document.createElement("script");
    script.src = path;
    script.onload = function() {
      console.log(this.src);
    };
    var head = document.getElementsByTagName("head")[0];
    head.insertBefore(script, head.firstChild);
  };

  window.JD = {
    requre: function(path) {
      loadScript(path);
    }
  };
})(window);
