'use strict';

angular.module('Simulator').component('cacheDetail', {
    templateUrl: 'src/browser/cacheDetail.html',
    controller: ['$scope', 'SimDriver', CacheDetailController],
    bindings: {}
});

function CacheDetailController($scope, SimDriver) {

    let ctrl = this;

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;

    ctrl.activeCache = 'L1';
    ctrl.maq = [];
    ctrl.index = 0;
    //ctrl.modals = {};
    ctrl.modals = {
        'L1' : {
            'modal-01' : {
                'tag' : 10110,
                'block' : [...Array(32).keys()].map(x => x+2000),
                'valid' : 1,
                'dirty' : 0
            }
        },
        'L2' : {
            'modal-00' : {
                'tag' : 11000,
                'block' : [...Array(32).keys()].map(x => x+7000),
                'valid' : 1,
                'dirty' : 0
            }
        }
    }

    $scope.$on('updatedNavs', function(event, data, index) {
        ctrl.activeCache = data.buttonTitle;
        ctrl.maq = SimDriver.setQueue(SimDriver.getMemAcceses());
        ctrl.index = index;
    });

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });

    $scope.$on('updateModals', function (event, data) {
        for (action in data) {
            let cacheLevel = action.level;
            let way = action.way;
            let index = action.index;
            let tag = action.tag;
            let block = action.block; //Array of memory addresses associated with given tag
            let valid = action.valid;
            let dirty = action.dirty;
            ctrl.modals[cacheLevel]['modal-'+way+index] = {
                'tag' : tag,
                'block' : block,
                'valid' : valid,
                'dirty' : dirty
            }
        }
    })

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
