
angular.module('Simulator', ['ngMaterial', 'md.data.table'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('blue')
            .accentPalette('blue-grey')
            .dark();
    }).controller('IndexController', ['$scope', function($scope) {
        var ctrl = this;

        $scope.showDetails = false;
        $scope.showDisplay = true;

        $scope.toggleView = function() {
            $scope.showDetails = !$scope.showDetails
            $scope.showDisplay = !$scope.showDisplay
        }

    }]);
