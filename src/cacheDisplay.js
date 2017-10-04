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

    //Display of the canvas for the general overview
    //canvas1 holds L1 and L2, changes to the display
    //of these caches are to be done to L1 and L2 directly
    //canvas2 has L3 in it and changes to the cache display
    //will be done directly to L3
    var canvas1 = document.getElementById("canvas1");
    canvas1.style.flex = "auto";

    var canvas2 = document.getElementById("canvas2");
    canvas2.style.flex = "";

    var l1 = document.getElementById("L1");
    l1.style.flex = 1;
    var l2 = document.getElementById("L2");
    l2.style.flex = 1;
    var l3 = document.getElementById("L3");
    l3.style.flex = 1;

    $scope.showL3 = function() {
        canvas2.style.flex = "auto";
        canvas2.style.height = "40%";
    }

    $scope.updateCacheCanvas = function() {
        if (ctrl.caches.length == 1) {
            l1.style.flex = 1;
            l2.style.flex = 1;
            canvas2.style.flex = "";
            canvas2.style.height = "0%"; 
        }
        if (ctrl.caches.length == 2) {
            canvas2.style.flex = "";
            canvas2.style.height = "0%"; 
            if (ctrl.caches[0].size != "Not Set" && ctrl.caches[1].size != "Not Set") {
                var l1Size = ctrl.caches[0].size; 
                var l2Size = ctrl.caches[1].size;
                var ratio = 0;
                ratio = l2Size / l1Size;
                if (ratio < 0.3) {
                    ratio = 0.3;
                } else if (ratio > 3) {
                    ratio = 3
                }
                l1.style.flex = 1;
                l2.style.flex = ratio;
            }
        }
        if (ctrl.caches.length == 3) {
            if (ctrl.caches[0].size != "Not Set" && ctrl.caches[1].size != "Not Set" && ctrl.caches[1].size == "Not Set") {
                var l1Size = ctrl.caches[0].size; 
                var l2Size = ctrl.caches[1].size;
                var ratio = l2Size / l1Size;
                if (ratio < 0.3) {
                    ratio = 0.3;
                } else if (ratio > 3) {
                    ratio = 3
                }
                
                l1.style.flex = 1;
                l2.style.flex = ratio;
            } else if (ctrl.caches[0].size != "Not Set" && ctrl.caches[1].size != "Not Set" && ctrl.caches[1].size != "Not Set") {
                canvas2.style.flex = "";
                var l1Size = ctrl.caches[0].size; 
                var l2Size = ctrl.caches[1].size;
                var l3Size = ctrl.caches[2].size;
                var canvas1Ratio = l2Size / l1Size;
                if (canvas1Ratio < 0.3) {
                    canvas1Ratio = 0.3;
                } else if (canvas1Ratio > 3) {
                    canvas1Ratio = 3
                }
                var ratioSize = parseInt(l1Size) + parseInt(l2Size);
                var canvas2Ratio = l3Size / ratioSize;

                canvas2Ratio = canvas2Ratio * 40;
                l1.style.flex = 1;
                l2.style.flex = canvas1Ratio;
                if (canvas2Ratio < 30) {
                    canvas2Ratio = 30;
                }
                if (canvas2Ratio > 90) {
                    canvas2Ratio = 90;
                }
                canvas2.style.height = canvas2Ratio.toString() + "%";
            }
        }
    }

    ctrl.hideSideBar = function() {
        ctrl.hide = true;
    }

    ctrl.showSideBar = function() {
        ctrl.hide = false;
    }

    ctrl.clickCache = function(index) {
        $scope.$parent.changeView(index)
    }

    ctrl.addCache = function() {
        if (ctrl.caches.length < 3) {
            ctrl.caches.push({
                title: "L" + (ctrl.caches.length + 1),
                size: "Not Set",
                associativity: "Not Set",
            });
            $scope.showCache[ctrl.caches.length - 1] = true;
            if (ctrl.caches.length == 3) {
                $scope.showL3();
            }
            //Emit sends an event to the parent controller/component
            $scope.$emit('updatedCacheList', ctrl.caches);
        }
        if (ctrl.caches.length > 1) {
            ctrl.disableDeleteCache = false;
        }
    };

    ctrl.removeCache = function(index, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
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
            $scope.updateCacheCanvas();
            $scope.$emit('updatedCacheList', ctrl.caches);
        }
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
        $scope.updateCacheCanvas();
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

    $scope.selectedRow = null;
    $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
        $scope.selectedRow = index;
    }

}
