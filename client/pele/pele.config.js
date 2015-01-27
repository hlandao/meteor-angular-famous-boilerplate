angular.module('pele.config')
    .provider('PEConfig', [function() {

    /** COMMON CONFIG **/

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
}]);