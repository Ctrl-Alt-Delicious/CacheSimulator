'use strict';

angular.module('Simulator').component('cacheDisplay', {
    templateUrl: 'src/cacheDisplay.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheDisplayController],
    bindings: {}
});

function CacheDisplayController($scope, simDriver, fileParser) {

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
                policy: "put policy here",
                blockSize: 1
            });
            $scope.showCache[ctrl.caches.length - 1] = true;
            $scope.$emit('updatedCacheList', ctrl.caches);
        }

    };

    $scope.removeCache = function(index) {
        //TODO May want to remove by index
        if (ctrl.caches.length > 1) {
            ctrl.caches.pop()
            $scope.showCache[ctrl.caches.length] = false;
        }
        $scope.$emit('updatedCacheList', ctrl.caches);
    };

    //Constants
    $scope.policies = ["FIFO", "LRU", "LFU"]
    $scope.blockSizes = [16, 24, 48, 64]
    $scope.cacheSizes = [64, 128, 256]
    $scope.associativities = [2, 4, 8, 16]

    $scope.showCache = [true, false, false];
}
