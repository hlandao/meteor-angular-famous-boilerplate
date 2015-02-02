/** PEUserService **/
var serviceDeps = ['$q', '$timeout', '$meteorMethods', '$rootScope','PELog','PEConstants'];

function PEUserService ($q, $timeout, $meteorMethods, $rootScope, PELog, PEConstants){
    var userDefer = $q.defer();
    var booted = false;

    /**
     * Boot user, runs only once and always resolves the userDefer.
     */
     var bootUser = function () {
        if (booted) return;
        booted = true;
        Tracker.autorun(function (comp) {
            Meteor.call('getUserStatus', function (err, user) {
                if (user && user.status) {
                    this.status = user.status;
                    $timeout(function () {
                        userDefer.resolve();
                    }, 0);
                    comp();
                }
            })
        });
    }

    /**
     *
     * @returns {*}
     */
     this.getUserFromStorage = function () {
        var userString = localStorage.getItem(PEConstants.LS.USER_KEY);
        if (userString) {
            return JSON.parse(userString);
        }
    }

    /**
     * Resolved when user is ready
     * @returns {promise}
     */
     this.ready = function () {
        return userDefer.promise;
    }



    bootUser();
}

PEUserService.$inject = serviceDeps;


/** Register Methods **/
angular.module('pele.users').service('PEUser', PEUserService);

