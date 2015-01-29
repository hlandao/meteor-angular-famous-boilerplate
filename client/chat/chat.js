var deps = ['$scope', '$famous','$timeout','$state'];

function ChatCtrl($scope,$famous,$timeout,$state){
    /** Famous Components **/
    var EventHandler = $famous['famous/core/EventHandler'];

    /** Init Vars **/
    this.scrollViewEventHandler = new EventHandler();
    this.goBack = function(){
        $state.goBack('conversations');
    }
}

ChatCtrl.$inject = deps;
angular.module('chat').controller('ChatCtrl', ChatCtrl);