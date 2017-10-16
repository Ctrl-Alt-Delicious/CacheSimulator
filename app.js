var simulator = angular.module('Simulator', ['ngMaterial', 'md.data.table', 'angularResizable']);

simulator.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('docs-dark')
            .primaryPalette('blue')
            .accentPalette('blue-grey')
            .dark();

        $mdThemingProvider.theme('docs-light')
            .primaryPalette('blue')
            .accentPalette('blue-grey');
    });

simulator.controller('IndexController', ['$scope', function($scope) {
        var ctrl = this;

        $scope.navs = [{
                buttonTitle: "Overview",
                active: true
            },
            {
                buttonTitle: "L1",
                active: true
            }
        ];

        ctrl.cacheInfo = {
            policy:  "",
            blockSize:  1,
            fileName:  "",
            B:  "",
            policySet:  false,
            blockSizeSet:  false,
            disableDeleteCache:  true,
            policies: ["FIFO", "LRU", "LFU"],
            blockSizes: [],
            cacheSizes: [],
            caches: [{
                title: "L1",
                size: "Not Set",
                associativity: "Not Set",
                C: 1,
                S: 1,
                active: true
            }]
        };

        $scope.initialCacheInfo = ctrl.cacheInfo;


        $scope.changeView = function(index) {
            for (var i = 0; i < $scope.navs.length; i++) {
                if (index === i) {
                    $scope.navs[i].active = true;
                    //Broadcast sends an event to child controllers/components
                    $scope.$broadcast('updatedNavs', $scope.navs[i]);
                } else {
                    $scope.navs[i].active = false;
                }
            }
            //Pass the updated cache list to cacheDetail template to change its model
        };

        $scope.$on('updateCacheInfo', function(event, data) {
            $scope.navs = [{
                buttonTitle: "Overview",
                active: true
            }];
            ctrl.cacheInfo = data;
            let i = 1;
            for (cache of ctrl.cacheInfo.caches) {
                $scope.navs[i] = {
                    buttonTitle: cache.title,
                }
                i++;
            }
            $scope.$broadcast('cacheInfoUpdated', ctrl.cacheInfo);
        });
    }]);