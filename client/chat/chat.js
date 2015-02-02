var deps = ['$scope', '$famous','$timeout','$state'];

function ChatCtrl($scope,$famous,$timeout,$state){

    var ctrl = this;
    /** Famous Components **/
    var EventHandler = $famous['famous/core/EventHandler'];

    /** Init Vars **/
    this.scrollViewEventHandler = new EventHandler();
    this.goBack = function(){
        $state.goBack('conversations');
    }

    /** **/
    /**
     * This Source Code is licensed under the MIT license. If a copy of the
     * MIT-license was not distributed with this file, You can obtain one at:
     * http://opensource.org/licenses/mit-license.html.
     *
     * @author: Hein Rutjes (IjzerenHein)
     * @license MIT
     * @copyright Gloey Apps, 2014
     */

    /*global define, Please, console*/
    /*eslint no-console:0 no-use-before-define:0*/


        // import dependencies
//        var Firebase = require('firebase/lib/firebase-web');
        var Engine = $famous['famous/core/Engine'];
        var ViewSequence = $famous['famous/core/ViewSequence'];
        var Surface = $famous['famous/core/Surface'];
        var Modifier = $famous['famous/core/Modifier'];
        var Transform = $famous['famous/core/Transform'];
        var FlexScrollView = window.ijzerenhein.FlexScrollView;
//        var LayoutController = window.ijzerenhein.LayoutController;
        var Timer = $famous['famous/utilities/Timer'];

        // Initialize
        var viewSequence = new ViewSequence();
        ctrl.scrollView = _createScrollView();

        var scrollView;
        function _createScrollView() {
            scrollView = new FlexScrollView({
                layoutOptions: {
                    // callback that is called by the layout-function to check
                    // whether a node is a section
                    isSectionCallback: function(renderNode) {
                        return renderNode.properties && renderNode.properties.isSection;
                    },
                    margins: [5, 0, 0, 0]
                },
                dataSource: viewSequence,
                autoPipeEvents: true,
                flow: true,
                alignment: 1,
                mouseMove: true,
                debug: false,
//                pullToRefreshHeader: pullToRefreshHeader
            });
            return scrollView;
        }

        //
        // Adds a message to the scrollview
        //
        var afterInitialRefreshTimerId;
        var afterInitialRefresh;
        var firstKey;
        function addMessage(data, top) {

            //console.log('adding message: ' + JSON.stringify(data));
            var chatBubble = _createChatBubble(data);
            if (top) {
                scrollView.insert(1, chatBubble);
            }
            else {
                scrollView.push(chatBubble);
            }

            if (!top) {

                // Scroll the latest (newest) chat message
                if (afterInitialRefresh) {
                    scrollView.goToLastPage();
                    scrollView.reflowLayout();
                }
                else {

                    // On startup, set datasource to the last page immediately
                    // so it doesn't scroll from top to bottom all the way
                    viewSequence = viewSequence.getNext() || viewSequence;
                    scrollView.setDataSource(viewSequence);
                    scrollView.goToLastPage();
                    if (afterInitialRefreshTimerId === undefined) {
                        afterInitialRefreshTimerId = Timer.setTimeout(function() {
                            afterInitialRefresh = true;
                        }, 100);
                    }
                }
            }
        }


        //
        // Create a chat-bubble
        //
        function _createChatBubble(data) {

            var div = '<div class="back">' +
                        '<span class="author"> ' + data.from + ' </span>' +
                        '<div class="time"> ' + data.time + ' </div>' +
                        '<div class="message"> ' + data.message + ' </div>' +
                      '</div>';

            var surface = new Surface({
                size: [undefined, true],
                classes: ['message-bubble', (data.isMyMessage) ? 'send' : 'received'],
                content: div,
                properties: {
                    backgroundColor: 'white',
                    message: data.message
                }
            });
            return surface;
        }


    var messages= [
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        },
        {
            from : 'Omri',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : false
        },
        {
            from : 'Me',
            message : 'Hello World',
            time : '20:44',
            isMyMessage : true
        }
    ]


    for(var i = 0;i<20;++i){
        messages[i].message += ' : ' + i;
        addMessage(messages[i]);
    }


}

ChatCtrl.$inject = deps;
angular.module('chat').controller('ChatCtrl', ChatCtrl);