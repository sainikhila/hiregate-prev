define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("footerController",
            ['$scope', '$route', 'sharedService', 'sharedMethod',
                function ($scope, $route, sharedService, cmx) {

                    $scope.innerStyles = function () {
                        var routepath = $route.current.params.section;
                        if (routepath) {
                            return 'clear: both;position: relative;z-index: 10;margin-top: -380px;';
                        }
                        return '';
                    };

                    $scope.CopyRight = new Date();
                    // Footer entity
                    $scope.Email = {
                        EmailTo: '',
                        Recipient: '',
                        Recipients: [],
                        Body: '',
                        Subject: 'More information required'
                    };

                    // Validate Footer and submit the form to server
                    $scope.SubmitFooter = function () {

                        cmx.Hide('footersuccessId');
                        cmx.Hide('footererrorId');
                        cmx.Hide('footerreqerror');
                        cmx.Show('footermsgInfo');

                        if ($scope.form.mainfooter.$valid) {

                            $scope.footererror = false;

                            var data = {
                                Name: $scope.Email.Recipient,
                                Email: $scope.Email.EmailTo
                            };

                            sharedService.ContactToTeam(data, $scope.PostSuccess, $scope.PostFailure);
                        }
                        else {
                            cmx.Hide('footermsgInfo');
                            cmx.Show('footerreqerror');
                        }
                    };

                    // Ajax Post success status method
                    $scope.PostSuccess = function (response) {
                        cmx.Hide('footersuccessId');
                        cmx.Hide('footererrorId');
                        cmx.Hide('footermsgInfo');
                        cmx.footererror = false;
                        cmx.Show('footersuccessId');
                        $scope.Email = {
                            EmailTo: '',
                            Recipient: '',
                            Recipients: [],
                            Body: '',
                            Subject: 'More information required'
                        };
                    };

                    // Ajax Post failure status method
                    $scope.PostFailure = function (response) {
                        cmx.Hide('footersuccessId');
                        cmx.Show('footererrorId');
                        cmx.Hide('footermsgInfo');
                    };

                    $scope.OnKeyUp = function (evt) {
                        if (evt.which != 13) {
                            cmx.Hide('footerreqerror');
                            cmx.Hide('footersuccessId');
                            cmx.Hide('footererrorId');
                            cmx.Hide('footermsgInfo');
                        }
                    };

                    $scope.OnQuickLinksClicked = function (item) {

                        $window.sessionStorage.QuickLink = item;

                        var srcURL = angular.element(document.querySelector('#SourceURL'))[0].value;

                        if (srcURL == "Home") {
                            window.location.href = '/Home/QuickLinks';
                        }
                        else {
                            if ($window.location.hash == 'ql') {
                                $rootScope.$broadcast("ChangeTab");
                                $window.scrollTo(0, 0);
                            }
                            else {
                                $scope.NavigateToRoute('ql');
                            }
                        }
                    };

                }]);

    });
