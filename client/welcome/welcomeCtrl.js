var deps = ['$scope', '$famous','$timeout','$state'];

function WelcomeCtrl($scope,$famous,$timeout,$state){
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

}

WelcomeCtrl.$inject = deps;
angular.module('welcome').controller('WelcomeCtrl', WelcomeCtrl);