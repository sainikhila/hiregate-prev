"use strict";

define(['faceitConsApp' + window.__env.minUrl], function (app) {

    app.service('ajaxService', ['$rootScope', '$http', function ($rootScope, $http) {

        // setting timeout of 1 second to simulate a busy server

        this.AjaxPost = function (data, route, successFunction, errorFunction) {
            //$rootScope.start();
            setTimeout(function () {
                $http.post(route, data).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxPost2 = function (data, contenttype, route, successFunction, errorFunction) {
            // $rootScope.start();
            setTimeout(function () {
                $http.post(route, data, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': contenttype }
                }).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxPost3 = function (data, contenttype, route, successFunction, errorFunction) {
            // $rootScope.start();
            setTimeout(function () {
                $http.post(route, data, {
                    headers: { 'Content-Type': contenttype }
                }).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxGet = function (route, successFunction, errorFunction) {
            setTimeout(function () {
                $http({
                    method: 'GET', url: route
                }).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxFileGet = function (route, successFunction, errorFunction) {
            setTimeout(function () {
                $http({
                    method: 'GET', url: route, responseType: 'arraybuffer'
                }).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
            // $rootScope.start();
            setTimeout(function () {
                $http({
                    method: 'GET', url: route, params: data
                }).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

        this.AjaxGetJsonFile = function (jsonfile, successFunction, errorFunction) {
            setTimeout(function () {
                $http.get(jsonfile).then(function (response) {
                    if (successFunction)
                        successFunction(response);
                }), function (response) {
                    if (errorFunction)
                        errorFunction(response);
                };
            }, 1000);
        };

    }]);
});


