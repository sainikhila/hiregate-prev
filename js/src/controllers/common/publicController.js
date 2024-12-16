
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("publicController",
        ['$scope', '$rootScope', '$routeParams', '$location', 'sharedMethod', 'sharedService', 'user',
            function ($scope, $root, $rparams, $location, $support, $ajx, $user) {

                $scope.Result = {};

                $scope.OnLoadResults = function () {
                    $support.start();

                    $ajx.GetCandidateBySession(function (res) {
                        if (res.status === 200) {
                            $scope.Result = res.data.Results;
                            $support.stop();
                        }
                    }, function (err) {
                        $support.stop();
                    });
                };

                $scope.ToNullValue = function (_val) {
                    return $support.ToNullValue(_val);
                };

                $scope.IsVideoLinkExist = function (lnk) {
                    return !$support.IsNull(lnk);
                };

                $scope.OnPlayAtPosition = function (_id, _time) {
                    var vdoObj = $('#video_' + _id);
                    if (vdoObj !== null) {
                        vdoObj[0].currentTime = _time;
                    }
                };

            }]);

});