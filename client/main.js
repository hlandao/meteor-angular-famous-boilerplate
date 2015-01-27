angular.module('main', []);
	
	angular.module('main')
	.controller('MainCtrl', ['$scope','PEPush', function($scope,PEPush){
		console.log('PEPush1',PEPush);
	}]);