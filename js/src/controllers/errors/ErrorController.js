
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("ErrorController",
            ['$scope', '$routeParams', 'sharedMethod', 'user','$location',
                function ($scope, $routeParams, sharedMethod, userservice, $location) {
                    
                    sharedMethod.stop();

                    $scope.Message = 'Unknown page response error';

                    function getQueryStringId() {
                        var parentPath = $location.hash();

                        var ppath = parentPath.split('#');

                        if (ppath.length > 1) {
                            parentPath = ppath[1];
                        }
                        else {
                            ppath = parentPath.split('/');
                            if (ppath.length > 1) {
                                parentPath = ppath[1];
                            }
                        }

                        return parentPath;
                    };

                    $scope.LoadDefaults = function () {

                        var msg = 'Unknown page response error';
                        var errId = parseInt(getQueryStringId());

                        switch (errId) {
                            case 400: msg = '400: Bad request.'; break;
                            case 401: msg = '401: You are trying to access the Un-Authorized page.'; break;
                            case 403: msg = '403: Page forbidden.'; break;
                            case 404: msg = '404: The page you are looking is not found.'; break;
                            case 408: msg = '408: Request timeout.'; break;
                            case 498: msg = '498: Invalid Token.'; break;
                            case 499: msg = '499: Token Required.'; break;

                            case 500: msg = '500: Internal Server Error.'; break;
                            case 502: msg = '502: Bad Gateway.'; break;
                            case 503: msg = '503: The server is currently unavailable.'; break;
                            case 505: msg = '505: HTTP Version Not Supported.'; break;
                            case 598: msg = '598: Network read timeout error.'; break;
                            case 599: msg = '599: Network connect timeout error.'; break;
                        };

                        $scope.Message = msg;
                    };

                }]);

    });