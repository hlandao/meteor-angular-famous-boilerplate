angular.module('pele.routing')
    .config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function($urlRouterProvider, $stateProvider, $locationProvider){

            var requireUserResolver = function(){
                return ['$q', 'PEUser','PESettings','$state', function($q, PEUser, PEConfig, $state){
                    return PEUser.ready().then(function(){
                        return true;
                    }, function(){
                        if(PEConfig.loggedOutRoute){
                            $state.go(PEConfig.loggedOutRoute);
                        }
                        return $q.reject();
                    });
                }];
            }

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: '/client/home/home.tpl'
                });
           
            $urlRouterProvider.otherwise("/");


        }])