(function(){
    'use strict';

    var app = angular.module('app', ['ui.router']);

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('app', {
                url: '/',
                templateUrl: 'src/templates/main.html',
                controller: 'MainController',
                resolve: {
                    // simple signal service, to make the controller wait for iframe app
                    iframeReady: ['iframeReadySignal', function(iframeReadySignal) {
                        return iframeReadySignal.promise;
                    }],

                    // we need to chain iScope to iframeReady to tell router to wait for iframeReadySignal
                    // then we will can retrieve scope which has been just injected vai resolve
                    iScope: ['iframeReady', 'iframeService', function(iframeReady, iframeService) {
                        return iframeService.getScope();
                    }]
                }
            });
    }]);

    // ---------------------------------------------------------------

    // we need this to delay iframe loading
    app.run(function($rootScope) {
        $rootScope.iframeSrc = 'iframe.html';
        $rootScope.iframeShow = false;
    });

    // ---------------------------------------------------------------
    
    // iframeService contains scope instance of the iframe
    app.factory('iframeService', [function() {
        var scope;
        return {
            getScope: function() {
                return scope;
            },
            setScope: function(newScope) {
                scope = newScope;
            }
        }
    }]);

    // ---------------------------------------------------------------

    // iframeReadySignal, this service will be retrieve in iframe via injector, and will be called when the app in the iframe already initialized
    app.factory('iframeReadySignal', ['$q', 'iframeService', function($q, iframeService) {
        var deferred = $q.defer();

        // set scope on success
        deferred.promise.then(function(scope) {
            iframeService.setScope(scope);
        });

        return deferred;
    }]);

    // ---------------------------------------------------------------

    // iScope is what we want
    app.controller('MainController', ['$scope', '$rootScope', 'iScope', function($scope, $rootScope, iScope) {
        // now we are ready to show the iframe
        $rootScope.iframeShow = true;

        // update destination $scope
        // please note $apply() on scope is needed
        $scope.syncUserInput = function(modelValue) {
            iScope.userInput = modelValue;
            iScope.$apply();
        };
    }]);

})();
