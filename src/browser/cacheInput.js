'use strict';

const {ipcRenderer} = require('electron');

angular.module('Simulator').component('cacheInput', {
    templateUrl: 'src/browser/cacheInput.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheInputController],
    bindings: {}
});

function CacheInputController($scope, simDriver, fileParser) {

    let ctrl = this;

    ctrl.hideSidebar = false;
    ctrl.hideRunSimButton = true;
    ctrl.hideControlButtons = true;
    ctrl.hideMAQ = true;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;

    let B_min = 3, B_max = 7;

    ctrl.hideSideBar = function() {
        ctrl.hideSidebar = true;
        let maq = document.getElementById('maq');
        maq.style.height = '420px';
    };

    ctrl.showSideBar = function() {
        ctrl.hideSidebar = false;
        let maq = document.getElementById('maq');
        maq.style.height = '150px';
    };

    ctrl.addCache = function() {
        let caches = ctrl.cacheInfo.caches;
        if (caches.length < 3) {
            caches.push({
                title: 'L' + (caches.length + 1),
                size: 'Not Set',
                associativity: 'Not Set',
                active: true,
                C: 10,
                S: 0    
            });
        }
        ctrl.cacheInfo.caches = caches;
        if (caches.length > 1) {
            ctrl.cacheInfo.disableDeleteCache = false;
        }
        //Emit sends an event to the parent controller/component
        $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.handleUpload = () => {
        ipcRenderer.send('uploadFile');
    };

    let setCacheSize = function(index) {
        ctrl.cacheInfo.caches[index].C = Math.log(ctrl.cacheInfo.caches[index].cacheSize) / Math.log(2);
        setAssocOptions(index);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    let setAssociativity = function(index, item) {
        let assoc = parseInt(item);
        if (assoc === 1) {
            ctrl.cacheInfo.caches[index].S = 0;
        } else {
            ctrl.cacheInfo.caches[index].S = Math.log(assoc) / Math.log(2);
        }
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setBlockSize = () => {
        let blockSize = ctrl.cacheInfo.blockSize;
        ctrl.cacheInfo.B = Math.log(blockSize) / Math.log(2);
        setCacheSizeOptions();
        ctrl.cacheInfo.blockSizeSet = true;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setPolicy = () => {
        ctrl.cacheInfo.policySet = true;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };


    ipcRenderer.on('fileNameReceived', (err, fileName) => {
        $scope.$parent.fileName = fileName;
        ctrl.fileName = fileName;
        ctrl.cacheInfo.fileName = fileName;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
    });

    //subscribe to fileParser notifications when file is parsed
    fileParser.subscribe($scope, () => {
        //ask for new mem traces in queue
        $scope.$parent.memQueue = simDriver.getMemAcceses();
    });

    ipcRenderer.on('fileDataReceived', (e, fData) => {
        fileParser.parseFile(fData);
        ctrl.hideRunSimButton = false;
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();

    });

    $scope.updateCache = function(value, cacheNum, attribute) {
        let cache = ctrl.cacheInfo.caches[cacheNum];
        if (attribute === 'size') {
            cache.cacheSize = value;
            setCacheSize(cacheNum);
        } else if (attribute === 'associativity') {
            cache.associativity = value;
            setAssociativity(cacheNum, value);
        }
        ctrl.cacheInfo.caches[cacheNum] = cache;
        $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };
    
    for (let i = B_min; i <= B_max; i++) {
        ctrl.cacheInfo.blockSizes.push(Math.pow(2, i));
    }
    $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
    $scope.$emit('updateCacheInfo', ctrl.cacheInfo);

    let setCacheSizeOptions = function() {

        let C_min = ctrl.cacheInfo.B;
        let C_max = 11;

        ctrl.cacheInfo.cacheSizes = [];
        for (let i = C_min; i <= C_max; i++) {
            ctrl.cacheInfo.cacheSizes.push(Math.pow(2, i));
        }
    };

    let setC = function(C, cacheNum) {
        let size = Math.pow(2, C);
        $scope.updateCache(size, cacheNum, 'size');
    };

    let setS = function(S, cacheNum) {
        let assoc = Math.pow(2, S);
        $scope.updateCache(assoc, cacheNum, 'associativity');
    };

    let setAssocOptions = function(index) {
        let caches = ctrl.cacheInfo.caches;

        let C = caches[index].C;
        let B = ctrl.cacheInfo.B;

        let S_min = 0;
        let S_max = C - B;

        caches[index].associativities = [];
        for (let i = S_min; i <= S_max; i++) {
            caches[index].associativities.push(Math.pow(2, i));
        }
        ctrl.cacheInfo.caches = caches;
    };

    function init() {
        /**
         * We call these functions to set up all the default values
         */
        ctrl.setPolicy();
        ctrl.setBlockSize();
        setC(ctrl.cacheInfo.caches[0].C, 0);
        setS(ctrl.cacheInfo.caches[0].S, 0);

    }

    $scope.selectedRow = null;
    $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
        $scope.selectedRow = index;
    };

    // var emitCacheInfo = function() {
    //     $scope.emit('updateCacheInfo', ctrl.cacheInfo);
    // }

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });

    ctrl.runSimulation = function() {
        ipcRenderer.send('runSimulation', ctrl.cacheInfo);
        ctrl.hideControlButtons = false;
        document.getElementById('upload-button').disabled = 'disabled';
    };

    ctrl.stepForward = function() {
        let step = ipcRenderer.sendSync('simAction', 'stepForward');
        console.log('stepForward return value:', step);
        $scope.$emit('step', step);
    };

    ctrl.stepBackward = function() {
        console.log('stepBackward return value:', ipcRenderer.sendSync('simAction', 'stepBackward'));
    };

    ctrl.pauseSimulation = function() {
        console.log('pauseSimulation return value:', ipcRenderer.sendSync('simAction', 'pause'));
        ctrl.hideMAQ = true;
        // Send this to parent controller for the policy & block size labels
        $scope.$emit('updateParamLabels', ctrl.hideMAQ)
    };

    ctrl.playSimulation = function() {
        console.log('runSimulation return value:', ipcRenderer.sendSync('simAction', 'play'));
        ctrl.hideRunSimButton = true;
        ctrl.hideMAQ = false;
        // Send this to parent controller for the policy & block size labels
        $scope.$emit('updateParamLabels', ctrl.hideMAQ)
    };

    ctrl.resetSimulation = function() {
        console.log('resetSimulation return value:', ipcRenderer.sendSync('simAction', 'reset'));
    };

    init();
}
