'use strict';

// const {ipcRenderer} = require('electron')
const { parseAddress } = require('./src/common/addressParser');

angular.module('Simulator').component('cacheDisplay', {
    templateUrl: 'src/browser/cacheDisplay.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheDisplayController],
    bindings: {}
});

function CacheDisplayController($scope) {

    let ctrl = this;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;
    ctrl.fullyAssociative = [false,false,false];
    ctrl.breakdownModel = {
        L1 : {
            tag : new Array(32).fill(0),
            index : new Array(32).fill(0),
            offset : new Array(32).fill(0)
        },
        L2 : {
            tag : new Array(32).fill(1),
            index : new Array(32).fill(1),
            offset : new Array(32).fill(1)
        },
        L3 : {
            tag : new Array(32).fill(2),
            index : new Array(32).fill(2),
            offset : new Array(32).fill(2)
        }
    }

    ctrl.parsed = [ctrl.breakdownModel.L1, ctrl.breakdownModel.L2, ctrl.breakdownModel.L3];

    $scope.$on('breakdown', function(event, data) {
        ctrl.parsed = [];
        for (let cache of ctrl.cacheInfo.caches) {
            let breakdown = parseAddress(data.address, cache.C, cache.S, ctrl.cacheInfo.B);
            let binBreakdown = {
                tag : breakdown.tag.toString(2),
                index : breakdown.index.toString(2),
                offset : breakdown.offset.toString(2)
            }
            ctrl.parsed.push(binBreakdown);
        }
        $scope.$digest();
    })
    

    ctrl.tagSize = function(cacheIndex) {
        if (cacheIndex <= ctrl.cacheInfo.caches.length-1) {
            let cache = ctrl.cacheInfo.caches[cacheIndex];
            let C = cache.C;
            let S = cache.S;
            return 32-C+S;
        } else {
            return 0;
        }
    }

    ctrl.indexSize = function(cacheIndex) {
        if (cacheIndex <= ctrl.cacheInfo.caches.length-1) {
            let cache = ctrl.cacheInfo.caches[cacheIndex];
            let C = cache.C;
            let S = cache.S;
            return C-S-ctrl.cacheInfo.B;
        } else {
            return 0;
        }
    }

    ctrl.offsetSize = function(cacheIndex) {
        return ctrl.cacheInfo.B;
    }

    //Should return array containing bits in tag of address
    ctrl.getTag = function(event, address) {
        return null;
    }

    //Should return array containing bits in index of address
    ctrl.getIndex = function(event, address) {
        return null;
    }

    //Should return array containing bits in offset of address
    ctrl.getOffset = function(event, address) {
        return null;
    }
    
    ctrl.clickCache = function(index) {
        $scope.$parent.changeView(index);
    };

    ctrl.removeCache = function(index, event) {
        let caches = ctrl.cacheInfo.caches;
        if (event) {
            event.stopPropagation();
            event.preventDefault();
            if (caches.length > 1) {
                ctrl.cacheInfo.caches[caches.length - 1].active = false;
                caches.splice(index, 1);
                for(let i = 1; i <= caches.length; i++) {
                    caches[i-1].title = 'L' + i;
                }
            }
            if (caches.length === 1) {
                ctrl.cacheInfo.disableDeleteCache = true;
            }
            ctrl.cacheInfo.caches = caches;
        }
        $scope.showL3();
        $scope.updateCacheCanvas();
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
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

    // ipcRenderer.on('fileDataReceived', (err, fileData) => {
    //     fileParser.parseFile(fileData);
    //     //This forces the angular rendering lifecycle to update the value
    //     $scope.$digest();
    // })

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
        ctrl.fullyAssociative = checkFullyAssociative();
    });

    function checkFullyAssociative() {
        let fullyAssociative = ctrl.fullyAssociative;
        let caches = ctrl.cacheInfo.caches;
        for (let i = 0; i < ctrl.cacheInfo.caches.length; i++) {
            let C = caches[i].C;
            let S = caches[i].S;
            if (C-S-ctrl.cacheInfo.B == 0) {
                fullyAssociative[i] = true;
            } else {
                fullyAssociative[i] = false;
            }
        }
        return fullyAssociative;
    }




    // Here is the code that updates the canvas based on cache sizes    
    let canvas1 = document.getElementById('canvas1');
    canvas1.style.height = '720px';
    canvas1.style.flex = 'auto';

    let canvas2 = document.getElementById('canvas2');
    canvas2.style.flex = '';

    let l1 = document.getElementById('L1');
    l1.style.flex = 1;
    let l2 = document.getElementById('L2');
    l2.style.flex = 1;
    let l3 = document.getElementById('L3');
    l3.style.flex = 1;

    $scope.showL3 = function() {
        if (ctrl.cacheInfo.caches.length === 3) {
            canvas2.style.flex = 'auto';
            canvas2.style.height = '370px';
            canvas1.style.height = '370px';
        }
        else {
            canvas1.style.height = '720px';
        }
    };

    $scope.$on('displayUpdateCanvas', function(event, data) {
        $scope.showL3();
        $scope.updateCacheCanvas();
    });

    $scope.updateCacheCanvas = function() {
        if (ctrl.cacheInfo.caches.length === 1) {
            l1.style.flex = 1;
            l2.style.flex = 1;
            canvas2.style.flex = '';
            canvas2.style.height = '0%';
        }
        if (ctrl.cacheInfo.caches.length === 2) {
            canvas2.style.flex = '';
            canvas2.style.height = '0%';
            if (ctrl.cacheInfo.caches[0].size !== 'Not Set' && ctrl.cacheInfo.caches[1].size !== 'Not Set') {
                let l1Size = ctrl.cacheInfo.caches[0].size;
                let l2Size = ctrl.cacheInfo.caches[1].size;
                let ratio = l2Size / l1Size;
                if (ratio < 0.3) {
                    ratio = 0.3;
                } else if (ratio > 3) {
                    ratio = 3;
                }
                l1.style.flex = 1;
                l2.style.flex = ratio;
            }
        }
        if (ctrl.cacheInfo.caches.length === 3) {
            if (ctrl.cacheInfo.caches[0].size !== 'Not Set' && ctrl.cacheInfo.caches[1].size !== 'Not Set' && ctrl.cacheInfo.caches[1].size === 'Not Set') {
                let l1Size = ctrl.cacheInfo.caches[0].size;
                let l2Size = ctrl.cacheInfo.caches[1].size;
                let ratio = l2Size / l1Size;
                if (ratio < 0.3) {
                    ratio = 0.3;
                } else if (ratio > 3) {
                    ratio = 3;
                }

                l1.style.flex = 1;
                l2.style.flex = ratio;
            } else if (ctrl.cacheInfo.caches[0].size !== 'Not Set' && ctrl.cacheInfo.caches[1].size !== 'Not Set' && ctrl.cacheInfo.caches[1].size !== 'Not Set') {
                canvas2.style.flex = '';
                let l1Size = ctrl.cacheInfo.caches[0].size;
                let l2Size = ctrl.cacheInfo.caches[1].size;
                let l3Size = ctrl.cacheInfo.caches[2].size;
                let canvas1heightRatio = 0;
                let canvas1widthRatio = l2Size / l1Size;
                if (canvas1widthRatio < 0.3) {
                    canvas1widthRatio = 0.3;
                } else if (canvas1widthRatio > 3) {
                    canvas1widthRatio = 3;
                }
                let ratioSize = parseInt(l1Size) + parseInt(l2Size);
                let canvas2Ratio = l3Size / ratioSize;

                canvas2Ratio = canvas2Ratio * 40;
                l1.style.flex = 1;
                l2.style.flex = canvas1widthRatio;
                if (canvas2Ratio < 30) {
                    canvas2Ratio = 30;
                }
                else if (canvas2Ratio > 90) {
                    canvas2Ratio = 90;
                }
                canvas2Ratio = canvas2Ratio / 100;
                canvas2Ratio = canvas2Ratio * 720;
                if (canvas2Ratio < 250) {
                    canvas2Ratio = 250;
                }
                else if (canvas2Ratio > 500) {
                    canvas2Ratio = 500;
                }
                canvas1heightRatio = 740 - canvas2Ratio;
                canvas2.style.height = canvas2Ratio.toString() + 'px';
                canvas1.style.height = canvas1heightRatio.toString() + 'px';
            }
        }
    };
}
