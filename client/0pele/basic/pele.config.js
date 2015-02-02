var deps = [];

function PEConfigProvider (){
    /** Public Provider  API **/
    this.setConfig = function(newConfig) {
        angular.extend(CONFIG, newConfig);
    }
    this.getConfig = function() {
        return CONFIG;
    }

    /** Service Definition **/
    this.$get = [function() {
        return CONFIG;
    }];
}

PEConfigProvider.$inject = deps;

angular.module('pele.config').provider('PEConfig', PEConfigProvider);