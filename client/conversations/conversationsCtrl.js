var deps = ['$scope', '$famous','$timeout','$state'];

function ConversationsCtrl($scope,$famous,$timeout,$state){
    /** Famous Components **/
    var EventHandler = $famous['famous/core/EventHandler'];

    /** Init Vars **/
    this.scrollViewEventHandler = new EventHandler();
    this.goBack = function(){
        $state.goBack('home');
    }

    this.imageUrl = function(i){
        i = i%5;
        var ext = i == 0 ? '.png' : '.jpg';
        return '/img/dummies/alfred-icon300-' + i + ext;
    }

    this.goToChat = function(item){
        console.log('item',item);
        $state.go('chat');
    }

}

ConversationsCtrl.$inject = deps;
angular.module('conversations').controller('ConversationsCtrl', ConversationsCtrl);