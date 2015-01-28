/** Template **/
var template = '<fa-view><fa-modifier fa-translate="screen.translate.get()"><ng-transclude></ng-transclude></fa-modifier></fa-view>';

/** Controller **/
var controllerDeps = ['$scope', '$famous','$timeout','$state','PEUI','PERoutingHelper'];

function PeleScreenController($scope,$famous,$timeout,$state, PEUI, PERoutingHelper){
    var ctrl = this;
    /** Famous Dependencies **/
    var EventHandler = $famous['famous/core/EventHandler'];
    var Transitionable = $famous['famous/transitions/Transitionable'];

    /** **/
    var enterDuration = 300,
        leaveDuration = 300;
    ctrl.translate = new Transitionable();

    /** Is back ?**/
    var isBackTransition = function(){
        return PERoutingHelper.backTransition;
    }

    /** Normal slide-in animation **/
    var normalSlideIn = function($done){
        ctrl.translate.set([-(PEUI.viewSize.width / 2), 0, 0]);
        ctrl.translate.set([0, 0, 0], { duration: enterDuration, curve: 'easeInOut' }, $done);
    }
    /** Normal slide-out animation **/
    var normalSlideOut = function($done){
        ctrl.translate.set([320, 0, 0], { duration: leaveDuration, curve: 'easeInOut' }, $done);
        $timeout($done, leaveDuration);

    }

    /** Back slide-in animation **/
    var backSlideIn = function($done){
        ctrl.translate.set([(PEUI.viewSize.width), 0, 0]);
        ctrl.translate.set([0, 0, 0], { duration: enterDuration, curve: 'easeInOut' }, $done);
    }
    /** Back slide-out animation **/
    var backSlideOut = function($done){
        ctrl.translate.set([-(PEUI.viewSize.width), 0, 0], { duration: leaveDuration, curve: 'easeInOut' }, $done);
        $timeout($done, leaveDuration);

    }


    /** Enter & Leave Animations **/
    $scope.enter = function ($done) {
        if(isBackTransition()){
            backSlideIn($done);
        }else{
            normalSlideIn($done);
        }
    }

    $scope.leave = function ($done) {
        if(isBackTransition()){
            backSlideOut($done);
        }else{
            normalSlideOut($done);
        }

        PERoutingHelper.backTransition = false;
    }

}

PeleScreenController.$inject = controllerDeps;
/** Directive **/
var directiveDeps = []

function PeleScreenDirective(){
	return {
		transclude : true,
		template : template,
		controller : PeleScreenController,
		controllerAs : 'screen',
		compile : function(tElem, tAttrs){
			return {
				pre : function(){

				},
				post : function(){

				}
			}
		}
	}
}

PeleScreenDirective.$inject = directiveDeps;
angular.module('pele.ui').directive('peleScreen', PeleScreenDirective);


