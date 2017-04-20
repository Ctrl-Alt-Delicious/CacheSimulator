'use strict';

angular.module('Simulator').factory('SimDriver', function SimDriverService() {

    var ctrl = this;
    //contains pause/play/etc api for the views to use

    var queue = [];

    ctrl.getMemAcceses = function() {
        return queue;
    };

    ctrl.setQueue = function(parsedData) {
        var newLine = {
            address: parsedData,
            tag: "0x4FFF",
            index: "0x4490A",
            offset: "0x1002"
        }
        queue.push(newLine)
    }

    return ctrl;
});
