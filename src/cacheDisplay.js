'use strict';

const {ipcRenderer} = require('electron')

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
    ctrl.fileName = ""

    var B_min = 3, B_max = 7;

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
            //Emit sends an event to the parent controller/component
            $scope.$emit('updatedCacheList', ctrl.caches);
        }

    };

    ctrl.removeCache = function(index) {
        //TODO May want to remove by index
        if (ctrl.caches.length > 1) {
            ctrl.caches.pop()
            $scope.showCache[ctrl.caches.length] = false;
        }
        $scope.$emit('updatedCacheList', ctrl.caches);
    };

    ctrl.handleUpload = function() {
        //Sends an asynchronous event to the main process (main.js)
        //Can add arguments if necessary
        ipcRenderer.send('uploadFile')
    }

    ipcRenderer.on('fileNameReceived', (e, fName) => {
        var directoryInd = fName.lastIndexOf('/')
        ctrl.fileName = fName.substring(directoryInd + 1)
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
    })

    ipcRenderer.on('fileDataReceived', (e, fData) => {
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
        console.log(fData)
    })

    //Constants
    $scope.policies = ["FIFO", "LRU", "LFU"]
    $scope.blockSizes = []
    $scope.cacheSizes = [64, 128, 256]
    $scope.associativities = [2, 4, 8, 16]

    $scope.showCache = [true, false, false];
    
    for (var i = B_min; i <= B_max; i++) {
        $scope.blockSizes.push(Math.pow(2, i));
    }
    
}
