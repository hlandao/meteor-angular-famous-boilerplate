angular.module('famous.flex.angular')
    .directive('faFlexScrollView', ['$famous', '$famousDecorator', '$timeout', function ($famous, $famousDecorator, $timeout) {
        return {
            template: '<div></div>',
            restrict: 'E',
            transclude: true,
            scope: true,
            compile: function(tElem, tAttrs, transclude){
                return  {
                    pre: function(scope, element, attrs){
                        var isolate = $famousDecorator.ensureIsolate(scope);

                        var ScrollView = window.famousFlex.FlexScrollView;
                        var ViewSequence = $famous['famous/core/ViewSequence'];
                        var Surface = $famous['famous/core/Surface'];
                        var Engine = $famous['famous/core/Engine'];

                        var firstInit = false;
                        var secondInit = false;
                        var _children = [];

                        var options = scope.$eval(attrs.faOptions) || {};
                        isolate.renderNode = new ScrollView(options);

                        $famousDecorator.addRole('renderable',isolate);
                        isolate.show();

                        var _postDigestScheduled = false;

                        var updateScrollview = function(init, goToLastMessage){
                            //perf: don't both updating if we've already
                            //scheduled an update for the end of this digest
                            if(_postDigestScheduled === true) return;

                            // Synchronize the update on the next digest cycle
                            // (if this isn't done, $index will not be up-to-date
                            // and sort order will be incorrect.)
                            scope.$$postDigest(function(){

                                _postDigestScheduled = false;
                                _children.sort(function(a, b){
                                    return a.index - b.index;
                                });

                                var options = {
                                    array: function(_children) {
                                        var _ch = [];
                                        angular.forEach(_children, function(c, i) {
                                            _ch[i] = c.renderGate;
                                        });
                                        return _ch;
                                    }(_children)
                                };

                                var lastChild =options.array[options.array.length-1];

                                if(init){
                                    options.index = scope.$eval(attrs.faStartIndex);
                                }
                                if(!options.index){
                                    options.index = isolate.renderNode.getCurrentIndex();
                                }


                                var viewSeq = new ViewSequence(options);
                                window.viewSeq=viewSeq;
                                if(!firstInit){
                                    firstInit = true;
                                    console.log('here 1');
                                    isolate.renderNode.setDataSource(viewSeq);
                                    isolate.renderNode.goToLastPage();
                                    isolate.renderNode.reflowLayout();
                                }else if(!secondInit){
                                    secondInit = true;
                                    console.log('here 2');
                                    isolate.renderNode.setDataSource(viewSeq);
                                    isolate.renderNode.reflowLayout();
                                }else{
                                    viewSeq.index = options.array.length-1;
                                    isolate.renderNode.setDataSource(viewSeq);
                                    isolate.renderNode.goToLastPage();
                                    isolate.renderNode.reflowLayout();
                                }

                            });

                            _postDigestScheduled = true;
                        };

                        $famousDecorator.sequenceWith(
                            scope,
                            function(data) {
                                _children.push(data);
                                updateScrollview(true,true);
                            },
                            function(childScopeId) {
                                _children = function(_children) {
                                    var _ch = [];
                                    angular.forEach(_children, function(c) {
                                        if (c.id !== childScopeId) {
                                            _ch.push(c);
                                        }
                                    });
                                    return _ch;
                                }(_children);
                                updateScrollview();
                            },
                            updateScrollview
                        );

                    },
                    post: function(scope, element, attrs){
                        var isolate = $famousDecorator.ensureIsolate(scope);

                        transclude(scope, function(clone) {
                            element.find('div').append(clone);
                        });

                        $famousDecorator.registerChild(scope, element, isolate);

                    }
                };
            }
        };
    }]);
