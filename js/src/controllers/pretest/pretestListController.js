
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("pretestListController",
        ['$scope', '$rootScope', 'sharedService', 'sharedMethod', '$routeParams',
            function ($scope, $root, $ajx, $support, $params) {

                $scope.TestList = [];

                $scope.OnDefaultLoad = function () {
                    $support.start();
                    $ajx.GetAllTestsByCompany(function (res) {
                        $support.stop();
                        if ($support.IsSuccess(res)) {
                            $scope.TestList = res.data.Results;
                            $support.ApplyLocalDate($scope.TestList, ['CreatedOn']);
                            console.log($scope.TestList);
                        }
                    }, function (res) {
                        console.log(res);
                        $support.stop();
                    });
                };

            }]);
});