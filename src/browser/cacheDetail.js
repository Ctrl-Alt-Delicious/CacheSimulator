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

    $scope.$on('updatedNavs', function(event, data, index) {
        ctrl.activeCache = data.buttonTitle;
        ctrl.maq = SimDriver.setQueue(SimDriver.getMemAcceses());
        ctrl.index = index;
    });

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });

    ctrl.getAssociativity = function(event) {
        return parseInt(ctrl.cacheInfo.caches[ctrl.index].associativity);
    }

    ctrl.getIndicesSize = function(event) {
        let cache = ctrl.cacheInfo.caches[ctrl.index];
        let C = cache.C;
        let S = cache.S;
        let B = ctrl.cacheInfo.B;
        return Math.pow(2,C-S-B);
    }
    var modal;
    var span;
    var activeCache;
    ctrl.openModal = function(event, id, info) {
        modal = document.getElementById(id);
        span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        activeCache = document.getElementById("activeCacheBanner");
        activeCache.style.visibility = "hidden";
    }

    ctrl.closeModalSpan = function(event) {
        modal.style.display = "none";
        activeCache.style.visibility = "visible";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            activeCache.style.visibility = "visible";
        }
    }
}
