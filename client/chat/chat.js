var deps = ['$scope', '$famous','$timeout','$state'];

function ChatCtrl($scope,$famous,$timeout,$state){
    var ctrl = this;

    ctrl.goBack = function(){
        $state.goBack('conversations');
    }


    var EventHandler = $famous['famous/core/EventHandler'];
    var ViewSequence = $famous['famous/core/ViewSequence'];

    var viewSequence = new ViewSequence();
    ctrl.ev = new EventHandler();
    ctrl.options = {
        sv : {
            layoutOptions: {
                isSectionCallback: function(renderNode) {
                    return renderNode.properties && renderNode.properties.isSection;
                },
                margins: [5, 0, 0, 0]
            },
            autoPipeEvents: true,
            flow: true,
            alignment: 1,
            mouseMove: true,
            debug: false,
//            useContainer : true
//            pullToRefreshHeader: pullToRefreshHeader
        }
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    ctrl.messages = [];

    ctrl.addNewMessage = function(){
        ctrl.messages.push({
            fromId : 'me',
            text : ctrl.newMessage,
            kind : 'text',
            seen : [],
            isMyMessage : true
        });
    }


    var messages = [
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : true
        },
        {
            fromId : 'omri',
            text : 'Hello world Hello world Hello world Hello world Hello worldHello worldHello worldHello worldHello worldHello world',
            kind : 'text',
            seen : [],
            isMyMessage : false
        },
        {
            fromId : 'omri',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : false
        },
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : []
        },
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : true
        },
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : true
        },
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : true
        },
        {
            fromId : 'omri',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : false
        },
        {
            fromId : 'me',
            text : 'Hello world',
            kind : 'text',
            seen : [],
            isMyMessage : true
        },
        {
            fromId : 'omri',
            text : 'Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello worldHello worldHello worldHello world',
            kind : 'text',
            seen : [],
            isMyMessage : false
        }
    ];

    ctrl.messages.push({});


    $timeout(function(){
        ctrl.messages = [];
        for(var i = 0;i<messages.length;++i){
            messages[i].text += " : " + i;
            ctrl.messages.push(messages[i]);
        }
    },0);



}

ChatCtrl.$inject = deps;
angular.module('chat').controller('ChatCtrl', ChatCtrl).directive('chatScrollView', function($famous){
    return function(scope, element, attrs){
        var isolate = $famous.getIsolate(scope);
        window.iso = isolate;
//        isolate.renderNode.goToLastPage();
//        isolate.renderNode.on('reflow', function(){
//        });
//        isolate.renderNode.on('layoutend', function(){
//        });
//
//        isolate.renderNode.on('change', function(){
//            console.log('change');
//        });

    }
});