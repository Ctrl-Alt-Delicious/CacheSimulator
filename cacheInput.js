'use strict';

angular.module('Simulator').component('cacheInput', {
    templateUrl: 'cacheInput.html',
    //add any dependencies below
    controller: ['$scope', CacheInputController],
    bindings: {}
});

function CacheInputController($scope) {

    var ctrl = this;
    ctrl.policy = "";
    ctrl.blockSize = 1;
    ctrl.fileName = "Graham.trace"

    ctrl.caches = [{
        title: "L1",
        policy: "",
        blockSize: 1
    }];

    ctrl.memQueue = [{
            address: "0xDEADBEEF",
            tag: "0x4FFF",
            index: "0x4490A",
            offset: "0x1002"
        },
        {
            address: "0x1001BEEF",
            tag: "0x4AAF",
            index: "0x2000293",
            offset: "0x12"
        }
    ]

    ctrl.addCache = function() {
        ctrl.caches.push({
            title: "L" + (ctrl.caches.length + 1),
            policy: "",
            blockSize: 1
        });
        //TODO Add cache in the other view
    };

    $scope.removeCache = function (cache) {
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
