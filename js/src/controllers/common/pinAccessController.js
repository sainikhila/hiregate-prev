
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngEnter' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("pinAccessController",
        ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod', 'storageFactory', 'user',
            function ($scope, $root, $rparams, $location, $ajx, $support, $storage, $user) {

                var id = $rparams.Id;

                $scope.OnPinSubmit = function () {
                    ShowLoginState('');

                    var _email = $support.GetValue('txtEmail');
                    var pinNum = $support.GetValue('txtPinNum');
                    if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                        ShowLoginState('Enter valid e-mail address');
                        return;
                    }

                    if ($support.IsNull(pinNum)) {
                        ShowLoginState('Enter valid pin number');
                        return;
                    }

                    $support.start();

                    var data = {
                        Item1: pinNum.toString(),
                        Item2: id.toString(),
                        Item3: _email
                    };

                    $ajx.GetSessionValidate(data, function (res) {
                        if (parseInt(res.status) === 200 && parseInt(res.data.status) === 200) {
                            $storage.setValue('Identity', res.data);
                            $user.setModal({ FullName: 'NormalUser' });
                            $support.stop();

                            switch (parseInt(id)) {
                                case 1: // FeedBack
                                    $root.NavigateToRoute('fb');
                                    break;
                                case 2: // SessionAccess
                                    $root.NavigateToRoute('fpb');
                                    break;
                                case 3: // SharedDocuments
                                    $root.NavigateToRoute('pdc');
                                    break;
                                case 4: // ApprovalRequest
                                    //$root.NavigateToRoute('fpa');
                                    break;
                            }
                        } else {
                            var msg = res.data.statusText;
                            ShowLoginState(msg);
                            $support.stop();
                        }
                    }, function (err) {
                        $support.stop();
                    });
                };

                function ShowLoginState(msg) {
                    $support.SetText('submissionError', '');
                    $support.Hide('submissionError');

                    if (!$support.IsNull(msg)) {
                        $support.SetText('submissionError', msg);
                        $support.Show('submissionError');
                    }
                }
            }]);
});