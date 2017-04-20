angular.module('Simulator', ['ngMaterial', 'md.data.table'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('docs-dark')
            .primaryPalette('blue')
            .accentPalette('blue-grey')
            .dark();
    }).controller('IndexController', ['$scope', function($scope) {
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

        $scope.changeView = function(index) {
            for (var i = 0; i < $scope.navs.length; i++) {
                if (index === i) {
                    $scope.navs[i].active = true;
                    //Broadcast sends an event to child controllers/components
                    $scope.$broadcast('updatedCaches', $scope.navs[i])
                } else {
                    $scope.navs[i].active = false
                }
            }
            //Pass the updated cache list to cacheDetail template to change its model
        };

        //Listens for an event emitted from a child controller/component
        $scope.$on('updatedCacheList', function(event, data) {
            $scope.navs = [{
                buttonTitle: "Overview",
                active: true
            }];
            var i = 1;
            for (cache of data) {
                $scope.navs[i++] = {
                    buttonTitle: cache.title
                }
            }
        });
    }]);
