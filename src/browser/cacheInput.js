'use strict';

const {ipcRenderer} = require('electron')

angular.module('Simulator').component('cacheInput', {
    templateUrl: 'src/browser/cacheInput.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheInputController],
    bindings: {}
});

function CacheInputController($scope, simDriver, fileParser) {

    var ctrl = this;

    ctrl.hideSidebar = false;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;

    let B_min = 3, B_max = 7;

    ctrl.hideSideBar = function() {
        ctrl.hideSidebar = true;
    }

    ctrl.showSideBar = function() {
        ctrl.hideSidebar = false;
    }

    ctrl.addCache = function() {
        let caches = ctrl.cacheInfo.caches;
        if (caches.length < 3) {
            caches.push({
                title: "L" + (caches.length + 1),
                size: "Not Set",
                associativity: "Not Set",
                active: true,
                C: 1,
                S: 1
            });
        }
        ctrl.cacheInfo.caches = caches;
        if (caches.length > 1) {
            ctrl.cacheInfo.disableDeleteCache = false;
        }
        //Emit sends an event to the parent controller/component
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.handleUpload = function() {
        //Sends an asynchronous event to the main process (main.js)
        //Can add arguments if necessary
        ipcRenderer.send('uploadFile');
    };

    var setCacheSize = function(index) {
        ctrl.cacheInfo.caches[index].C = Math.log(ctrl.cacheInfo.caches[index].cacheSize) / Math.log(2);
        setAssocOptions(index);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setBlockSize = function() {
        ctrl.cacheInfo.B = Math.log(ctrl.cacheInfo.blockSize) / Math.log(2);
        setCacheSizeOptions();
        ctrl.cacheInfo.blockSizeSet = true;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setPolicy = function() {
        ctrl.cacheInfo.policySet = true;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    }


    ipcRenderer.on('fileNameReceived', (e, fPath) => {
        //Use node's functions for parsing file path to base name on all native OS
        $scope.$parent.fileName = path.basename(fPath)
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
    })

    //subscribe to fileParser notifications when file is parsed
    fileParser.subscribe($scope, () => {
        //ask for new mem traces in queue
        $scope.$parent.memQueue = simDriver.getMemAcceses()
    })

    ipcRenderer.on('fileDataReceived', (e, fData) => {
        fileParser.parseFile(fData)
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();

    })

    $scope.updateCache = function(item, index, setting) {
        var c = ctrl.cacheInfo.caches[index];
        if (setting === "size") {
            c.size = item;
            $scope.$parent.cacheSize = item;
            setCacheSize(index);
        } else if (setting === "associativity") {
            c.associativity = item;
        }
        ctrl.cacheInfo.caches[index] = c;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    }
    
    for (var i = B_min; i <= B_max; i++) {
        ctrl.cacheInfo.blockSizes.push(Math.pow(2, i));
    }

    var setCacheSizeOptions = function() {

        let C_min = ctrl.cacheInfo.B;
        let C_max = 30;

        ctrl.cacheInfo.cacheSizes = [];
        for (let i = C_min; i <= C_max; i++) {
            ctrl.cacheInfo.cacheSizes.push(Math.pow(2, i));
        }
    }

    var setAssocOptions = function(index) {
        let caches = ctrl.cacheInfo.caches;

        var C = caches[index].C;
        var B = ctrl.cacheInfo.B;

        var S_min = 0;
        var S_max = C - B;

        caches[index].associativities = [];
        for (var i = S_min; i <= S_max; i++) {
            caches[index].associativities.push(Math.pow(2, i));
        }
        ctrl.cacheInfo.caches = caches;
    }

    $scope.selectedRow = null;
    $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
        $scope.selectedRow = index;
    }

    // var emitCacheInfo = function() {
    //     $scope.emit('updateCacheInfo', ctrl.cacheInfo);
    // }

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });
}
