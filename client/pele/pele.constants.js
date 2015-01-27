angular.module('pele.config')
    .provider('PEConstants', ['PEConfigProvider', function(PEConfigProvider){
        
        var constants = {
            LS : {
                USER_KEY : 'USER'
            }
        }
        
        this.getConstants = function(){
            return constants;
        }

        this.$get = [function(){
            return constants;
        }]
    }]);
