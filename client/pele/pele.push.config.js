var h;
angular.module('pele.push')
    .service('PEPush', ['PEConfig', function(PEConfig) {
        window.h = this.init = function(){
            if(PEConfig.PUSH){
                Push.Configure({
                    gcm: {
                        // Required for Android and Chrome OS
                        projectNumber: PEConfig.PUSH.GCM_PROJECT_NUMBER
                    },
                    apn: {
                    },
                    bagde: PEConfig.PUSH.BADGE,
                    sound: PEConfig.PUSH.SOUND,
                    alert: PEConfig.PUSH.ALERT
                });
            }
        }
    }]);