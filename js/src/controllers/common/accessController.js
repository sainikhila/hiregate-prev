
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl

], function (app) {

    "use strict";

    app.controller("accessController",
        ['$scope', '$routeParams', 'sharedService', 'sharedMethod', 
            function ($scope, $rparams, $ajx, $support) {

                var id = $rparams.id;
                var kid = $rparams.kid;

                $scope.DocList = [];
                $scope.NotifyMsg = '';

                var success = 'Session Sharing Approved';
                var processing = 'Please wait Sharing details are updating...';

                $scope.OnLoadResults = function () {
                    $scope.NotifyMsg = processing;
                    $support.start();
                    var data = {
                        Item1: id,
                        Item2: kid
                    }
                    $ajx.SetSharingApproval(data,function (res) {
                        $support.stop();
                        if (res.status === 200 && res.data.status === 200) {
                            $scope.NotifyMsg = success;
                        } else {
                            $scope.NotifyMsg = 'System fail to process. Please try again.';
                        }
                    }, function (err) {
                        $support.stop();
                        $scope.NotifyMsg = 'System fail to process. Please try again.';
                    });
                };
            }]);
});