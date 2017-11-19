'use strict';

const {ipcRenderer} = require('electron');

angular.module('Simulator').component('addressBreakdown', {
    templateUrl: 'src/browser/addressBreakdown.html',
    //add any dependencies below
    controller: ['$scope', AddressBreakdownController],
    bindings: {}
});

function AddressBreakdownController($scope) {
	ctrl = this;
	ctrl.cacheInfo = $scope.$parent.initialCacheInfo;
	let C = ctrl.cacheInfo.C;
	let B = ctrl.cacheInfo.B;
	let S = ctrl.cacheInfo.S;

	ctrl.tagSize = function(event) {
		return 31-C-S;
	}

	ctrl.indexSize = function(event) {
		return C-S-B;
	}

	ctrl.offsetSize = function(event) {
		return B;
	}

	//Should return array containing bits in tag of address
	ctrl.getTag = function(event, address) {
		return null;
	}

	//Should return array containing bits in index of address
	ctrl.getIndex = function(event, address) {
		return null;
	}

	//Should return array containing bits in offset of address
	ctrl.getOffset = function(event, address) {
		return null;
	}


}