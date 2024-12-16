
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/emailValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/companyValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/cinValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/urlValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/googlePlace' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/otpController' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("accountController",
            ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod', '$sce', 'user',
                function ($scope, $root, $rparams, $loc, $ajx, $support, $sce, $user) {

                    $scope.CompanyInfo = {};
                    var lastNumber = '';

                    $scope.LoadDefaults = function () {
                        $support.start();
                        $ajx.GetCompanyInfo(
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.CompanyInfo = res.data.Results;
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    };

                    $scope.LoadDefaultsDetails = function () {
                        $support.start();
                        $ajx.GetShortCompany(
                            function (res) {
                                if (res.status === 200) {
                                    $scope.ShortCompanyInfo = res.data.Results;
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );

                        $ajx.GetCompanyDetails(
                            function (res) {
                                if (res.status === 200) {
                                    $scope.CompanyInfo = res.data.Results;
                                    lastNumber = $scope.CompanyInfo.Contact.MobileNumber;
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    };

                    $scope.UpdateZipCode = function (_code) {
                        $root.safeApply(function () {
                            $scope.CompanyInfo.Company.AreaCode = _code;
                            $scope.CompanyInfo.Contact.AreaCode = _code;
                        });
                    };

                    function ShowStatus(err, msg) {
                        $support.Hide('submissionError');
                        $support.Hide('submissionSuccess');
                        if (err === -1) {
                            $root.safeApply(function () {
                                if (msg) {
                                    $support.SetText('submissionError', msg);
                                }
                                else {
                                    $support.SetText('submissionError', 'Please fill mandatory fields');
                                }
                            });

                            $support.Show('submissionError');
                        } if (err === 1) {
                            $support.Show('submissionSuccess');
                        }
                    }

                    $scope.SubmitUpdate = function () {
                        ShowStatus(0);
                        HighLightFields();
                        if ($scope.frmCorporate.$valid) {
                            if (lastNumber !== $scope.CompanyInfo.Contact.MobileNumber) {
                                $support.start();
                                $root.$broadcast("OnOtpFormClicked", {
                                    Name: $scope.CompanyInfo.Contact.Name,
                                    Mobile: $scope.CompanyInfo.Contact.AreaCode + '' + $scope.CompanyInfo.Contact.MobileNumber,
                                    Email: $scope.CompanyInfo.Contact.Email
                                });
                            } else {
                                UpdateDetails();
                            }
                        }
                        else {
                            ShowStatus(-1);
                        }
                    };

                    function HighLightFields() {
                        angular.forEach($scope.frmCorporate.$error, function (vals) {
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
                                                element.className = 'labelheading_error';
                                            }
                                            else {
                                                element.className = 'labelheading';
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }

                    function UpdateDetails() {
                        $support.start();
                        $ajx.SetCompanyDetails($scope.CompanyInfo,
                            function (res) {
                                $support.stop();
                                if (res.data.status === 200) {
                                    var results = res.data.Results;
                                    ShowStatus(1);
                                } else {
                                    ShowStatus(-1, 'System fail to process.Please try again.');
                                }
                            }, function (res) {
                                ShowStatus(-1, 'System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    }

                    $root.$on('WaitForOTP', function (evt, data) {
                        if (data.State === 'Success') {
                            UpdateDetails();
                        }
                    });

                    $scope.ChangePhoto = function (_photo) {
                        $root.$broadcast('OpenPhotoForEdit', { Company: true, Photo: _photo });
                    };

                    $root.$on('CorporatePhotoUpdated', function (evt, data) {
                        $root.safeApply(function () {
                            var _photo = data.Photo + '?v=' + $support.GetRandomNumber(1, 100);
                            if ($scope.CompanyInfo) {
                                $scope.CompanyInfo.Photo = _photo;
                            }
                            if ($scope.ShortCompanyInfo)
                                $scope.ShortCompanyInfo.Photo = _photo;

                            $("#img_comp_photo").attr("src", _photo);
                        });
                    });
                }]);
    });