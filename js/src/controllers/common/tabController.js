
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("tabController",
            ['$scope', '$rootScope', 'sharedMethod', 'sharedService',
                function ($scope, $root, $support, $ajx) {

                    $scope.FaqQuestions = [];

                    $scope.Enquiry = {
                        Name: '',
                        Email: '',
                        Number: ''
                    };

                    $scope.form = {};

                    $scope.$on("LoadDefaults", function (evt, data) {

                    });

                    $scope.SubmitEnquiry = function () {

                        $scope.Message = '';
                        $scope.CSSStyle = 'success';
                        $support.Hide('msgId');
                        if (!$scope.form.frmenquiry.$valid) {
                            $scope.HighLightFields();
                            $scope.CSSStyle = 'error';
                            $scope.Message = "Clear error fields and update";
                            $support.Show('msgId');
                        }
                        else {

                            $scope.Enquiry.Name =
                                $support.getModalValue($scope, 'frmenquiry', 'enqfname');
                            $scope.Enquiry.Email =
                                $support.getModalValue($scope, 'frmenquiry', 'enqemail');
                            $scope.Enquiry.Number =
                                $support.getModalValue($scope, 'frmenquiry', 'enqcontactnumber');

                            var data = {
                                Name: $scope.Enquiry.Name,
                                Email: $scope.Enquiry.Email,
                                Number: $scope.Enquiry.Number
                            };

                            $scope.Message = "Please wait...";
                            $support.Show('msgId');

                            //$support.startcontainer('requestcallcontainer');
                            $ajx.ContactToTeam(data, $scope.EnquirSent, $scope.EnquirSentFail);
                        }
                    };

                    $scope.EnquirSent = function (resp) {
                        //$support.stopcontainer('requestcallcontainer');
                        $scope.Enquiry.Name = '';
                        $scope.Enquiry.Email = '';
                        $scope.Enquiry.Number = '';
                        $scope.Message = "Mail has sent to HireGate Team";
                        $support.Show('msgId');
                    };

                    $scope.EnquirSentFail = function (resp) {
                        //$support.stopcontainer('requestcallcontainer');
                        $scope.Message = "Unable to send a mail. Try again.";
                        $support.Show('msgId');
                    };

                    $scope.HighLightFields = function () {

                        angular.forEach($scope.form.frmenquiry.$error, function (vals) {
                            if (angular.isArray(vals)) {
                                angular.forEach(vals, function (val) {
                                    if (val) {

                                        var relm = document.getElementById(val.$name);

                                        if (!relm) {
                                            relm = document.getElementsByName(val.$name)[0];
                                        }

                                        var elm = val.$name + 'Label';
                                        var element = document.getElementById(elm);
                                        if (!element) {
                                            element = document.getElementsByName(elm)[0];
                                        }

                                        if (element) {
                                            if (!relm.disabled) {
                                                element.className = 'request_labelheading_error';
                                            }
                                            else {
                                                element.className = 'request_labelheading';
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    };

                    //function loadFaq() {
                    //    //var wndHash = window.location.pathname;

                    //    //if (wndHash && wndHash == '/faq') {
                    //    //    $http({
                    //    //        method: 'GET', url: 'faq.json'
                    //    //    }).then(function (resp) {
                    //    //        $scope.FaqQuestions = resp.data;
                    //    //    }), function (resp) {

                    //    //    };
                    //    //}
                    //};

                    //loadFaq();

                }]);

    });