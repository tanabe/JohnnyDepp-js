(function(window) {
  var loadedScripts = [];
  var context = "";
  var running = false;
  var globalProcessor = new Processor();

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

  var loadScript = function(path, callback) {
    console.log("load script ", path);
    var fileName = path.match(/\/?([^\/]+\.js$)/)[1];
    console.log("target file name is ", fileName);

    if (/^https?/.test(path)) {
      context = "";
    } else {
      console.log("current context is ", context);

      if (context) {
        path = getAbsolutePath(context, path);
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
    script.type = "text/javascript";
    script.src = path;
    script.onload = function() {
      console.log(this.src);
      callback();
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  };

  /**
   *
   */
  var initialize = function() {
    console.log("running ", running);
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    console.log(args);

    var localProcessor = new Processor();

    for (var i = 0; i < args.length; i++) {
      var path = args[i];
      var process = new Process();
      process.execute = function() {
        var self = this;
        loadScript(path, function() {
          self.done();
        });
      };
      localProcessor.add(process);
    }

    if (!running) {
      globalProcessor.add(localProcessor);
      globalProcessor.addCallback(null, function() {
        console.log("done!!!!!");
      });
      globalProcessor.execute();
    } else {
      globalProcessor.add(localProcessor);
    }
    running = true;
  };

  window.JD = {
    requre: function() {
      var args = Array.prototype.slice.call(arguments);
      initialize.apply(null, args);
    }
  };
})(window);
