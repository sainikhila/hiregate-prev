
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {
        
        "use strict";

        app.controller("otpController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod',
                function ($scope, $root, $ajx, $support) {

                    var _mobile = '';
                    var _name = '';
                    var _email = '';

                    var OtpSent = false;
                    var OtpNumberErrorType = 0;
                    $scope.OtpNumber = '';
                    var OptProcessing = false;
                    $root.$on('OnOtpFormClicked', function (evt, data) {
                        if (OptProcessing) return;
                        OptProcessing = true;
                        Reset();
                        _name = data.Name;
                        _mobile = data.Mobile;
                        _email = data.Email;
                        setTimeout(function () {
                            SendOTP();
                        }, 100);
                    });

                    function Reset() {
                        _mobile = '';
                        _name = '';
                        _email = '';
                        OtpSent = false;
                        OtpNumberErrorType = 0;
                        $scope.OtpNumber = '';
                        ShowStatus('');
                        WaitForSubmit(false);
                        $support.Hide('btnResendOtp');
                    }

                    function ShowStatus(msg) {
                        $support.SetText('otp_error', '');
                        $support.Hide('otp_error');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('otp_error', msg);
                            $support.Show('otp_error');
                            WaitForSubmit(false);
                        }
                    }

                    function WaitForSubmit(_bool) {
                        $support.SetDisabled('btnOptClose', _bool);
                        $support.SetDisabled('otpText', _bool);
                        $support.SetDisabled('btnSubmitOtp', _bool);
                        $support.SetDisabled('btnResendOtp', _bool);
                    }

                    function SendOTP() {

                        OtpNumberErrorType = 0;
                        OtpSent = false;
                        $scope.OtpNumber = '';

                        var data = {
                            Name: _name,
                            Email: _email,
                            MobileNumber: _mobile
                        };

                        $ajx.SendOTPCode(data,
                            function (res) {
                                if (res.status === 200) {
                                    var results = res.data.Results;
                                    $scope.OtpSent = true;
                                    $support.TriggerDialog('otp_show', false);
                                    $support.stop();
                                }
                            }, function (res) {
                                $support.TriggerDialog('otp_show', false);
                                ShowStatus('System fail to process.Please try again.');
                                $support.stop();
                            }
                        );
                    };

                    $scope.SubmitOtp = function () {

                        WaitForSubmit(true);
                        ShowStatus('');

                        $scope.OtpNumberErrorType = 0;

                        if ($support.IsNull($scope.OtpNumber)) {
                            ShowStatus('Otp Number should not be blank');
                            return;
                        }
                        if ($scope.OtpNumber.length !== 6) {
                            ShowStatus('Otp Number should be 6 Chars length');
                            $support.ShowInline('btnResendOtp');
                            return;
                        }

                        $support.start();
                        $ajx.ConfirmOTPCode($scope.OtpNumber,
                            function (res) {
                                if (res.status === 200) {
                                    var results = res.data.Results;
                                    if (results === "Success") {
                                        OptProcessing = false;
                                        $root.$broadcast("WaitForOTP", { State: 'Success' });
                                        $support.TriggerDialog('pop_closeBtn', false);
                                    } else {
                                        ShowStatus('Invalid Otp Number');
                                        $support.ShowInline('btnResendOtp');
                                    }
                                    $support.stop();
                                }
                            }, function (res) {
                                ShowStatus('System fail to process.Please try again.');
                                $support.ShowInline('btnResendOtp');
                                $support.stop();
                            }
                        );
                    };
                    $scope.OtpFormClosed = function () {
                        OptProcessing = false;
                        $root.$broadcast("WaitForOTP", { State: 'Failure' });
                        $support.TriggerDialog('pop_closeBtn', false);
                    };
                }]);

    });