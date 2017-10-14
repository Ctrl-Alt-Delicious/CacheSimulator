'use strict';

const os = require('os');

angular.module('Simulator').factory('FileParser', ['SimDriver', '$rootScope', function FileParserService(simDriver, $rootScope) {

  let ctrl = this;

  //Used as a helper for when uploading a trace file
  //TODO

  let lines = "";

  ctrl.subscribe = function(scope, callback) {
    let handler = $rootScope.$on('fileParsed', callback);
    scope.$on('$destroy', handler);
  };

  ctrl.notify = function() {
    $rootScope.$emit('fileParsed');
  };

  ctrl.parseFile = function(input, C, S, B) {
    //use node's value for native OS end of line
    lines = input.split(os.EOL);
    //many text editors end in a new line char
    if (lines[lines.length - 1] === "") {
      lines.splice(lines.length - 1)
    }

    for (let line of lines) {
      simDriver.addToQueue(parseLineToAddress(line, C, S, B));
    }
    simDriver.setQueue(lines); // Is this asynchronous?
    ctrl.notify();
  };

  ctrl.getRawData = function() {
    return lines;
  };

  return ctrl;

}]);