'use strict';

const os = require('os')

angular.module('Simulator').factory('FileParser', ['SimDriver', '$rootScope', function FileParserService(simDriver, $rootScope) {

    var ctrl = this;

    //Used as a helper for when uploading a trace file
    //TODO

    var rawData = "";

    ctrl.subscribe = function(scope, callback) {
        var handler = $rootScope.$on('fileParsed', callback);
        scope.$on('$destroy', handler);
    }

    ctrl.notify = function() {
        $rootScope.$emit('fileParsed');
    }

    ctrl.parseFile = function(input) {
        //use node's value for native OS end of line
        rawData = input.split(os.EOL)
        //many text editors end in a new line char
        if (rawData[rawData.length - 1] === "") {
            rawData.splice(rawData.length - 1)
        }
        simDriver.setQueue(rawData)
        ctrl.notify()
    }

    ctrl.getRawData = function() {
        return rawData;
    }

    return ctrl;
}]);
