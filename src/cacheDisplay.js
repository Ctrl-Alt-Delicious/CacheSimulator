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

    var B_min = 3, B_max = 7;

    ctrl.caches = [{
        title: "L1",
        policy: "",
        cacheSize: "",
        associativity: "",
        C: "",
        S: ""
    }];

    ctrl.caches = [{
        title: "L1",
        size: "Not Set",
        associativity: "Not Set",
        associativities: [],
        C: 1,
        S: 1
    }];

    ctrl.clickCache = function(index) {
        $scope.$parent.changeView(index)
    }

    ctrl.addCache = function() {
        if (ctrl.caches.length < 3) {
            ctrl.caches.push({
                title: "L" + (ctrl.caches.length + 1),
                size: "Not Set",
                associativity: "Not Set"
            });
            $scope.showCache[ctrl.caches.length - 1] = true;
            //Emit sends an event to the parent controller/component
            $scope.$emit('updatedCacheList', ctrl.caches);
        }
        if (ctrl.caches.length > 1) {
            ctrl.disableDeleteCache = false;
        }
    };

    ctrl.removeCache = function(index) {
        if (ctrl.caches.length > 1) {
            ctrl.caches.splice(index, 1);
            $scope.showCache[ctrl.caches.length] = false;
            for(var i = 1; i <= ctrl.caches.length; i++) {
                ctrl.caches[i-1].title = "L" + i;
            }
        }
        if (ctrl.caches.length === 1) {
            ctrl.disableDeleteCache = true;
        }
        $scope.$emit('updatedCacheList', ctrl.caches);
    };

    ctrl.handleUpload = function() {
        //Sends an asynchronous event to the main process (main.js)
        //Can add arguments if necessary
        ipcRenderer.send('uploadFile')
    };

    var setCacheSize = function(index) {
        ctrl.caches[index].C = Math.log(ctrl.cacheSize) / Math.log(2);
        setAssocOptions(index);
    };

    ctrl.setBlockSize = function() {
        ctrl.B = Math.log(ctrl.blockSize) / Math.log(2);
        setCacheSizeOptions();
        ctrl.blockSizeSet = true;
    };

    ctrl.setPolicy = function() {
        ctrl.policySet = true;
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

    //Constants
    $scope.policies = ["FIFO", "LRU", "LFU"]
    $scope.blockSizes = []
    $scope.cacheSizes = []
    //$scope.associativities = []

    $scope.showCache = [true, false, false];

    $scope.updateCache = function(item, index, setting) {
        var c = ctrl.caches[index];
        if (setting === "size") {
            c.size = item;
            ctrl.cacheSize = item;
            setCacheSize(index);
        } else if (setting === "associativity") {
            c.associativity = item;
        }
    }
    
    for (var i = B_min; i <= B_max; i++) {
        $scope.blockSizes.push(Math.pow(2, i));
    }

    var setCacheSizeOptions = function() {

        var C_min = ctrl.B;
        var C_max = 30;

        $scope.cacheSizes = [];
        for (var i = C_min; i <= C_max; i++) {
            $scope.cacheSizes.push(Math.pow(2, i));
        }
    }

    var setAssocOptions = function(index) {

        var C = ctrl.caches[index].C;
        var B = ctrl.B;

        var S_min = 0;
        var S_max = C - B;

        ctrl.caches[index].associativities = [];
        for (var i = S_min; i <= S_max; i++) {
            ctrl.caches[index].associativities.push(Math.pow(2, i));
        }
    }


}
