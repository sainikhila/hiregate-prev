
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    
], function (app) {

    "use strict";

    app.controller("docAccessController",
        ['$scope', 'sharedService', 'sharedMethod', '$window',
            function ($scope, $ajx, $support, $window) {

                $scope.DocList = [];

                $scope.OnLoadResults = function () {
                    $support.start();
                    $scope.DocList = [];
                    $ajx.GetSessionDocuments(function (res) {
                        $support.stop();
                        if (res.status === 200 && res.data.status === 200) {
                            var items = res.data.Results;
                            angular.forEach(items, function (item) {
                                if (!$support.IsNull(item.AttachName)) {
                                    $scope.DocList.push(item);
                                }
                            });
                        }
                    }, function (err) {
                        $support.stop();
                    });
                };

                $scope.OpenDoc = function (keyId) {
                    var item = $support.GetItem($scope.DocList, 'AttachmentId', keyId);
                    $window.open(item.FileName, '_blank');
                };


            }]);
});