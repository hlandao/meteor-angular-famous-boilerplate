/** pe-navbar-button controller **/

var controllerDeps = [];

function peleNavbarButtonCtrl(){

}
peleNavbarButtonCtrl.$inject = controllerDeps;


/** directive **/
var deps = [];

function peleNavbarButtonDirective(){
    return {
        transclude : true,
        replace : true,
        templateUrl : '/client/0pele/ui/navbar/pele.ui.navbar.button.tpl',
        compile : function(tElement, tAttrs, transclude){
            return {
                pre : function(scope, element, attrs){
                    var side = attrs.side || 'left';
                    element.addClass(side);
                },
                post : function(scope, element, attrs){
                }
            }
        }
    }
}
peleNavbarButtonDirective.$inject = deps;

/** directive decleration **/
angular.module('pele.ui').directive('peNavbarButton', peleNavbarButtonDirective);