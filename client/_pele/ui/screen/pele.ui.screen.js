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
    var enterDuration = 400,
        leaveDuration = 400,
        enterDelay,
        leaveDelay;
    ctrl.translate = new Transitionable();

    /** Init from post link fn **/
    ctrl.setAttrs = function(attrs){
    }

    /** Is back ?**/
    var isBackTransition = function(){
        return PERoutingHelper.backTransition;
    }

    /** Animations **/
    // Normal slide-in animation
    var normalSlideIn = function($done){
        ctrl.translate.set([+(PEUI.viewSize.width), 0, 0]);
        ctrl.translate.set([0, 0, 0], { duration: enterDuration, curve: 'easeInOut'}, $done);
        $timeout($done, enterDelay + enterDuration);

    }
    // Normal slide-out animation
    var normalSlideOut = function($done){
        ctrl.translate.set([-PEUI.viewSize.width, 0, 0], { duration: leaveDuration, curve: 'easeInOut' }, $done);
        $timeout($done, leaveDelay + leaveDuration);
    }

    // Back slide-in animation
    var backSlideIn = function($done){
        ctrl.translate.set([-(PEUI.viewSize.width/3), 0, 0]);
        ctrl.translate.set([0, 0, 0], { duration: 250, curve: 'easeInOut'}, $done);
        $timeout($done, enterDelay + 250);
    }
    // Back slide-out animation
    var backSlideOut = function($done) {
        ctrl.translate.set([+(PEUI.viewSize.width), 0, 0], { duration: leaveDuration, curve: 'easeInOut' }, $done);
        $timeout($done, leaveDelay + leaveDuration);
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
        setTimeout(function(){
            if(isBackTransition()){
                backSlideOut($done);
            }else{
                normalSlideOut($done);
            }
            PERoutingHelper.backTransition = false;
        },100);


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
        require : 'peleScreen',
		compile : function(tElem, tAttrs){
			return {
				pre : function(){

				},
				post : function(scope, element, attrs, ctrl){
                    ctrl.setAttrs(attrs);
				}
			}
		}
	}
}

PeleScreenDirective.$inject = directiveDeps;
angular.module('pele.ui').directive('peleScreen', PeleScreenDirective);


