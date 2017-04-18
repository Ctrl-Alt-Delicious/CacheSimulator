'use strict';

angular.module('Simulator').component('cacheDisplay', {
    templateUrl: 'src/cacheDisplay.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', CacheDisplayController],
    bindings: {}
});

function CacheDisplayController($scope, simDriver) {

    var ctrl = this;

    ctrl.policy = "";
    ctrl.blockSize = 1;
    ctrl.fileName = "Graham.trace"

    ctrl.caches = [{
        title: "L1",
        policy: "",
        blockSize: 1
    }];

    ctrl.memQueue = simDriver.getMemAcceses();

    ctrl.addCache = function() {
        if (ctrl.caches.length < 3) {
            ctrl.caches.push({
                title: "L" + (ctrl.caches.length + 1),
                policy: "",
                blockSize: 1
            });
        }
        //TODO Add cache in the other view
    };

    $scope.removeCache = function(cache) {
        var index = ctrl.caches.indexOf(cache);
        ctrl.caches.splice(index, 1);
        //TODO remove the cache in other view
    };

    //Constants
    $scope.policies = ["FIFO", "LRU", "LFU"]
    $scope.blockSizes = [16, 24, 48, 64]
    $scope.cacheSizes = [64, 128, 256]
    $scope.associativities = [2, 4, 8, 16]
}
