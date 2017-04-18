'use strict';

angular.module('Simulator').component('cacheDetail', {
    templateUrl: 'src/cacheDetail.html',
    controller: ['$scope', 'SimDriver', CacheDetailController],
    bindings: {}
});

function CacheDetailController($scope, simDriver) {

    var ctrl = this;

    ctrl.test = "success";
}
