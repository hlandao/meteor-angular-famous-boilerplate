angular.module('pele.logger')
    .service('PELog', ['$log', function($log){
        this.log = function(){
            return $log.log.apply(this, arguments);
        }

        this.error = function(){
            return $log.log.apply(this, arguments);
        }

        this.info = function(){
            return $log.log.apply(this, arguments);
        }

        this.debug = function(){
            return $log.log.apply(this, arguments);
        }
    }])
