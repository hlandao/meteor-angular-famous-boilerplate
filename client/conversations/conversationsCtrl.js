var deps = ['$scope', '$famous','$timeout','$state'];

function ConversationsCtrl($scope,$famous,$timeout,$state){
    var ctrl = this;
    /** Famous Components **/
    var EventHandler = $famous['famous/core/EventHandler'];

    /** Init Vars **/
    ctrl.scrollViewEventHandler = new EventHandler();
    ctrl.goBack = function(){
        $state.goBack('home');
    }

    ctrl.imageUrl = function(i){
        i = i%5;
        var ext = i == 0 ? '.png' : '.jpg';
        return '/img/dummies/alfred-icon300-' + i + ext;
    }

    ctrl.goToChat = function(item){
        $state.go('chat');
    }

    var dummyItems = [
        {
            username : "@omri",
            fullname : "Omri Klinger",
            msg : "Hi whats up ?",
            time : "05:30",
            imageUrl : ctrl.imageUrl(0)
        },
        {
            username : "@alfred",
            fullname : "Alfred",
            msg : "How can I help you >?",
            time : "07:45",
            imageUrl : ctrl.imageUrl(1)
        },
        {
            username : "@moko",
            fullname : "Efrat Fellner",
            msg : "I'm here",
            time : "23:30",
            imageUrl : ctrl.imageUrl(2)
        },
        {
            username : "@hlandao",
            fullname : "Hadar Landao",
            msg : "Thank you!",
            time : "20:05",
            imageUrl : ctrl.imageUrl(3)
        },
        {
            username : "@eilam",
            fullname : "Eilam Gilady",
            msg : "ok",
            time : "15:30",
            imageUrl : ctrl.imageUrl(4)
        }

    ]
    ctrl.items = [];
    for(var i = 0;i < 7; ++i){
        ctrl.items.push(angular.extend({},dummyItems[i%5]));
    }

    $timeout(function(){
        for(var i = 0;i < 40; ++i){
            ctrl.items.push(angular.extend({},dummyItems[i%5]));
        }
    },1500);

}

ConversationsCtrl.$inject = deps;
angular.module('conversations').controller('ConversationsCtrl', ConversationsCtrl);