
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("feedbackController",
        ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod',
            function ($scope, $root, $rparams, $location, $ajx, $support) {

                $scope.FeedBackCollection = [];
                $scope.OnLoadResults = function () {
                    $support.start();
                    $scope.FeedBackCollection = [];
                    $ajx.GetNewFeedBack(function (res) {
                        $support.stop();
                        if (res.status === 200) {
                            $scope.FeedBackCollection = res.data.Results;
                        }
                    }, function (err) {
                        $support.stop();
                    });
                };

                $scope.SubmitFeedBack = function () {
                    $support.start();

                    angular.forEach($scope.FeedBackCollection, function (item) {
                        item.Status = 1;
                    });

                    $ajx.SetFeedBack($scope.FeedBackCollection,
                        function (res) {
                            $root.NavigateToRoute('tq');
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        }
                    );
                };

            }]);
});