/**
 * command pattern like library
 * (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 * Licensed under the MIT License.
 */
(function(window) {

  /**
   * Process constructor
   */
  var Process = function() {

    var result = {};
    var callbacks = [];

    /**
     *  execute abstract function
     */
    function execute() {
      done();
    }

    /**
     *  pause abstract function
     */
    function pause() {
    }

    /**
     *  resume abstract function
     */
    function resume() {
    }

    /**
     *  done
     */
    function done() {
      //fire callbacks
      for (var i = 0, length = callbacks.length; i < length; i++) {
        callbacks[i].callback.apply(callbacks[i].scope, [this]);
      }
    }

    /**
     *  set result object
     *  @result result object
     */
    function setResult(result) {
      this.result = result;
    }

    /**
     *  set callback function
     *  @param scope owner of callback function
     *  @param callback this function will fire after previous process
     */
    function addCallback(scope, callback) {
      callbacks.push({scope: scope, callback: callback});
    }

    /**
     *  unset callback function
     *  @param callback callback function
     */
    function removeCallback(callback) {
      for (var i = 0, length = callback.length; i < length; i++) {
        if (callbacks[i].callback == callback) {
          callbacks.splice(i, 1);
          return;
        }
      }
    }

    var Process = {};
    Process.result = result;
    Process.execute = execute;
    Process.pause = pause;
    Process.resume = resume;
    Process.done = done;
    Process.setResult = setResult;
    Process.addCallback = addCallback;
    Process.removeCallback = removeCallback;
    return Process;
  };

  /**
   *  Processor constructor extends Process
   */
  var Processor = function() {

    var processQueue = [];
    var currentProcesses = [];
    var running = false;
    var executed = false;
    var leftProcessesTotal = 0;
    var total = 0;
    var runningProcessor = null;

    /**
     *  execute
     */
    function execute() {
      if (executed) {
        return;
      }
      running = true;
      executed = true;
      this.executeProcesses();
    }

    /**
     *  execte processes
     */
    function executeProcesses() {
      if (processQueue.length > 0) {
        currentProcesses = processQueue.shift();
        leftProcessesTotal = currentProcesses.length;
        for (var i = 0, length = currentProcesses.length; i < length; i++) {
          var process = currentProcesses[i];
          process.setResult(this.result);
          process.addCallback(this, processCompleteHandler);
          if (process.isProcessor) {
            runningProcessor = process;
          }
          process.execute();
        }
      } else {
        this.done();
      }
    }

    /**
     *  progress complete callback function
     */
    function processCompleteHandler(process) {
      process.removeCallback(arguments.callee);
      leftProcessesTotal--;
      if (leftProcessesTotal === 0) {
        currentProcesses = [];
        this.executeProcesses();
      }
    }

    /**
     *  add process end of the queue
     *  @params any processes
     */
    function add() {
      processQueue.push([].slice.call(arguments));
      return this;
    }

    /**
     *  add process start of the queue
     *  @params any processes
     */
    function insertBefore() {
      processQueue.unshift([].slice.call(arguments));
      return this;
    }

    /**
     *  pause processes
     */
    function pauseProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].pause();
      }
    }

    /**
     *  resume processes
     */
    function resumeProcesses() {
      for (var i = 0, length = currentProcesses.length; i < length; i++) {
        currentProcesses[i].resume();
      }
    }

    /**
     *  return running child processor
     */
    function getRunningProcessor() {
      return runningProcessor;
    }

    var Processor = new Process();
    Processor.execute = execute;
    Processor.executeProcesses = executeProcesses;
    Processor.add = add;
    Processor.insertBefore = insertBefore;
    Processor.processCompleteHandler = processCompleteHandler;
    Processor.pauseProcesses = pauseProcesses;
    Processor.getRunningProcessor = getRunningProcessor;
    Processor.isProcessor = true;
    return Processor;
  }
  window.Process = Process;
  window.Processor = Processor;
})(window);

/**
 *  Johnny Depp is cool actor
 *  (c) Hideaki Tanabe <http://blog.kaihatsubu.com>
 *  Licensed under the MIT License.
 */
(function(window) {
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
    //FIXME for IE6..7
    if (!tempAnchor.href.match(/^http/)) {
      var url = location.href.toString().match(/(^.*\/)/)[1];
      return url + path;
    }
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
    var fileName = path.match(/\/?([^\/]+\.js$)/)[1];

    //absolute path
    if (/^(\/|(https?))/.test(path)) {
      //context = "";
    //relative path
    } else {
      if (context) {
        path = relativeToAbsolute(context, path);
      } else {
        //remove protocol
        context = removeProtocol(getAbsolutePath(path));//.match(/^[^\/]+:(.*)/)[1];
        //context = path.match(new RegExp("(^.*)" + fileName))[1];
      }
    }

    //check cache
    var fileURI = getAbsolutePath(path);
    //TODO use Array.indexOf
    for (var i = 0; i < loadedScripts.length; i++) {
      if (loadedScripts[i] === fileURI) {
        next();
        return;
      }
    }

    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path;

    //except IE
    if (script.addEventListener) {
      script.addEventListener("load", function() {
        loadedScripts.push(this.src);
        next();
      }, false);
    //IE does not work onload event, instead of use onreadystatechange
    } else if (script.attachEvent) {
      script.onreadystatechange  =  function() {
        if (this.readyState === "loaded" || this.readyState === "complete") {
          this.onreadystatechange = null;
          next();
        }
      };
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
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();

    var localProcessor = new Processor();
    var onLoadProcess = new Process();
    onLoadProcess.execute = function() {
      callback();
      this.done();
    };

    var processes = [];
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

      //parallel, concurrency test
      processes.push(process);
    }

    localProcessor.addCallback(null, function() {
    });

    //parallel, concurrency test
    localProcessor.add.apply(localProcessor, processes);
    localProcessor.add(onLoadProcess);

    if (!running) {
      rootProcessor.insertBefore(localProcessor);
      rootProcessor.addCallback(null, function() {
        running = false;
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
    /**
     *
     */
    require: function() {
      var args = Array.prototype.slice.call(arguments);
      initialize.apply(null, args);
    },

    /**
     *
     */
    setContext: function(path) {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.match(new RegExp(path + "$"))) {
          //FIXME IE6..7 is script.src returns relative path ex) foo/bar.js
          //then using getAbsolutePath
          context = removeFileName(removeProtocol(getAbsolutePath(scripts[i].src)));
        }
      }
    }

  };
})(window);
