Meteor.startup(function () {
    
    var boot = function(){

        if(!CONFIG || !CONFIG.APP_ID){
            throw new Error('[client] cannot boot app without appId');
            return;
        }

        APP_ID = CONFIG.APP_ID.toLowerCase();

        var deps = [
            'angular-meteor',
            'famous.angular',
            'ui.router',
            'pele',
            'main',
            'home',
            'welcome'
        ];

        angular.module(APP_ID,deps)
            .run(['PELog', function(PELog){
                PELog.debug('[client] boot client app ' + APP_ID + ' successfully');
            }]);

        angular.bootstrap(document, [APP_ID]);
    }

    var getConfigFromLocalStorage = function(){
        var str = localStorage.getItem('CONFIG'),
            configObject = null;
        if(str){
            try{
                configObject = JSON.parse(str);
            }catch(e){
                console.error('[client] cannot get config from local storage');
            }
        }
        return configObject;
    }


    var setConfigLocalStorage = function(configObject){
        var str;
        if(configObject){
            try{
                str = JSON.stringify(configObject);
            }catch(e){
                console.error('[client] failed to store config in local storage, could not stringify object');
            }

            try{
                localStorage.setItem('CONFIG', str);
            }catch(e){
                console.error('[client] failed to store config in local storage, could set item');
            }
        }
    }

    var getConfigFromRemote = function(done){
        Meteor.call('config', function(err, configObject){
            if(!err && configObject){
                setConfigLocalStorage(configObject);
            }
            done && done(err,configObject);
        });
    }



    CONFIG = getConfigFromLocalStorage();
    if(CONFIG){
        boot();
        setTimeout(getConfigFromRemote,0);
    }else{
        getConfigFromRemote(function(err, configObject){
            CONFIG = configObject;
            if(!err && configObject){
                boot();
            }else{
                console.error('[cleint] failed initiating config from remote');
            }
        });
    }

});


