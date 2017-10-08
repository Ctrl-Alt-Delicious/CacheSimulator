'use strict';

// const {ipcRenderer} = require('electron')

angular.module('Simulator').component('cacheDisplay', {
    templateUrl: 'src/cacheDisplay.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheDisplayController],
    bindings: {}
});

function CacheDisplayController($scope, simDriver, fileParser) {

    var ctrl = this;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;
    
    ctrl.clickCache = function(index) {
        $scope.$parent.changeView(index)
    }

    ctrl.removeCache = function(index, event) {
        let caches = ctrl.cacheInfo.caches;
        if (event) {
            event.stopPropagation();
            event.preventDefault();
            if (caches.length > 1) {
                ctrl.cacheInfo.caches[caches.length - 1].active = false;
                caches.splice(index, 1);
                for(var i = 1; i <= caches.length; i++) {
                    caches[i-1].title = "L" + i;
                }
            }
            if (caches.length === 1) {
                ctrl.cacheInfo.disableDeleteCache = true;
            }
            ctrl.cacheInfo.caches = caches;
        }
        $scope.emit('updateCacheInfo', ctrl.cacheInfo);
    };

    // ipcRenderer.on('fileNameReceived', (e, fPath) => {
    //     //Use node's functions for parsing file path to base name on all native OS
    //     ctrl.fileName = path.basename(fPath)
    //     //This forces the angular rendering lifecycle to update the value
    //     $scope.$digest();
    // })

    // //subscribe to fileParser notifications when file is parsed
    // fileParser.subscribe($scope, () => {
    //     //ask for new mem traces in queue
    //     console.log("updating traces")
    //     ctrl.memQueue = simDriver.getMemAcceses()
    // })

    // ipcRenderer.on('fileDataReceived', (e, fData) => {
    //     fileParser.parseFile(fData)
    //     //This forces the angular rendering lifecycle to update the value
    //     $scope.$digest();

    // })

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });
}
