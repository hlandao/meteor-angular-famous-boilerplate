/** Back Directive **/
var directiveDeps = ['$timeout', '$state'];

function BackDirective ($timeout, $state){
    return function(scope, element, attrs){

        element.bind("click", function(e) {
            console.log('click');
            e.stopPropagation();
            e.preventDefault();

            $timeout(function(){
                $state.goBack(attrs.defaultState);
            }, 0);

            return false;
        });

    }
}

BackDirective.$inject = directiveDeps;

/** Routing Helper **/
var helperDeps = [];
function RoutingHelper (){
    return {
        backTransition : false
    };
}
RoutingHelper.$inject = helperDeps;


/** Routing Config **/
var configDeps = ['$urlRouterProvider', '$stateProvider', '$locationProvider'];
function RoutingConfig ($urlRouterProvider, $stateProvider, $locationProvider){
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
            templateUrl: '/client/home/home.tpl',
            controller : 'HomeCtrl',
            controllerAs : 'home'
        }).state('welcome', {
            url: '/welcome',
            templateUrl: '/client/welcome/welcome.tpl',
            controller : 'WelcomeCtrl',
            controllerAs : 'welcome'
        });
   
    $urlRouterProvider.otherwise("/");
}

RoutingConfig.$inject = configDeps;


/** Routing Run **/
var runDeps = ['$rootScope', '$state','PERoutingHelper','PELog'];
function RoutingRun($rootScope, $state,PERoutingHelper,PELog){

    $state.goBack = function(defaultState, params){
        console.log('$state.goBack');
        if($state.previous && $state.previous.name){
            PERoutingHelper.backTransition = true;
            $state.go($state.previous.name, params);
        }else if(defaultState){
            PERoutingHelper.backTransition = true;
            $state.go(defaultState, params);
        }
    }

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        console.log('$stateChangeSuccess');
        $state.previous = fromState;
    });
}
RoutingRun.$inject = runDeps;


/** Module Decleration **/
angular.module('pele.routing')
    .config(RoutingConfig)
    .factory('PERoutingHelper',RoutingHelper)
    .run(RoutingRun)
    .directive('peBack', BackDirective);
