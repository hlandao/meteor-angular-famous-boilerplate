/** PEUser Run Funtion **/
var runDeps = ['$meteorSubscribe'];

function PEUserRun($meteorSubscribe) {
    $meteorSubscribe.subscribe('userData');
}

PEUserRun.$inject = runDeps;


/** Register Methods **/
angular.module('pele.users').run(PEUserRun);

