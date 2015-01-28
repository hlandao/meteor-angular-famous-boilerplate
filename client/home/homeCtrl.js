var deps = ['$scope', '$famous','$timeout'];

function HomeCtrl($scope,$famous,$timeout){
			var ctrl = this;
}

HomeCtrl.$inject = deps;
angular.module('home').controller('HomeCtrl', HomeCtrl);