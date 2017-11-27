'use strict';

angular.module('Simulator').component('cacheDetail', {
    templateUrl: 'src/browser/cacheDetail.html',
    controller: ['$scope', 'SimDriver', CacheDetailController],
    bindings: {}
});

function CacheDetailController($scope, SimDriver) {

    let ctrl = this;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;

    ctrl.posInQueue = 0;
    ctrl.overallAge = 0;
    ctrl.activeCache = 'L1';
    ctrl.maq = [];
    ctrl.index = 0;
    ctrl.modals = {};
    ctrl.modals = {
        'L1' : {},
        'L2' : {},
        'L3': {}
    };

    $scope.$on('updatedNavs', function(event, data, index) {
        ctrl.activeCache = data.buttonTitle;
        ctrl.maq = SimDriver.setQueue(SimDriver.getMemAcceses());
        ctrl.index = index;
    });

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });

    $scope.$on('updateModals', function (event, data) {
        console.log('updating modals', data);
        ctrl.overallAge++;
        for (let action of data) {
            console.log(action);
            let address = action.address
            let cacheLevel = action.level;
            let way = action.way;
            let index = action.index;
            let tag = action.tag;
            let block = action.block; //Array of memory addresses associated with given tag
            let valid = action.valid;
            let dirty = action.dirty;
            let age = ctrl.overallAge;
            let position = document.getElementById(index.toString());
            if (ctrl.modals[cacheLevel]['modal-'+way+index] == null) {
                position.style.backgroundColor = "#7FFF00";
                let span = position.getElementsByTagName('span');
                span[0].innerHTML = tag;
                ctrl.modals[cacheLevel]['modal-'+way+index] = {
                    'tag' : tag,
                    'block' : block,
                    'valid' : valid,
                    'dirty' : dirty,
                    'age' : age,
                    'fu' : 0,
                    'pos' : ctrl.posInQueue++,
                };
            } else {
                if (ctrl.modals[cacheLevel]['modal-'+way+index]['tag'] == tag) {
                    position.style.backgroundColor = "#6767FF";
                    let span = position.getElementsByTagName('span');
                    span[0].innerHTML = tag;
                    let fu = ctrl.modals[cacheLevel]['modal-'+way+index]['fu'];
                    ctrl.modals[cacheLevel]['modal-'+way+index] = {
                        'tag' : tag,
                        'block' : block,
                        'valid' : valid,
                        'dirty' : dirty,
                        'age' : age,
                        'fu' : fu + 1,
                        'pos' : ctrl.posInQueue,
                    };
                    return;
                }
                let numWays = ctrl.getAssociativity();
                let checker = true;
                while (way < (numWays - 1)) {
                    way++;
                    if (ctrl.modals[cacheLevel]['modal-'+way+index] == null) {
                        let correctIndex = (ctrl.getIndicesSize() * parseInt(way)) + parseInt(index);
                        position = document.getElementById(correctIndex.toString());
                        position.style.backgroundColor = "#7FFF00";
                        let span = position.getElementsByTagName('span');
                        span[0].innerHTML = tag;
                        ctrl.modals[cacheLevel]['modal-'+way+index] = {
                            'tag' : tag,
                            'block' : block,
                            'valid' : valid,
                            'dirty' : dirty,
                            'age' : age,
                            'fu' : 0,
                            'pos' : ctrl.posInQueue++,
                        };
                        checker = false;
                        break;
                    }
                }
                if (checker) {
                    way = action.way;
                    let policy = ctrl.cacheInfo.policy;

                    if (policy == "LRU") {
                        let size = ctrl.getIndicesSize();
                        let numWays = ctrl.getAssociativity();
                        let youngest = age;
                        let aIndex = 0;
                        let aWay = 0;
                        while (way < numWays) {
                            for (let i = 0; i < size; i++) {
                                let aPos = ctrl.modals[cacheLevel]['modal-'+way+i];
                                if (aPos != null) {
                                    if (aPos['age'] < youngest) {
                                        youngest = aPos['age'];
                                        aIndex = i;
                                        aWay = way;
                                    }
                                }
                            }
                            way++;
                        }
                        let correctIndex = (ctrl.getIndicesSize() * parseInt(aWay)) + parseInt(aIndex);
                        position = document.getElementById(correctIndex.toString());
                        position.style.backgroundColor = "#FF7F7F";
                        let span = position.getElementsByTagName('span');
                        span[0].innerHTML = tag;
                        let fu = ctrl.modals[cacheLevel]['modal-'+aWay+aIndex]['fu'];
                        ctrl.modals[cacheLevel]['modal-'+aWay+aIndex] = {
                            'tag' : tag,
                            'block' : block,
                            'valid' : valid,
                            'dirty' : dirty,
                            'age' : age,
                            'fu' : fu + 1,
                            'pos' : ctrl.posInQueue++,
                        };
                    }
                    if (policy == "LFU") {
                        let size = ctrl.getIndicesSize();
                        let numWays = ctrl.getAssociativity();
                        let lfu = age; //age will always be >= lfu;
                        let aIndex = 0;
                        let aWay = 0;
                        while (way < numWays) {
                            for (let i = 0; i < size; i++) {
                                let aPos = ctrl.modals[cacheLevel]['modal-'+way+i];
                                if (aPos != null) {
                                    if (aPos['fu'] < lfu) {
                                        lfu = aPos['fu'];
                                        aIndex = i;
                                        aWay = way;
                                    }
                                }
                            }
                            way++;
                        }
                        let correctIndex = (ctrl.getIndicesSize() * parseInt(aWay)) + parseInt(aIndex);
                        position = document.getElementById(correctIndex.toString());
                        position.style.backgroundColor = "#FF7F7F";
                        let span = position.getElementsByTagName('span');
                        span[0].innerHTML = tag;
                        let fu = ctrl.modals[cacheLevel]['modal-'+aWay+aIndex]['fu'];
                        ctrl.modals[cacheLevel]['modal-'+aWay+aIndex] = {
                            'tag' : tag,
                            'block' : block,
                            'valid' : valid,
                            'dirty' : dirty,
                            'age' : age,
                            'fu' : fu + 1,
                            'pos' : ctrl.posInQueue++,
                        };
                    }
                    if (policy == "FIFO") {
                        let size = ctrl.getIndicesSize();
                        let numWays = ctrl.getAssociativity();
                        let firstPos = ctrl.posInQueue; //age will always be >= lfu;
                        let aIndex = 0;
                        let aWay = 0;
                        while (way < numWays) {
                            for (let i = 0; i < size; i++) {
                                let aPos = ctrl.modals[cacheLevel]['modal-'+way+i];
                                if (aPos != null) {
                                    if (aPos['pos'] < firstPos) {
                                        firstPos = aPos['pos'];
                                        aIndex = i;
                                        aWay = way;
                                    }
                                }
                            }
                            way++;
                        }
                        let correctIndex = (ctrl.getIndicesSize() * parseInt(aWay)) + parseInt(aIndex);
                        position = document.getElementById(correctIndex.toString());
                        position.style.backgroundColor = "#FF7F7F";
                        let span = position.getElementsByTagName('span');
                        span[0].innerHTML = tag;
                        let fu = ctrl.modals[cacheLevel]['modal-'+aWay+aIndex]['fu'];
                        ctrl.modals[cacheLevel]['modal-'+aWay+aIndex] = {
                            'tag' : tag,
                            'block' : block,
                            'valid' : valid,
                            'dirty' : dirty,
                            'age' : age,
                            'fu' : fu + 1,
                            'pos' : ctrl.posInQueue++,
                        };
                    }
                }
            }
        }
    });

    ctrl.getAssociativity = function(event) {
        return parseInt(ctrl.cacheInfo.caches[ctrl.index].associativity);
    };

    ctrl.getIndicesSize = function(event) {
        let cache = ctrl.cacheInfo.caches[ctrl.index];
        let C = cache.C;
        let S = cache.S;
        let B = ctrl.cacheInfo.B;
        return Math.pow(2,C-S-B);
    };

    ctrl.getBlockSize = function(event) {
        return Math.pow(2,ctrl.cacheInfo.B);
    };

    let modal;
    let span;
    let activeCache;
    let modalOpen = false;

    ctrl.openModal = function(event, id, info) {
        if (!modalOpen) {
            modal = document.getElementById(id);
            span = document.getElementsByClassName('close')[0];
            modal.style.display = 'block';
            activeCache = document.getElementById('activeCacheBanner');
            activeCache.style.visibility = 'hidden';
            modalOpen = true;
        }
    };

    ctrl.closeModalSpan = function(event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
            modal.style.display = 'none';
            activeCache.style.visibility = 'visible';
            modalOpen = false;
        }
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            activeCache.style.visibility = 'visible';
            modalOpen = false;
        }
    };
}
