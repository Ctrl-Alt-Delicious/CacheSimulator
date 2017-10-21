'use strict';

angular.module('Simulator').factory('SimDriver', function SimDriverService() {

    let ctrl = this;
    //contains pause/play/etc api for the views to use

    let queue = [];

    ctrl.getMemAcceses = function() {
        return queue;
    };

    ctrl.setQueue = function(parsedData) {
        //mem queue template object
        let returnQueue = [];
        let newLine = {
            address: '',
            tag: '0x4FFF',
            index: '0x4490A',
            offset: '0x1002'
        };
        for (let line of parsedData) {
            let l = {};
            Object.assign(l, newLine);
            l.address = line.address;
            returnQueue.push(l);
        }
        return returnQueue;
    };

    ctrl.addToQueue = function(item) {
        queue.push(item);
    };

    return ctrl;
});
