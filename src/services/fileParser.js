'use strict';

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
        rawData = input;
        simDriver.setQueue(input)
        ctrl.notify()
    }

    ctrl.getRawData = function() {
        return rawData;
    }

    return ctrl;
}]);
