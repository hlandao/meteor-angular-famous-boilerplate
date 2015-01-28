var deps = ['$scope', '$famous','$timeout'];

function WelcomeCtrl($scope,$famous,$timeout){
			var ctrl = this;
			/** Famous Dependencies **/
	        var EventHandler = $famous['famous/core/EventHandler'];
	        var Transitionable = $famous['famous/transitions/Transitionable'];

	        /** Enter & Leave Animations **/
	        ctrl.translate = new Transitionable([0, 0, 0]);
	        $scope.enter = function ($done) {
	            ctrl.translate.set([0, 0, 0], { duration: 400, curve: 'easeInOut' }, $done);
	        }
	        $scope.leave = function ($done) {
	            var duration = 400;
				ctrl.translate.set([320, 0, 0], { duration: duration, curve: 'easeInOut' }, $done);
				$timeout($done, duration);
	        }
}

WelcomeCtrl.$inject = deps;
angular.module('welcome').controller('WelcomeCtrl', WelcomeCtrl);