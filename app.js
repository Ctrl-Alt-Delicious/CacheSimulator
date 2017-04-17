'use strict';

angular.module('Simulator', ['ngMaterial'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('blue')
            .accentPalette('blue-grey')
            .dark();
    });
