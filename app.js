let simulator = angular.module('Simulator', ['ngMaterial', 'md.data.table', 'angularResizable']);

simulator.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark')
        .primaryPalette('blue')
        .accentPalette('blue-grey')
        .dark();

    $mdThemingProvider.theme('docs-light')
        .primaryPalette('blue')
        .accentPalette('blue-grey');
});



simulator.controller('IndexController', ['$scope', IndexController]);

function IndexController($scope) {
    let ctrl = this;

    $scope.navs = [{
        buttonTitle: 'Overview',
        active: true
    },
    {
        buttonTitle: 'L1',
        active: true
    }
    ];

    $scope.detailNav = $scope.navs[0];

    ctrl.cacheInfo = {
        policy:  'FIFO',
        blockSize:  32,
        fileName:  '',
        B:  5,
        policySet:  true,
        blockSizeSet:  false,
        disableDeleteCache:  true,
        policies: ['FIFO', 'LRU', 'LFU'],
        blockSizes: [],
        cacheSizes: [],
        caches: [{
            title: 'L1',
            cacheSize: 'Not Set',
            associativity: 'Not Set',
            C: 10,
            S: 0,
            active: true
        }]
    };

    $scope.hideParamLabels = true;

    $scope.initialCacheInfo = ctrl.cacheInfo;


    $scope.changeView = function(index) {
        for (let i = 0; i < $scope.navs.length; i++) {
            if (index === i) {
                console.log('out of bounds?');
                $scope.navs[i].active = true;
                //Broadcast sends an event to child controllers/components
                $scope.$broadcast('updatedNavs', $scope.navs[i], index-1);
            } else {
                $scope.navs[i].active = false;
            }
        }
        //Pass the updated cache list to cacheDetail template to change its model
    };

    $scope.$on('updateCacheInfo', function(event, data) {
        $scope.navs = [{
            buttonTitle: 'Overview',
            active: true
        }];
        ctrl.cacheInfo = data;
        let i = 1;
        for (let cache of ctrl.cacheInfo.caches) {
            console.log('update cache info', i >= $scope.navs.length ? 'out of' : 'in', 'bounds');
            $scope.navs[i] = {
                buttonTitle: cache.title
            };
            i++;
        }
        $scope.$broadcast('cacheInfoUpdated', ctrl.cacheInfo);
    });

    $scope.$on('updateParamLabels', function(event, data) {
        $scope.hideParamLabels = data;
    });

    $scope.$on('inputUpdateCanvas', function(event, data) {
        $scope.$broadcast('displayUpdateCanvas');
    });

    $scope.$on('step', (event, data) => {
        $scope.$broadcast('updateModals', data);
    });
}
