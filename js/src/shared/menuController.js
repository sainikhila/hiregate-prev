
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/filePhotoChange' + window.__env.minUrl
    , window.__env.baseUrl + 'factory/ng-img-crop' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngEnter' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("menuController",
        ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'user', '$sce', 'storageFactory',
            function ($scope, $root, $ajx, $support, $user, $sce, $storage) {

                $scope.AccountPhoto = '';

                function DisplayPhoto() {
                    $scope.AccountPhoto = $user.Get('Photo') + '?v=' + $support.GetRandomNumber(11111, 99999);
                    var noPhoto = 'photo_add';
                    $scope.AddPhoto = false;

                    if ($scope.AccountPhoto.indexOf(noPhoto) > -1) {
                        $scope.AddPhoto = true;
                    }
                }

                DisplayPhoto();

                $scope.LoadForPhotoEdit = function () {
                    $root.$broadcast('OpenPhotoForEdit', { Contact: true, Photo: $user.Get('Photo') });
                };

                $scope.DeleteAccountPhoto = function () {
                    $root.$broadcast('PhotoToDelete', { Contact: true });
                };

                $root.$on("PhotoChanged", function (evt, data) {
                    DisplayPhoto();
                });

                $scope.SigninEmail = '';
                $scope.SigninPws = '';
                $scope.ForgotPwsEmail = '';
                $scope.error_message1 = '';
                $scope.error_message2 = '';

                $scope.ChangePwsOPws = '';
                $scope.ChangePwsNPws = '';
                $scope.ChangePwsCPws = '';

                function reset() {
                    $scope.SigninEmail = '';
                    $scope.SigninPws = '';
                    $scope.ForgotPwsEmail = '';
                    $scope.error_message1 = '';
                    $scope.error_message2 = '';
                    $support.Hide('displayerror1');
                    $support.Hide('displayerror2');
                }

                $scope.ShowSignInPopup = function () {
                    $scope.ShowLoginPanel();
                    $support.TriggerDialog('signin_show2', false);
                };

                $scope.ShowLoginPanel = function () {
                    reset();
                    $support.Hide('fgt-pswd');
                    $support.Show('logindetails');
                };

                $scope.ShowForgotPwsPanel = function () {
                    reset();
                    $support.Hide('logindetails');
                    $support.Show('fgt-pswd');
                };

                function ShowLoginState(msg) {
                    $scope.error_message1 = '';
                    $support.Hide('displayerror1');

                    if (!$support.IsNull(msg)) {
                        $scope.error_message1 = msg;
                        $support.Show('displayerror1');
                    }
                }

                $root.$on('BadRequest', function (evt, data) {
                    if (data.status !== 200) {
                        $support.stop();
                        ShowLoginState(data.msg);
                    }
                });

                $scope.SignInClicked = function () {
                    ShowLoginState('');
                    var _pws = $scope.SigninPws;
                    var _email = $scope.SigninEmail;

                    if ($support.IsNull(_pws) || $support.IsNull(_email)) {
                        ShowLoginState('Invalid Credentials. Please retry');
                        return;
                    }

                    if (!$support.IsValidEmail(_email)) {
                        ShowLoginState('Invalid e-mail address');
                        return;
                    }

                    $support.start();

                    var data = {
                        'Email': _email,
                        'Password': _pws
                    };

                    $ajx.LoginToServer($support.EncodeDetails(data), successToken, failureToken);
                };

                var successToken = function successToken(res) {
                    if (parseInt(res.status) === 200) {
                        $storage.setValue('Identity', res.data);
                        if (parseInt(res.data.status) !== 200) {
                            if (res.data.statusText.startsWith("Invalid token")) {
                                ShowLoginState('System fail to process. Please try again.');
                            } else {
                                ShowLoginState(res.data.statusText);
                            }
                            $support.stop();
                        } else {
                            $ajx.GetLoggedInUser(
                                function (resp) {
                                    $support.stop();
                                    if (parseInt(resp.status) === 200 && parseInt(resp.data.status) === 200) {
                                        $user.setModal(resp.data.Results);
                                        $root.NavigateToRoute('db');
                                    } else {
                                        if (resp.data.statusText.startsWith("Invalid token")) {
                                            ShowLoginState('System fail to process. Please try again.');
                                        } else {
                                            ShowLoginState(resp.data.statusText);
                                        }
                                    }
                                },
                                function (resp) {
                                    ShowLoginState('System fail to process. Please try again.');
                                    $support.stop();
                                }
                            );
                        }
                    }
                    else {
                        ShowLoginState('System fail to process. Please try again.');
                        $support.stop();
                    }
                };

                var failureToken = function failureToken(resp) {
                    ShowLoginState('System fail to process. Please try again.');
                    $support.stop();
                };

                function ShowForgotLoginState(msg, _success) {

                    $scope.error_message2 = '';
                    $support.Hide('displayerror2');

                    if (!$support.IsNull(msg)) {
                        $scope.error_message2 = msg;
                        $support.Show('displayerror2');
                    }
                }

                $scope.ForgotPwsClicked = function () {
                    ShowForgotLoginState('', false);

                    var _email = $scope.ForgotPwsEmail;

                    if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                        ShowForgotLoginState('Invalid Email ID. Please retry', false);
                        return;
                    }

                    $support.start();

                    $ajx.ForgotPassword(_email,
                        function (res) {
                            $support.stop();
                            if (parseInt(res.data.Results) === 0 || res.data.Results === 'Success') {
                                ShowForgotLoginState('Password sent your registered e-mail.', true);
                            } else {
                                var msg = $support.ResultCodeStatus(parseInt(res.data.Results));
                                ShowForgotLoginState(msg, false);
                            }
                        }, function (res) {
                            ShowForgotLoginState('System fail to process.Please try again.', false);
                            $support.stop();
                        }
                    );
                };

                $scope.SignOutClicked = function () {
                    $ajx.LogoutFromServer(logoutSuccess, logoutSuccess);
                };

                var logoutSuccess = function logoutSuccess(resp) {
                    sessionStorage.clear();
                    $user.Init();
                    $root.NavigateToRoute('/');
                };

                function resetchange() {
                    $scope.ChangePwsCPws = '';
                    $scope.ChangePwsOPws = '';
                    $scope.ChangePwsNPws = '';
                    $scope.ChangePwsError = '';
                    $support.Show('changepassword');
                    $support.Hide('success');
                    $support.Hide('errChangePws');
                }

                function ShowChangePwsStatus(msg, status) {
                    $scope.ChangePwsError = '';
                    $support.Hide('errChangePws');

                    if (!$support.IsNull(msg)) {
                        $scope.ChangePwsError = msg;
                        $support.Show('errChangePws');
                    } else if (status) {
                        $support.Hide('changepassword');
                        $support.Show('success');
                    }
                }

                $scope.ShwoChangedPassword = function () {
                    resetchange();
                    $support.TriggerDialog('pswd_show2', false);
                };

                $scope.ChangePwsClicked = function () {
                    ShowChangePwsStatus('', false);

                    var _pwsN = $scope.ChangePwsNPws;
                    var _pwsO = $scope.ChangePwsOPws;
                    var _pwsC = $scope.ChangePwsCPws;

                    if ($support.IsNull(_pwsN) || $support.IsNull(_pwsO) || $support.IsNull(_pwsC)) {
                        ShowChangePwsStatus('All fields are mandatory.', false);
                        return;
                    }

                    if (_pwsN !== _pwsC) {
                        ShowChangePwsStatus('Password does not match.', false);
                        return;
                    }

                    $support.start();

                    var data = {
                        Password: _pwsN,
                        OldPassword: _pwsO
                    };

                    $ajx.ChangePassword(data,
                        function (res) {
                            $support.stop();
                            if (parseInt(res.data.Results) === 0 || res.data.Results === 'Success') {
                                $scope.ChangePwsOPws = '';
                                $scope.ChangePwsNPws = '';
                                $scope.ChangePwsCPws = '';
                                ShowChangePwsStatus('', true);
                            } else {
                                var msg = $support.ResultCodeStatus(parseInt(res.data.Results));
                                ShowChangePwsStatus(msg, false);
                            }
                        }, function (res) {
                            ShowChangePwsStatus('System fail to process.Please try again.', false);
                            $support.stop();
                        }
                    );
                };

                $scope.Demo = {};
                $scope.ShowRequestDemo = function () {
                    ResetHighLightFields();
                    $scope.Demo = {};
                    $support.Hide('demoRequestFailed');
                    $support.SetDisabled('btnDemoReqSubmit', false);
                    $support.TriggerDialog('demo_show2', false);
                };

                $scope.SubmitRequestDemo = function () {

                    $support.Hide('demoRequestError');

                    HighLightFields();

                    var bValid = $scope.frmDemoRequest.$valid;

                    if (!bValid) {
                        $support.Show('demoRequestError');
                        return;
                    }

                    if ($support.IsNull($scope.Demo.Email)) {
                        $support.Show('demoRequestError');
                        return;
                    }

                    if (!$support.IsValidEmail($scope.Demo.Email)) {
                        $support.Show('demoRequestError');
                        return;
                    }

                    $support.start();
                    $ajx.RequestDemo($scope.Demo, $scope.PostSuccess, $scope.PostFailure);
                };

                $scope.PostSuccess = function (response) {
                    $scope.Demo = {};
                    $support.stop();
                    $support.Show('demoRequestSuccess');
                    $support.SetDisabled('btnDemoReqSubmit', true);
                };

                // Ajax Post failure status method
                $scope.PostFailure = function (response) {
                    $support.stop();
                    $support.Show('demoRequestFailed');
                };

                $scope.HideRequestDemo = function () {
                    $support.Hide('demoRequestError');
                    $support.Hide('demoRequestSuccess');
                    $support.Hide('demoRequestFailed');

                    $scope.Demo = {};
                    $support.TriggerDialog('pop_closeBtn_generic', false);
                };

                function ResetHighLightFields() {
                    var arrFlds = ['txtReqNameLabel'
                        , 'txtReqEmailLabel'
                        , 'txtReqPhoneLabel'
                        , 'txtReqCompanyLabel'
                        , 'txtReqCityLabel'
                        , 'txtReqCountryLabel'];

                    angular.forEach(arrFlds, function (elm) {

                        var element = document.getElementById(elm);
                        if (!element) {
                            element = document.getElementsByName(elm)[0];
                        }

                        if (element )  element.className = 'labelheading';
                    });
                }

                function HighLightFields() {
                    angular.forEach($scope.frmDemoRequest.$error, function (vals) {
                        if (angular.isArray(vals)) {
                            angular.forEach(vals, function (val) {
                                if (val) {
                                    var elName = val.$name;
                                    var elm = elName + 'Label';

                                    var relm = document.getElementById(elName);

                                    if (!relm) {
                                        relm = document.getElementsByName(elName)[0];
                                    }

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

            }]);
});
