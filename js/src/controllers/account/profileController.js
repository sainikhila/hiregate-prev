
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/googlePlace' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/otpController' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("profileController",
            ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod', '$sce', 'user',
                function ($scope, $root, $rparams, $loc, $ajx, $support, $sce, $user) {

                    var lastNumber = '';
                    $scope.Contact = {};
                    $scope.workYear = 0;
                    $scope.workMonth = 0;
                    $scope.OnLoadDefaults = function () {

                        $support.start();

                        $ajx.GetProfileContact(
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.Contact = res.data.Results;
                                    if (!$support.IsNull($scope.Contact.WorkingOn)) {
                                        $scope.workYear = new Date($scope.Contact.WorkingOn).getFullYear();
                                        $scope.workMonth = new Date($scope.Contact.WorkingOn).getMonth() + 1;
                                    }

                                    $user.Set('Photo', $scope.Contact.Photo);
                                    lastNumber = $scope.Contact.MobileNumber;
                                    $root.$broadcast('PhotoChanged', {});
                                }
                                $support.stop();
                            }, function (res2) {
                                $support.stop();
                            });
                    };

                    $scope.UpdateZipCode = function (code) {
                        $scope.Contact.AreaCode = code;
                    };

                    function HighLightFields() {
                        angular.forEach($scope.frmProfile.$error, function (vals) {
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
                    };

                    function ShowStatus(errId, errMsg, err, msg) {
                        $support.Hide(errId);
                        if (err === -1) {
                            $root.safeApply(function () {
                                if (msg) {
                                    $support.SetText(errMsg, msg);
                                }
                                else {
                                    $support.SetText(errMsg, 'Please fill mandatory fields');
                                }
                            });

                            $support.Show(errId);
                        } if (err === 1) {
                            $support.SetText(errMsg, msg);
                            $support.Show(errId);
                        }
                    };

                    $scope.ProfileSubmit = function () {

                        ShowStatus('submiError1', 'submiError1Msg', 0);

                        HighLightFields();

                        if ($scope.frmProfile.$valid) {
                            if (lastNumber !== $scope.Contact.MobileNumber) {
                                $support.start();
                                $root.$broadcast("OnOtpFormClicked", {
                                    Name: $scope.Contact.Name,
                                    Mobile: $scope.Contact.AreaCode + '' + $scope.Contact.MobileNumber,
                                    Email: $scope.Contact.Email
                                });
                            } else {
                                UpdateProfile('submiError1', 'submiError1Msg');
                            }

                        } else {
                            ShowStatus('submiError1', 'submiError1Msg', -1);
                        }
                    };

                    $root.$on('WaitForOTP', function (evt, data) {
                        if (data.State === 'Success') {
                            UpdateProfile('submiError1', 'submiError1Msg');
                        }
                    });

                    function UpdateProfile(errId, errMsg) {
                        $support.start();
                        $ajx.SetProfileContact($scope.Contact,
                            function (res) {
                                $support.stop();
                                if ($support.IsSuccess(res)) {
                                    $scope.Contact = res.data.Results;
                                    lastNumber = $scope.Contact.MobileNumber;
                                    if (!$support.IsNull($scope.Contact.WorkingOn)) {
                                        $scope.workYear = new Date($scope.Contact.WorkingOn).getFullYear();
                                        $scope.workMonth = new Date($scope.Contact.WorkingOn).getMonth() + 1;
                                    }
                                    ShowStatus(errId, errMsg, 1, 'Updated Successfull');
                                } else {
                                    ShowStatus(errId, errMsg, -1, 'System fail to process.Please try again.');
                                }
                            }, function (res) {
                                ShowStatus(errId, errMsg, -1, 'System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    }

                    $scope.workMonth = 0; $scope.workYear = 0;

                    function HighLightFields2() {
                        angular.forEach($scope.frmPersonal.$error, function (vals) {
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
                    };

                    var ShortMonths = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                    $scope.highlightWork = function (_red) {
                        var element = document.getElementById('proworkLabel');

                        if (element) {
                            if (_red) {
                                element.className = 'labelheading_error';
                            }
                            else {
                                element.className = 'labelheading';
                            }
                        }
                    };

                    $scope.PersonalSubmit = function () {

                        $scope.highlightWork(false);
                        ShowStatus('submiError2', 'submiError2Msg', 0);

                        HighLightFields2();

                        if ($scope.frmPersonal.$valid) {
                            if ($support.IsNull($scope.workMonth) || $scope.workMonth === 0 || $support.IsNull($scope.workYear) ||$scope.workYear === 0) {
                                $scope.highlightWork(true);
                                ShowStatus('submiError2', 'submiError2Msg', -1);
                            } else {
                                $scope.Contact.WorkingOn = $scope.workYear + '-' + ShortMonths[$scope.workMonth] + '-01';
                                UpdateProfile('submiError2', 'submiError2Msg');
                            }
                        } else {
                            if ($support.IsNull($scope.workMonth) || $scope.workMonth === 0 || $support.IsNull($scope.workYear) || $scope.workYear === 0) {
                                $scope.highlightWork(true);
                            }
                            ShowStatus('submiError2', 'submiError2Msg', -1);
                        }
                    };
                }]);
    });