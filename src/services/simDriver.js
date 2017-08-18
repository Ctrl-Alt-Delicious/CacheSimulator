'use strict';

angular.module('Simulator').factory('SimDriver', function SimDriverService() {

    var ctrl = this;
    //contains pause/play/etc api for the views to use

    var queue = [];

    ctrl.getMemAcceses = function() {
        return queue;
    };

    ctrl.setQueue = function(parsedData) {
        //mem queue template object
        var newLine = {
            address: "",
            tag: "0x4FFF",
            index: "0x4490A",
            offset: "0x1002"
        }
        for (var line of parsedData) {
            var l = {};
            Object.assign(l, newLine)
            l.address = line
            queue.push(l)
        }
    }

    return ctrl;
});
