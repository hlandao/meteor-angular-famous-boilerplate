var deps = ['$rootScope', '$famous', '$window'];

function PEUIService ($rootScope, $famous, $window){
	this.viewSize = {
		width : $window.innerWidth,
		height : $window.innerHeight,
        navbarHeight : 64,
        tabbarHeight : 50
	}
}

PEUIService.$inject = deps;

angular.module('pele.ui').service('PEUI', PEUIService);