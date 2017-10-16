'use strict';

angular.module('Simulator').component('cacheDetail', {
    templateUrl: 'src/browser/cacheDetail.html',
    controller: ['$scope', 'SimDriver', CacheDetailController],
    bindings: {}
});

function CacheDetailController($scope) {

    let ctrl = this;

    ctrl.activeCache = 'L1';

    $scope.$on('updatedNavs', function(event, data) {
        ctrl.activeCache = data.buttonTitle;
    });

}
