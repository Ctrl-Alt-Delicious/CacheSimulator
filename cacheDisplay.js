'use strict';

angular.module('Simulator').component('cacheDisplay', {
    templateUrl: 'cacheDisplay.html',
    //add any dependencies below
    controller: ['$scope', CacheDisplayController],
    bindings: {}
});

function CacheDisplayController($scope) {
    var ctrl = this;
}
