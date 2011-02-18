(function(window) {
  //TODO cache implements
  var loadedScripts = [];

  var context = "";
  var running = false;
  var rootProcessor = new Processor();
  var lastProcessor = null;

  /**
   *  relative path to absolute path
   *  @param base base absolute path
   *  @param target target relative path
   *  @return relative path
   */
  var relativeToAbsolute = function(base, target) {
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

  /**
   *  get absolute path
   *  @param some path
   *  @return absolute path
   */
  var getAbsolutePath = function(path) {
    var tempAnchor = document.createElement("a");
    tempAnchor.href = path;
    return tempAnchor.href;
  };

  /**
   *  remove protocol from url
   *  @param url url
   */
  var removeProtocol = function(url) {
    return url.match(/^[^\/]+:(.*)/)[1];
  };

  /**
   *  remove file name from path
   *  @param path
   *  @return file name removed path
   */
  var removeFileName = function(path) {
    return path.match(/^(.*\/)/)[1];
  };


  /**
   *  load script file
   *  @param path file path
   *  @param next callback
   */
  var loadScript = function(path, next) {
    //console.log("load script ", path);
    var fileName = path.match(/\/?([^\/]+\.js$)/)[1];
    //console.log("target file name is ", fileName);

    if (/^https?/.test(path)) {
      //context = "";
    } else {
      //console.log("current context is ", context);
      if (context) {
        path = relativeToAbsolute(context, path);
        //console.log("new path is ", path);
      } else {
        //remove protocol
        context = removeProtocol(getAbsolutePath(path));//.match(/^[^\/]+:(.*)/)[1];
        //context = path.match(new RegExp("(^.*)" + fileName))[1];
      }
    }
    //console.log("path is ", path);
    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path;

    if (script.addEventListener) {
      script.addEventListener("load", function() {
        next();
      }, false);
    } else if (script.attachEvent) {
      var interval = setInterval(function() {
        clearInterval(interval);
        next();
      }, 50);

      //didn't work
      //script.attachEvent("onreadystatechange", function() {
      //  next();
      //});
    } else {
      script.onload = function() {
        next();
      };
    }
    document.getElementsByTagName("head")[0].appendChild(script);
  };

  /**
   *  initialize
   */
  var initialize = function() {
    //console.log("running ", running);
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    //console.log(args);
    //console.log(callback);

    var localProcessor = new Processor();
    var onLoadProcess = new Process();
    onLoadProcess.execute = function() {
      callback();
      this.done();
    };

    for (var i = 0; i < args.length; i++) {
      var path = args[i];
      var process = new Process();
      process.path = path;
      process.execute = function() {
        var self = this;
        loadScript(self.path, function() {
          self.done();
        });
      };
      localProcessor.addCallback(null, function() {
        //console.log("local processor done!!!");
      });
      localProcessor.add(process);
    }

    localProcessor.add(onLoadProcess);

    if (!running) {
      rootProcessor.insertBefore(localProcessor);
      rootProcessor.addCallback(null, function() {
        running = false;
        //console.log("done!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      });
      rootProcessor.execute();
    } else {
      lastProcessor.insertBefore(localProcessor);
    }
    running = true;
    lastProcessor = localProcessor;
  };

  /**
   *  define JD object
   */
  window.JD = {
    require: function() {
      var args = Array.prototype.slice.call(arguments);
      initialize.apply(null, args);
    },

    setContext: function(path) {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.match(new RegExp(path + "$"))) {
          context = removeFileName(removeProtocol(scripts[i].src));
        }
      }
    }

  };
})(window);
