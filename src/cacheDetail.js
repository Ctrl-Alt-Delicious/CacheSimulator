'use strict';

angular.module('Simulator').component('cacheDetail', {
    templateUrl: 'src/cacheDetail.html',
    controller: ['$scope', 'SimDriver', CacheDetailController],
    bindings: {}
});

function CacheDetailController($scope, simDriver) {

    var ctrl = this;

    ctrl.activeCache = "L1";

    $scope.$on('updatedCaches', function(event, data) {
        ctrl.activeCache = data.buttonTitle;
    });

}
