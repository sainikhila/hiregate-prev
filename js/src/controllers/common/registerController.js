
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngEnter' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngHide' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/emailValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/companyValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/cinValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/gstValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/urlValidate' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/googlePlace' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/otpController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/common/tabController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/common/autoCompleteController' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("registerController",
        ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService',
            'sharedMethod', '$sce', 'storageFactory', 'user', '$controller',
            function ($scope, $root, $rparams, $loc, $ajx,
                $support, $sce, $storage, $user, $controller) {

                angular.extend(this, $controller('autoCompleteController', {
                    $scope: $scope,
                    $support: $support,
                    $ajx: $ajx
                }));

                /* Authentication Methods starts here */
                
                $scope.form = {};

                $root.$on('BadRequest', function (evt, data) {
                    if (data.status !== 200) {
                        $support.stop();
                        ShowLoginState(data.msg);
                    }
                });

                function CleanUp() {
                    $support.SetValue('loginPassword', '');
                    $support.SetValue('loginEmail', '');
                    $support.SetValue('forgotEmail', '');

                    ShowLoginState('');
                    ShowForgotLoginState('', false);
                }

                function ShowLoginState(msg) {
                    $support.Hide('btnResendEmail');
                    $support.SetText('errorLogin', '');
                    $support.Hide('errorLogin');

                    if (!$support.IsNull(msg)) {
                        $support.SetText('errorLogin', msg);
                        $support.Show('errorLogin');
                    }
                }

                function ShowForgotLoginState(msg, _success) {

                    $support.SetText('statusForgotLogin', '');
                    $support.Hide('statusForgotLogin');

                    if (!$support.IsNull(msg)) {
                        if (_success) {
                            $support.ChangeClass('statusForgotLogin', 'si_success');
                        } else {
                            $support.ChangeClass('statusForgotLogin', 'si_error');
                        }
                        $support.SetText('statusForgotLogin', msg);
                        $support.Show('statusForgotLogin');
                    }
                }

                $scope.ReSendEmail = function () {

                    ShowLoginState('');

                    var _email = $support.GetValue('loginEmail');

                    if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                        ShowLoginState('Invalid e-mail address');
                        return;
                    }

                    $support.start();

                    var data = {
                        'Email': _email
                    };

                    $ajx.ReSendConfirmationEmail(data,
                        function (res) {
                            $support.stop();
                            ShowLoginState('Please check your email.');
                        }, function (res) {
                            $support.stop();
                            console.log(res);
                        }
                    );
                };

                $scope.SubmitLogin = function () {

                    ShowLoginState('');

                    var _pws = $support.GetValue('loginPassword');
                    var _email = $support.GetValue('loginEmail');

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
                    if (parseInt(res.status) === 200 && parseInt(res.data.status) === 200) {
                        $storage.setValue('Identity', res.data);
                        $ajx.GetLoggedInUser(
                            function (resp) {
                                $support.stop();
                                if (parseInt(resp.status) === 200 && parseInt(resp.data.status) === 200) {
                                    $user.setModal(resp.data.Results);
                                    $root.NavigateToRoute('db');
                                } else {
                                    $support.SetText('errorLogin', resp.data.statusText);
                                    $support.Show('errorLogin');
                                }
                            },
                            function (resp) {
                                console.log(resp);
                                $support.stop();
                            }
                        );
                    }
                    else {
                        var msg = res.data.statusText;

                        if (msg.indexOf('confirm your email') > -1) {
                            $support.Show('btnResendEmail');
                        }

                        $support.SetText('errorLogin', msg);
                        $support.Show('errorLogin');
                        $support.stop();
                    }
                };

                var failureToken = function failureToken(resp) {
                    $support.stop();
                    console.log(resp);
                };

                $scope.SubmitForgotPassword = function () {

                    ShowForgotLoginState('', false);

                    var _email = $support.GetValue('forgotEmail');

                    if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                        ShowForgotLoginState('Invalid Email ID. Please retry', false);
                        return;
                    }

                    $support.start();

                    $ajx.ForgotPassword(_email,
                        function (res) {
                            $support.stop();
                            if (res.data.Results === 'Success') {
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

                $scope.ShowForgotPassword = function () {
                    CleanUp();
                    $support.Hide('reg-login-details');
                    $support.Show('reg-fgt-pswd');
                };

                $scope.HideForgotPassword = function () {
                    CleanUp();
                    $support.Show('reg-login-details');
                    $support.Hide('reg-fgt-pswd');
                };

                /* Authentication Methods ends here */

                $scope.UpdateZipCode = function (_code) {
                    $root.safeApply(function () {
                        $scope.NewSignUp.Company.AreaCode = _code;
                        $scope.NewSignUp.Contact.AreaCode = _code;
                    });
                };

                /* SignUp Methods Starts here */

                $scope.NewSignUp = {
                    Login: {
                        Email: '',
                        Password: ''
                    },
                    Company: {
                        Name: '',
                        CIN: '',
                        Website: '',
                        Address: '',
                        City: '',
                        State: '',
                        Country: '',
                        ZipCode: '',
                        AreaCode: '',
                        LandLine: ''
                    },
                    Contact: {
                        Name: '',
                        Email: '',
                        Gender: '',
                        AreaCode: '',
                        MobileNumber: '',
                        LandLine: '',
                        Extension: ''
                    }
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
                        $support.SetDisabled('btnSubmitRegister', true);
                        $support.SetDisabled('ebcaptchainput', true);
                    }
                }

                $scope.SignUpSubmit = function () {
                    $support.SetDisabled('btnSubmitRegister', true);
                    ShowStatus(0);
                    $scope.NewSignUp.Contact.Email = $scope.NewSignUp.Login.Email;
                    var bValid = HighlightNonRequired();
                    HighLightFields();
                    if ($scope.frmCorporate.$valid && bValid) {
                        $support.start();
                        $root.$broadcast("OnOtpFormClicked", {
                            Name: $scope.NewSignUp.Contact.Name,
                            Mobile: $scope.NewSignUp.Contact.AreaCode + '' + $scope.NewSignUp.Contact.MobileNumber,
                            Email: $scope.NewSignUp.Contact.Email
                        });
                    } else {
                        ShowStatus(-1);
                        $support.SetDisabled('btnSubmitRegister', false);
                    }
                };

                function HighlightNonRequired() {
                    var arrFlds = ['cpcountry'
                        , 'cpstate'];

                    var bValid = true;

                    angular.forEach(arrFlds, function (eId) {

                        var relm = document.getElementById(eId);

                        if (!relm) {
                            relm = document.getElementsByName(eId)[0];
                        }

                        if ($support.IsNull(relm.value)) {
                            var elm = eId + 'Label';
                            var element = document.getElementById(elm);
                            if (!element) {
                                element = document.getElementsByName(elm)[0];
                            }

                            if (element) {
                                if (!relm.disabled) {
                                    element.className = 'labelheading_error';
                                    bValid = false;
                                }
                                else {
                                    element.className = 'labelheading';
                                }
                            }
                        }

                    });
                    return bValid;
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

                $root.$on('WaitForOTP', function (evt, data) {
                    if (data.State === 'Success') {
                        $support.start();
                        $ajx.RegisterCompany($scope.NewSignUp,
                            function (res) {
                                $support.stop();
                                if (parseInt(res.data.status) === 200) {
                                    ShowStatus(1);
                                } else {
                                    $support.SetDisabled('btnSubmitRegister', false);
                                    ShowStatus(-1, 'System fail to process.Please try again.');
                                }
                            }, function (res) {
                                $support.SetDisabled('btnSubmitRegister', false);
                                ShowStatus(-1, 'System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    } else {
                        $support.SetDisabled('btnSubmitRegister', false);
                    }
                });

                /* SignUp Methods Ends here */

                $scope.Enquiry = {
                    Name: '',
                    Email: '',
                    Number: ''
                };

                $scope.SubmitEnquiry = function () {

                    $scope.Message = '';
                    $scope.CSSStyle = 'success';
                    $support.Hide('enqMsgId');
                    if (!$scope.form.frmenquiry.$valid) {
                        $scope.HighLightEnqueryFields();
                        $scope.CSSStyle = 'error';
                        $scope.Message = "Clear error fields and update";
                        $support.Show('enqMsgId');
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
                        $support.Show('enqMsgId');

                        $ajx.ContactToTeam(data, $scope.EnquirSent, $scope.EnquirSentFail);
                    }
                };

                $scope.EnquirSent = function (resp) {
                    $scope.Enquiry.Name = '';
                    $scope.Enquiry.Email = '';
                    $scope.Enquiry.Number = '';
                    $scope.Message = "Mail has sent to HireGate Team";
                    $support.Show('enqMsgId');
                };

                $scope.EnquirSentFail = function (resp) {
                    $scope.Message = "Unable to send a mail. Try again.";
                    $support.Show('enqMsgId');
                };

                $scope.HighLightEnqueryFields = function () {

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

            }]);
});