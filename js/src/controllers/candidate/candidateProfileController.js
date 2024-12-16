
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/googlePlace' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/fileChange' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("candidateProfileController",
        ['$scope', '$rootScope', '$routeParams', 'sharedMethod', 'sharedService',
            function ($scope, $root, $rparams, $support, $ajx) {

                $scope.DisableSharing = true;
                $scope.frmProDetails = {};
                $scope.Result = {};
                $scope.PlayerObject = {};
                $scope.CTC = {
                    Current: { L: 0, T: 0 },
                    Expected: { L: 0, T: 0 }
                };
                $scope.Notes = [];
                $scope.ItSkills = [{
                    SkillId: 0,
                    SkillName: '',
                    UserId: 0,
                    Years: 0,
                    Months: 0,
                    RecordStatus: 0,
                    ItemIndex: 0
                }];

                $scope.expYear = 0;
                $scope.expMonth = 0;
                var id = $rparams.Id;

                var _internal = true;
                if (id.startsWith('E')) {
                    _internal = false;
                    id = id.substring(1);
                } else if (id.startsWith('I')) {
                    _internal = true;
                    id = id.substring(1);
                }

                $scope.SharedList = [];

                $scope.OnLoadResults = function () {
                    $support.start();

                    $ajx.GetNotes(id, function (res) {
                        if ($support.IsSuccess(res)) {
                            $scope.Notes = res.data.Results;
                            $support.ApplyLocalDate($scope.Notes, ['CreateDate']);
                        }
                    }, function (err) {
                    });

                    if (_internal) {
                        $ajx.GetCandidate(id, retrievedSuccess, retrievedFailure);
                    } else {
                        $ajx.GetHGCandidate(id, retrievedSuccess, retrievedFailure);
                    }
                };

                function retrievedSuccess(res) {
                    if ($support.IsSuccess(res)) {
                        $scope.Result = res.data.Results;
                        SplitCTC($scope.Result.CTC, 'C');
                        SplitCTC($scope.Result.ECTC, 'E');
                        SplitCTC($scope.Result.Years, 'EX');
                        $scope.ItSkills = $scope.Result.ITSkills;
                        var indx = 0;
                        angular.forEach($scope.ItSkills, function (item) {
                            indx++;
                            item.ItemIndex = indx;
                        });

                        if ($support.IsArrayEmpty($scope.ItSkills)) {
                            $scope.ItSkills = [];
                        }

                        $support.ApplyLocalDate($scope.Result.PreAssessedSessions, ['SessionStart','SessionEnd'], 'YYYY-MM-DD hh:mm');
                        $support.stop();
                    }
                }

                function retrievedFailure(res) {
                    $support.stop();
                }

                $scope.OnPlayAtPosition = function (_id, _time) {
                    var vdoObj = $('#video_' + _id);
                    if (vdoObj !== null) {
                        vdoObj[0].currentTime = _time;
                    }
                };

                $scope.SharingSelected = function (tCheckId) {
                    angular.forEach($scope.Result.CompletedSessions, function (item) {
                        if (item.SessionId === tCheckId)
                            item.StatusCheck = !item.StatusCheck;
                    });
                    var _cnt = $support.GetItemsCount($scope.Result.CompletedSessions, 'StatusCheck', true);
                    $scope.DisableSharing = !(_cnt > 0);
                };

                $scope.OnCShareSessionClicked = function () {
                    ShowLoginState('', 0);
                    $support.Show('popShareSessionDiv');
                };

                var bShared = false;
                $scope.CShareGDPR = false;
                $scope.OnCSubmitSharedClicked = function () {

                    bShared = false;
                    ShowLoginState('', 0);

                    var _email = $support.GetValue('txtCShareEmail');
                    if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                        ShowLoginState('Enter valid e-mail address', -1);
                        return;
                    }

                    var shareName = '';
                    if ($scope.CShareGDPR) {
                        shareName = $support.GetValue('txtCSharedName');
                        if ($support.IsNull(shareName)) {
                            ShowLoginState('Provide company or contact name', -1);
                            return;
                        }
                    }

                    $support.start();

                    var data = [];

                    angular.forEach($scope.Result.CompletedSessions, function (item) {
                        if (item.StatusCheck) {
                            data.push({
                                SharedId: item.SessionId,
                                Email: _email,
                                SharedName: shareName
                            });
                        }
                    });

                    $ajx.SharedSession(data, function (res) {
                        if ($support.IsSuccess(res)) {
                            ShowLoginState('Session shared successfully', 0);
                            $support.Hide('btnCShareSession');
                            $support.stop();
                        } else {
                            var msg = res.data.statusText;
                            ShowLoginState(msg, -1);
                            $support.stop();
                        }
                    }, function (err) {
                        $support.stop();
                    });
                    bShared = true;
                };

                $scope.OnCCancelSharedClicked = function () {
                    ShowLoginState('', 0);
                    $scope.CShareGDPR = false;
                    $support.SetValue('txtCShareEmail', '');
                    $support.SetValue('txtCSharedName', '');
                    $support.ShowInline('btnCShareSession');
                    $support.Hide('popShareSessionDiv');

                    $scope.DisableSharing = true;
                    ClearSharingChecked();

                    if (bShared) {
                        $scope.OnLoadResults();
                    }
                };

                function ClearSharingChecked() {
                    angular.forEach($scope.Result.CompletedSessions, function (item) {
                        var elmId = "chk_" + item.SessionId + "_" + item.SessionTag;
                        $support.RadioButtonStatus(elmId, false);
                        item.StatusCheck = false;
                    });
                }

                $scope.OnCSubmitSharedUpdated = function () {

                    var _modified = $support.GetItems($scope.Result.SharedByList, 'Approved', true);

                    if (!$support.IsArrayEmpty(_modified)) {
                        $support.start();
                        $ajx.SetCSharedList(_modified, function (res) {
                            $support.stop();
                        }, function (res) {
                            $support.stop();
                        });
                    }
                };

                function ShowLoginState(msg, _succ) {
                    $support.SetText('errorCShare', '');
                    $support.SetText('successCShare', '');
                    $support.Hide('errorCShare');
                    $support.Hide('successCShare');

                    if (!$support.IsNull(msg)) {
                        if (_succ === 0) {
                            $support.SetText('successCShare', msg);
                            $support.Show('successCShare');
                        } else {
                            $support.SetText('errorCShare', msg);
                            $support.Show('errorCShare');
                        }
                    }
                }

                $scope.ToNullValue = function (_val) {
                    return $support.ToNullValue(_val);
                };

                $scope.IsVideoLinkExist = function (lnk) {
                    return !$support.IsNull(lnk);
                };

                $scope.IsSharingCount = function () {
                    return $support.GetItemsCount($scope.Result.CompletedSessions, 'Shared', 'true') === 0;
                };

                $scope.GetIteSkillCount = function () {
                    return $support.GetItemsCount($scope.ItSkills, 'RecordStatus', 0);
                };

                $scope.AddNewSkill = function () {
                    $scope.ItSkills.push({
                        SkillId: 0,
                        SkillName: '',
                        UserId: id,
                        Years: 0,
                        Months: 0,
                        RecordStatus: 0,
                        ItemIndex: $scope.ItSkills.length + 1
                    });
                };

                $scope.DeleteSkill = function (indx) {
                    angular.forEach($scope.ItSkills, function (item) {
                        if (item.ItemIndex === indx) {
                            item.RecordStatus = 2;
                        }
                    });
                };

                $scope.SubmitPersonalDetails = function () {
                    $support.Hide('errsubmit');
                    $support.Hide('errFilesubmit');
                    $support.Hide('sucsubmit');
                    $support.Hide('errsubmit2');

                    if (!$scope.frmProDetails.$valid) {
                        $support.Show('errsubmit');
                        return;
                    }

                    if (!$support.IsNull($scope.Resume)) {
                        UploadResume();
                    }
                    else {
                        UpdateData();
                    }
                };

                function UploadResume() {
                    $support.start();
                    var fd = new FormData();
                    fd.append("TypeOfDoc", 'Resumes');
                    fd.append("UserId", id);
                    fd.append("FileData", $scope.Resume);
                    fd.append("AddToProfile", true);

                    $ajx.UploadContents(fd, fileUploadSuccess, fileUploadFailure);
                }

                var fileUploadSuccess = function (res) {
                    $support.stop();
                    UpdateData();
                };

                var fileUploadFailure = function (res) {
                    $support.stop();
                    $support.show('errFilesubmit');
                };

                function UpdateData() {
                    var tCity = $support.GetValue('txtcity');
                    if ($support.IsNull(tCity)) {
                        tCity = $scope.Result.Address.City;
                    }

                    var tState = $support.GetValue('txtstate');
                    if ($support.IsNull(tState)) {
                        tState = $scope.Result.Address.State;
                    }

                    var tCountry = $support.GetValue('txtcountry');
                    if ($support.IsNull(tCountry)) {
                        tCountry = $scope.Result.Address.Country;
                    }

                    var tCode = $support.GetText('txtDailingCode');
                    if ($support.IsNull(tCode)) {
                        tCode = $scope.Result.Address.DailingCode;
                    }

                    var data = {
                        CandidateId: id,
                        Name: $support.GetValue('txtName'),
                        Email: $support.GetValue('txtEmail'),
                        Gender: $scope.Result.Gender,
                        Years: $scope.expYear + '.' + $scope.expMonth,
                        CTC: $scope.CTC.Current.L + '.' + $scope.CTC.Current.T,
                        ECTC: $scope.CTC.Expected.L + '.' + $scope.CTC.Expected.T,
                        LinkedIn: $support.GetValue('txtLinedIn'),
                        ITSkills: ExtractITSkills(),
                        Address: {
                            City: tCity,
                            State: tState,
                            Country: tCountry,
                            DailingCode: tCode,
                            MobileNumber: $support.GetValue('txtPhoneNumber'),
                        }
                    };
                    $support.start();
                    $ajx.UpdateCandidate(data, function (res) {
                        if ($support.IsSuccess(res)) {
                            $support.Show('sucsubmit');
                            $support.stop();
                            $scope.OnLoadResults();
                        }
                    }, function (err) {
                        $support.Show('errsubmit2');
                        $support.stop();
                    });
                }

                $scope.NoteText = '';
                $scope.AddNote = function () {
                    $scope.NoteText = $support.GetValue('noteText');

                    $support.Hide('noteErrorMsg');

                    if ($support.IsNull($scope.NoteText)) {
                        $support.Show('noteErrorMsg');
                        return;
                    }

                    $support.start();

                    var data = {
                        NoteText: $scope.NoteText,
                        UserId: id
                    };

                    $ajx.AddNotes(data, function (res) {
                        if (parseInt(res.status) === 200) {
                            $ajx.GetNotes(id, function (res1) {
                                if($support.IsSuccess(res1)) {
                                    $scope.Notes = res1.data.Results;
                                    $support.ApplyLocalDate($scope.Notes, ['CreateDate']);
                                }
                            }, function (err) {
                            });
                            $support.stop();
                        }
                        $scope.HideNote();
                    }, function (err) {
                        console.log(err);
                        $support.stop();
                    });
                };

                $scope.HideNote = function () {
                    $support.Hide('noteErrorMsg');
                    $scope.NoteText = '';
                    $support.Hide('popProfileNote');
                };

                function ExtractITSkills() {

                    var rtn = [];

                    angular.forEach($scope.ItSkills, function (item) {
                        if ((item.RecordStatus === 0) || (item.RecordStatus === 2 && item.SkillId > 0)) {
                            rtn.push(item);
                        }
                    });
                    return rtn;
                }

                function SplitCTC(_value, _type) {
                    var _real = 0, _decimal = 0;
                    if (_value) {
                        var _vars = _value.toString().split('.');
                        _real = parseInt(_vars[0]);
                        _decimal = parseInt(_vars[1]);
                        if (isNaN(_real)) _real = 0;
                        if (isNaN(_decimal)) _decimal = 0;
                    }

                    if (_type === 'C') {
                        $scope.CTC.Current.L = _real, $scope.CTC.Current.T = _decimal;
                    }
                    else if (_type === 'E') {
                        $scope.CTC.Expected.L = _real, $scope.CTC.Expected.T = _decimal;
                    }
                    else if (_type === 'EX') {
                        $scope.expYear = _real, $scope.expMonth = _decimal;
                    }
                }

                $scope.ChangePhoto = function (canId, _photo) {
                    $root.$broadcast('OpenPhotoForEdit', { Candidate: true, KeyId: canId, Photo: _photo });
                };

                $root.$on('CanPhotoUpdated', function (evt, data) {
                    var keyId = data.KeyId, _photo = data.Photo;
                    $scope.Result.Photo = _photo;
                });
            }]);
});