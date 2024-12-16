
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/emailValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/companyValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/cinValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/urlValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/googlePlace' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/otpController' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("acctUserController",
            ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod', '$sce', 'user',
                function ($scope, $root, $rparams, $loc, $ajx, $support, $sce, $user) {

                    $scope.CompanyUsers = [];

                    $scope.Username = '';
                    $scope.Email = '';
                    $scope.MobileNumber = '';

                    $scope.Role = {
                        FullAccess: false,
                        JobCreation: false,
                        ProcessAssociate: false
                    };

                    var lastNumber = '';

                    $scope.LoadDefaultsDetails = function () {
                        $support.start();

                        $ajx.GetShortCompany(
                            function (res) {
                                if (res.status === 200) {
                                    $scope.ShortCompanyInfo = res.data.Results;
                                }
                                RefreshUsers();
                            }, function (res) {
                                $support.stop();
                            }
                        );

                    };

                    $scope.SubmitUser = function () {
                        $support.ChangeClass('txtCUserRoleLabel', 'labelheading');
                        ShowStatus(0);
                        HighLightFields();

                        var roles = getRoleKey();
                        if (parseInt(roles) === 0) {
                            $support.ChangeClass('txtCUserRoleLabel', 'labelheading_error');
                            ShowStatus(-1, 'Atleast one user role should be selected.');
                            return;
                        }

                        if ($scope.frmCorporate.$valid) {
                            var data = {
                                Name: $scope.Username,
                                Email: $scope.Email,
                                MobileNumber: $scope.MobileNumber,
                                Role: roles
                            };

                            $support.start();
                            $ajx.AddCompanyUser(data,
                                function (res) {
                                    $support.stop();
                                    if (res.data.status === 200) {
                                        ShowStatus(1);
                                        RefreshUsers();
                                    } else {
                                        ShowStatus(-1, 'System fail to process.Please try again.');
                                    }
                                }, function (res) {
                                    ShowStatus(-1, 'System fail to process.Please try again.');
                                    $support.stop();
                                }
                            );

                        } else {
                            ShowStatus(-1);
                        }
                    };

                    function getRoleKey() {
                        return $support.ToInteger($scope.Role.FullAccess) + '' +
                            $support.ToInteger($scope.Role.JobCreation) + '' +
                            $support.ToInteger($scope.Role.ProcessAssociate);
                    }

                    function RefreshUsers() {
                        $ajx.GetCompanyUsers(
                            function (res) {
                                if (res.status === 200) {
                                    $scope.CompanyUsers = res.data.Results;
                                    ExtractRoles();
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    }

                    function ExtractRoles() {
                        angular.forEach($scope.CompanyUsers, function (item) {

                            var str = item.Role;
                            if ($support.IsNull(str)) str = '000';

                            var Role = {
                                FullAccess: $support.IntToBool(str.charAt(0)),
                                JobCreation: $support.IntToBool(str.charAt(1)),
                                ProcessAssociate: $support.IntToBool(str.charAt(2))
                            };

                            item.Role = Role;
                        });
                    }

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

                    $scope.ChangeCompanyUserState = function (keyId, _state) {

                        var data = {
                            KeyId: keyId,
                            KeyState: _state
                        };

                        ShowStatus(0);
                        $support.start();
                        $ajx.ChangeCompanyUserState(data,
                            function (res) {
                                $support.stop();
                                if (res.data.status !== 200) {
                                    ShowStatus(-1, 'System fail to process.Please try again.');
                                }
                                RefreshUsers();
                            }, function (res) {
                                ShowStatus(-1, 'System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    };

                    $scope.FullAccessClicked = function (obj) {
                        obj.ProcessAssociate = obj.FullAccess;
                        obj.JobCreation = obj.FullAccess;
                    };

					$scope.ProcessAccessClicked = function (obj) {
                        obj.FullAccess = obj.ProcessAssociate && obj.JobCreation;
                    };

                    $scope.JobAccessClicked = function (obj) {
                        obj.FullAccess = obj.ProcessAssociate && obj.JobCreation;
                    };
					
                    $scope.UpdateCompanyUserRole = function (obj) {

                        var roles = $support.ToInteger(obj.Role.FullAccess) + '' +
                            $support.ToInteger(obj.Role.JobCreation) + '' +
                            $support.ToInteger(obj.Role.ProcessAssociate);

                        if (parseInt(roles) === 0) {
                            $support.Show('popRoleError');
                            return;
                        }
                        var data = {
                            Id: obj.ContactId,
                            Text: roles
                        };

                        ShowStatus(0);
                        $support.start();
                        $ajx.UpdateCompanyUserRole(data,
                            function (res) {
                                $support.stop();
                                if (res.data.status !== 200) {
                                    ShowStatus(-1, 'System fail to process.Please try again.');
                                }
                                RefreshUsers();
                            }, function (res) {
                                ShowStatus(-1, 'System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    };

                }]);
    });