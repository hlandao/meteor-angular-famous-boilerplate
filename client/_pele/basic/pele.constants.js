var deps = ['PEConfigProvider'];

function PEConstantsProvider (PEConfigProvider){
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
}

PEConstantsProvider.$inject = deps;

angular.module('pele.config').provider('PEConstants', PEConstantsProvider);