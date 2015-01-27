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
                .state('discovery', {
                    url: '/discovery',
                    templateUrl: '/client/discovery/discovery.tpl',
                    controller: 'DiscoveryCtrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                })
                .state('detailsDecide', {
                    url: '/details/:id/decide',
                    templateUrl: '/client/details/details-decide.tpl',
                    controller: 'DetailsDecideCtrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }

                }).state('details', {
                    url: '/details/:id',
                    templateUrl: '/client/details/details.tpl',
                    controller: 'DetailsCtrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }

                }).state('saved', {
                    url : '/saved',
                    templateUrl :  '/client/saved/saved.tpl',
                    controller: 'SavedCtrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }

                }).state('my', {
                    url : '/my',
                    templateUrl :  '/client/my/my.tpl',
                    controller: 'MyCtrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }

                }).state('new-step1', {
                    url : '/new-step1',
                    templateUrl :  '/client/new/new1-type.tpl',
                    controller: 'NewStep1Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step2', {
                    url : '/new-step2',
                    templateUrl :  '/client/new/new2-location.tpl',
                    controller: 'NewStep2Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step3', {
                    url : '/new-step3',
                    templateUrl :  '/client/new/new3-pictures.tpl',
                    controller: 'NewStep3Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step4', {
                    url : '/new-step4',
                    templateUrl :  '/client/new/new4-details.tpl',
                    controller: 'NewStep4Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step5', {
                    url : '/new-step5',
                    templateUrl :  '/client/new/new5-description.tpl',
                    controller: 'NewStep5Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step6', {
                    url : '/new-step6',
                    templateUrl :  '/client/new/new6-your-details.tpl',
                    controller: 'NewStep6Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                }).state('new-step7', {
                    url: '/details',
                    templateUrl: '/client/details/details-confirmation.tpl',
                    controller: 'NewStep7Ctrl',
                    resolve : {
                        requireUser : requireUserResolver()
                    }
                });

            $urlRouterProvider.otherwise("/discovery");


        }])