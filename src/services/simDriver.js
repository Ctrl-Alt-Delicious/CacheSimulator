'use strict';

angular.module('Simulator').factory('SimDriver', function SimDriverService() {

    var ctrl = this;

    //contains pause/play/etc api for the views to use

    ctrl.getMemAcceses = function() {
        return [{
            address: "0x1444202",
            tag: "0x4FFF",
            index: "0x4490A",
            offset: "0x1002"
        }];
    };

    return ctrl;
});
