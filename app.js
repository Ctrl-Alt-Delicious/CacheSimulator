let simulator = angular.module('Simulator', ['ngMaterial', 'md.data.table', 'angularResizable']);
const { settingsStore } = require('./src/common/store');

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


/*
 * The IndexController is the "root" in our application's controller hierarchy. It is responsible
 * for changing the view between the main display and the cache details page, as well as storing
 * the cacheInfo variable that is used across the entire application.
 */
function IndexController($scope) {
    let ctrl = this;

    // These are the tabs that appear on the navigation bar at the top of the display
    $scope.navs = [{
        buttonTitle: 'Overview',
        active: true
    },
    {
        buttonTitle: 'L1',
        active: true
    }
    ];

    // This is where all the info is stored about the cache configuration
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

    this.$onInit = () => {
        settingsStore.updateLocalFromStore(ctrl.cacheInfo);
        ctrl.cacheInfo.blockSize = Math.pow(2, ctrl.cacheInfo.B);
    };


    $scope.hideParamLabels = true;
    
    $scope.initialCacheInfo = ctrl.cacheInfo;  // this is necessary for initializing the application

    $scope.changeView = function(index) {
        for (let i = 0; i < $scope.navs.length; i++) {
            if (index === i) {
                $scope.navs[i].active = true;
                //Broadcast sends an event to child controllers/components
                $scope.$broadcast('updatedNavs', $scope.navs[i], index-1);
            } else {
                $scope.navs[i].active = false;
            }
        }
        //Pass the updated cache list to cacheDetail template to change its model
    };

    // Triggered by the cacheInput controller each time the cache config changes
    $scope.$on('updateCacheInfo', function(event, data) {
        $scope.navs = [{
            buttonTitle: 'Overview',
            active: true
        }];
        ctrl.cacheInfo = data;
        let i = 1;
        for (let cache of ctrl.cacheInfo.caches) {
            $scope.navs[i] = {
                buttonTitle: cache.title
            };
            i++;
        }
        $scope.$broadcast('cacheInfoUpdated', ctrl.cacheInfo);  // send updated info back to children controllers
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

    $scope.$on('currentInstruction', (event, data) => {
        $scope.$broadcast('breakdown', data);
    });
}
