'use strict';

angular.module('Simulator').factory('simulation', function() {

    let ctrl = this;

    ctrl.getNextMem = function() {
        return '0x100044322';
    };

});
