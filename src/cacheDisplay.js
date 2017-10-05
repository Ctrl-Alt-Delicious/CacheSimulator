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
    ctrl.B = ""
    ctrl.policySet = false;
    ctrl.blockSizeSet = false;
    ctrl.disableDeleteCache = true;
    ctrl.hide = false;

    var B_min = 3, B_max = 7;

    ctrl.caches = [{
        title: "L1",
        size: "Not Set",
        associativity: "Not Set",
        associativities: [],
        C: 1,
        S: 1
    }];

    ctrl.showCache = [true, false, false];

    //$scope.associativities = []

    ctrl.hideSideBar = function() {
        ctrl.hide = true;
    }

    ctrl.showSideBar = function() {
        ctrl.hide = false;
    }

    ctrl.clickCache = function(index) {
        $scope.$parent.changeView(index)
    }


    ipcRenderer.on('fileNameReceived', (e, fPath) => {
        //Use node's functions for parsing file path to base name on all native OS
        ctrl.fileName = path.basename(fPath)
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
    })

    //subscribe to fileParser notifications when file is parsed
    fileParser.subscribe($scope, () => {
        //ask for new mem traces in queue
        console.log("updating traces")
        ctrl.memQueue = simDriver.getMemAcceses()
    })

    ipcRenderer.on('fileDataReceived', (e, fData) => {
        fileParser.parseFile(fData)
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();

    })

    $scope.$on('updatedCaches', function(event, data) {
        var i = 0;
        for (cache of data) {
            ctrl.caches[i] = cache;
            i++;
        }
    });

    $scope.$on('updateShowCache', function(event, data) {
        var i = 0;
        for (var showCache of data) {
            ctrl.showCache[i] = showCache;
            i++;
        }
    });

}
