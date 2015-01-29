angular.module('main', []);
	
	angular.module('main')
	.controller('MainCtrl', ['$scope','$famous', '$state','PEPush','PEUI', function($scope,$famous,$state,PEPush,PEUI){
	    this.viewSize = PEUI.viewSize;
	}]);