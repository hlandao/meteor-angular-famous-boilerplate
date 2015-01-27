	NODE_ENV = process.env.NODE_ENV
	ENV = NODE_ENV ? NODE_ENV.toUpperCase() : 'PRODUCTION';

	var commonConfigPath = "config/config.common.json";
	var envConfigPath = "config/config." + ENV.toLowerCase() +  ".json";

	var config, envConfig;

	try{
		config = JSON.parse(Assets.getText(commonConfigPath));
		envConfig = JSON.parse(Assets.getText(envConfigPath));
	}catch(e){
		throw new Error(e,'[config] not valid jsons : ' + envConfigPath +' and ' + commonConfigPath);
	}

	config.public = config.public || {};
	envConfig.public = envConfig.public || {};
	var publicConfig = _.extend({}, config.public, envConfig.public);


	CONFIG = _.extend(config, envConfig);
	CONFIG.public = publicConfig;
	CONFIG.public.NODE_ENV = NODE_ENV;
	CONFIG.public.ENV = ENV;

	
	Meteor.methods({
		config : function(){
			return CONFIG.public;
		}
	});
