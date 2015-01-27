/** Sub Modules **/
angular.module('pele.config',[]);
angular.module('pele.routing',['ui.router','pele.config','pele.users']);
angular.module('pele.users',['angular-meteor','pele.config','pele.logger']);
angular.module('pele.logger',['angular-meteor','pele.config','pele.users']);
angular.module('pele.push',['pele.config','pele.users']);


/** Main Module **/
angular.module('pele',['pele.config','pele.routing','pele.users','pele.logger','pele.push']);


