var deps = ['$scope', '$famous','$timeout','$state'];

function HomeCtrl($scope,$famous,$timeout,$state){
			var ctrl = this;

            ctrl.goNext = function(){
                $state.go('conversations');
            }
}

HomeCtrl.$inject = deps;
angular.module('home').controller('HomeCtrl', HomeCtrl);