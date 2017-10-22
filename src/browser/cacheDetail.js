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

    ctrl.getAssociativity = function(event, index) {
        return parseInt(ctrl.cacheInfo.caches[ctrl.index].associativity);
    }
}
