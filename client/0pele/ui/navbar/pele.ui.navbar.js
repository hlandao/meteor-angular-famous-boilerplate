/** pe-navbar controller **/

var controllerDeps = [];

function peleNavbarCtrl(){

}
peleNavbarCtrl.$inject = controllerDeps;


/** directive **/
var deps = [];

function peleNavbarDirective(){
    return {
        transclude : true,
        templateUrl : '/client/0pele/ui/navbar/pele.ui.navbar.tpl',
        compile : function(tElement, tAttrs, transclude){
            return {
                pre : function(scope, element, attrs){
                },
                post : function(scope, element, attrs){
                }
            }
        }
    }
}
peleNavbarDirective.$inject = deps;

/** directive decleration **/
angular.module('pele.ui').directive('peNavbar', peleNavbarDirective);