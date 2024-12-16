
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/fileChange' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("popupController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'user',
                function ($scope, $root, $ajx, $support, $user) {
                    $scope.SelectedSession = {};
                    $scope.LanguagesPack = [];

                    function GetCodingLanguages() {
                        $scope.LanguagesPack = [];
                        $ajx.GeLanguages('js/data/languages.json',
                            function (res) {
                                $root.safeApply(function () {
                                    $scope.LanguagesPack = res.data;
                                });
                            }, function (err) {
                                //ConnectionError(msg_error_language_pack);
                            });
                    }

                    GetCodingLanguages();

                    var appliedId = 0;
                    var candidateId = 0;
                    $scope.codetext = "";
                    $scope.SelectedLanguageId = 0;
                    $scope.$on('ShowCodeChallenge', function (evt, data) {
                        appliedId = data.AppliedId;
                        candidateId = data.CanId;
                        $scope.codetext = "";
                        $scope.SelectedLanguageId = 0;
                        $support.Hide('codeError');
                        $support.Hide('codeSuccess');
                        $support.Show('popCodeChallenge');
                    });

                    $scope.LanguageId = 0;
                    $scope.LanguageName = '';
                    $scope.AnswerCode = '';
                    $scope.$on('ShowCodeForCompile', function (evt, data) {
                        $scope.LanguageId = data.CodeId;
                        var item = $support.GetItem($scope.LanguagesPack, 'Id', $scope.LanguageId);
                        $scope.LanguageName = item.Name;
                        $scope.Question = data.Question;
                        $support.setInnerHtml('answerCode', data.Answer);
                        $support.Show('popJobTestCode');
                    });

                    $scope.HideCodeForCompile = function () {
                        $scope.LanguageId = 0;
                        $scope.LanguageName = '';
                        $scope.AnswerCode = '';
                        $support.Hide('popJobTestCode');
                    };

                    $scope.SubmitCodeChallenge = function () {
                        $support.Hide('codeError');
                        $support.Hide('codeSuccess');

                        if ($scope.SelectedLanguageId === 0) {
                            $support.Show('codeError');
                            return;
                        }

                        if ($support.IsNull($scope.codetext)) {
                            $support.Show('codeError');
                            return;
                        }

                        var data = {
                            AppliedId: appliedId,
                            CandidateId: candidateId,
                            CodeId: $scope.SelectedLanguageId,
                            Question: $scope.codetext
                        };

                        $support.start();
                        $ajx.AddCodeChallenge(data, function (res) {
                            $support.stop();
                            $scope.HideCodeChallenge();
                        }, function (err) {
                            $support.stop();
                            $scope.HideCodeChallenge();
                        });
                    };

                    $scope.HideCodeChallenge = function () {
                        $scope.codetext = "";
                        $scope.SelectedLanguageId = appliedId = candidateId = 0;
                        $support.Hide('popCodeChallenge');
                    };

                    $scope.$on('ShowContact', function (evt, data) {
                        $scope.SelectedSession = data.Selected;
                        $support.Show('popContactDetails');
                    });

                    $scope.$on('HideContact', function (evt, data) {
                        $scope.SelectedSession = {};
                        $support.Hide('popContactDetails');
                    });

                    $scope.reasonToCancel = '';
                    $scope.CancelledId = 0;

                    $scope.$on('ShowCancelSession', function (evt, data) {
                        $scope.CancelledId = data.KeyId;
                        $support.Show('popCancelInterviewNote');
                    });

                    $scope.SubmitCancelSession = function () {
                        ShowCancellError('');

                        $scope.reasonToCancel = $support.GetValue('reasonToCancel');
                        if ($support.IsNull($scope.reasonToCancel)) {
                            ShowCancellError('Please add a reason for cancelling');
                            return;
                        }

                        var data = {
                            Reason: $scope.reasonToCancel,
                            SessionId: $scope.CancelledId
                        };

                        $support.start();
                        $ajx.CancelSessions(data, function (resp) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                var items = resp.data.Results;
                                if (items === 'Success') {
                                    $scope.HideCancelSession();
                                    $root.$broadcast('RefreshDSession', {});
                                    $root.$broadcast('RefreshSSession', {});
                                }
                                else {
                                    ShowCancellError('System fail to process. Please try again.');
                                }
                            }
                            else {
                                ShowCancellError('System fail to process. Please try again.');
                            }
                        }, function (err) {
                            $support.stop();
                            ShowCancellError('System fail to process. Please try again.');
                        });
                    };

                    $scope.HideCancelSession = function () {
                        $scope.CancelledId = 0;
                        $scope.reasonToCancel = '';
                        $scope.SelectedSession = {};
                        $support.Hide('cancelErrorMsg');
                        $support.Hide('popCancelInterviewNote');
                        $support.SetValue('reasonToCancel', '');
                    };

                    $scope.$on('ShowCancelledSession', function (evt, data) {
                        $support.start();
                        $ajx.GetCancelSessionReason(data.KeyId, function (resp) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.reasonToCancel = resp.data.Results.Reason;
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.Show('popCancelReason');
                        }, function (err) {
                            $support.stop();
                        });
                    });

                    function ShowCancellError(msg) {
                        $support.Hide('cancelErrorMsg');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('cancelErrorMsg', msg);
                            $support.Show('cancelErrorMsg');
                        }
                    }

                    $scope.ns = {};
                    $scope.jb = {};
                    $scope.Date = '';
                    $scope.Hours = '0';
                    $scope.Minutes = '-1';
                    $scope.AMPM = 'AMPM';

                    function ResetSchDetails() {
                        $scope.jb = {};
                        $scope.ns = {
                            CandidateName: '',
                            CandidateEmail: '',
                            CandidatePhone: '',
                            CandidateResume: '',
                            CanTimeZone: 91,
                            CanTimeZoneName: '',
                            InterviewerEmail: '',
                            InterviewerName: '',
                            InterviewerPhone: '',
                            IntTimeZone: 91,
                            IntTimeZoneName: '',
                            InterviewerRate: '',
                            InterviewTopic: '',
                            InterviewDate: '',
                            CorporateName: '',
                            CorporateMobile: '',
                            CorporateEmail: '',
                            CompanyId: 0,
                            ContactId: 0,
                            JDProfile: '',
                            SharedJDProfile: '',
                            Resume: '',
                            SharedResume: '',
                            JobId: 0,
                            CanId: 0
                        };

                        $scope.Date = '';
                        $scope.Hours = '0';
                        $scope.Minutes = '-1';
                        $scope.AMPM = 'AMPM';
                        $support.SetText('schErrDisplay', '');
                        $support.Hide('schErrDisplay');
                        $support.Show('dummyDisplay');
                        $support.SetDisabled('btnSubmitNewSch', false);
                        $('#sessionResume').val("");
                        $('#sessionJobDesc').val("");
                        $support.SetText('jobDesc', '');

                    }

                    $scope.$on('NewSession', function (evt, data) {
                        loadTimeZones(data);
                    });

                    $scope.TimeZonesList = {};

                    function loadTimeZones(data) {
                        $ajx.GetJsonFile('js/data/timezones.json',
                            function (resp) {
                                $scope.TimeZonesList = resp.data;
                                loadNewSession(data);
                            }, function (resp) {
                                $scope.TimeZonesList = {};
                                loadNewSession(data);
                            });
                    }

                    function loadNewSession(data) {
                        ResetSchDetails();
                        $support.Show('popNewSchedule');
                        $support.start();
                        $scope.ns.JobId = parseInt(data.JobId);
                        $scope.ns.CanId = parseInt(data.CanId);

                        $scope.ns.CanTimeZone = GetTimeZoneValueById(91);
                        $scope.ns.IntTimeZone = GetTimeZoneValueById(91);

                        var kId = data.EvaId || 0;
                        $scope.ns.EvaId = parseInt(kId);
                        $support.SetDisabled('txtJobSelection', false);
                        $support.SetDisabled('CandidateEmail', false);
                        $support.SetDisabled('CandidateName', false);
                        $support.SetDisabled('CandidatePhone', false);
                        $support.SetDisabled('CandidateTimeZone', false);

                        $support.SetDisabled('InterviewerEmail', false);
                        $support.SetDisabled('InterviewerName', false);
                        $support.SetDisabled('InterviewerPhone', false);
                        $support.SetDisabled('InterviewerTimeZone', false);

                        $support.SetDisabled('sessionJobDesc', false);
                        getJobsList();
                    }

                    function getJobsList() {
                        $scope.jb = {};
                        $ajx.GetUserJobInfo(function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.jb = res.data.Results;
                                loadDetails();
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    }

                    function loadDetails() {
                        if (parseInt($scope.ns.JobId) > 0) {
                            $support.SetDisabled('txtJobSelection', true);
                            $scope.DisplayJobDesc();
                        }

                        if (parseInt($scope.ns.CanId) > 0) {
                            getCandidateDetails();
                            $support.SetDisabled('CandidateEmail', true);
                            $support.SetDisabled('CandidateName', true);
                            $support.SetDisabled('CandidatePhone', true);
                            //$support.SetDisabled('CandidateTimeZone', true);
                        }
                        if (parseInt($scope.ns.EvaId) > 0) {
                            getEvaluatorDetails();
                            $support.SetDisabled('InterviewerEmail', true);
                            $support.SetDisabled('InterviewerName', true);
                            $support.SetDisabled('InterviewerPhone', true);
                            //$support.SetDisabled('InterviewerTimeZone', true);
                        }
                        loadCalendar();
                        $support.stop();
                    }

                    var picker = null;

                    function loadCalendar() {
                        if (picker !== null) return;
                        var todaysDate = new Date();
                        todaysDate.setDate(todaysDate.getDate());

                        picker = new Pikaday({
                            field: document.getElementById('dtPickerIntDate'),
                            firstDay: 1,
                            minDate: todaysDate,
                            defaultDate: todaysDate,
                            maxDate: new Date(2020, 12, 31),
                            yearRange: [1950, 2020]
                        });
                    }

                    function getCandidateDetails() {
                        $ajx.GetCandidateById($scope.ns.CanId, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ns.CandidateName = res.data.Results.Item1;
                                $scope.ns.CandidateEmail = res.data.Results.Item2;
                                $scope.ns.CandidatePhone = res.data.Results.Item3;
                                $scope.OnCanEmailChanged();
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    }

                    function getEvaluatorDetails() {
                        $ajx.GetEvaluatorById($scope.ns.EvaId, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ns.InterviewerName = res.data.Results.Item1;
                                $scope.ns.InterviewerEmail = res.data.Results.Item2;
                                $scope.ns.InterviewerPhone = res.data.Results.Item3;
                                $scope.OnEvaEmailChanged();
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    }

                    var bSubmitted = false;

                    $scope.Times = [];
                    $scope.MinutesList = [];
                    $scope.DisableNaNTimes = function () {
                        var sh = 6;
                        var eh = 24;
                        var now = moment(new Date());
                        var end = moment($scope.Date);
                        var duration = moment.duration(end.diff(now));
                        var days = duration.asMilliseconds();
                        if (days < 0) {
                            sh = now.hour();
                        }

                        $scope.Times = [];
                        for (var i = sh; i < eh; i++) {
                            $scope.Times.push({ Value: i, Text: $support.AddLeadingZeros(i, 2) });
                        }
                    };

                    $scope.DisableNaNMinutes = function () {
                        $scope.MinutesList = [
                            { Value: '00', Text: '00' },
                            { Value: '15', Text: '15' },
                            { Value: '30', Text: '30' },
                            { Value: '45', Text: '45' }
                        ];
                        var now = moment(new Date());
                        var end = moment($scope.Date);
                        var duration = moment.duration(end.diff(now));
                        var days = duration.asMilliseconds();
                        if (days < 0) {
                            var sh = now.minutes();
                            if (now.hour() === $scope.Hours) {
                                var lst = [];
                                angular.forEach($scope.MinutesList, function (item) {
                                    if (parseInt(item.Value) > sh)
                                        lst.push(item);
                                });
                                if ($support.IsArrayEmpty(lst)) {
                                    $scope.Hours++;
                                } else {
                                    $scope.MinutesList = lst;
                                }
                            }
                        }
                    };

                    $scope.HideNewScheduledSession = function () {
                        ResetSchDetails();
                        $support.Hide('popNewSchedule');
                        if (bSubmitted) {
                            bSubmitted = false;
                            $root.$broadcast('RefreshDSession', {});
                            $root.$broadcast('RefreshSSession', {});
                            $root.$broadcast('SessionRefreshImport', {});
                        }
                    };

                    $scope.frmNewSession = {};

                    $scope.SubmitNewScheduledSession = function () {

                        $support.Show('dummyDisplay');
                        $support.Hide('schErrDisplay');

                        $scope.ns.IntTimeZoneName = $scope.ns.IntTimeZone.Name;
                        $scope.ns.CanTimeZoneName = $scope.ns.CanTimeZone.Name;

                        if ($support.IsNull($scope.ns.CandidateEmail)) {
                            ShowError('Candidate email is required');
                            return;
                        }
                        else if ($support.IsNull($scope.ns.CandidateName)) {
                            ShowError('Candidate name is required');
                            return;
                        }
                        else if ($support.IsNull($scope.ns.InterviewerEmail)) {
                            ShowError('Interviewer email is required');
                            return;
                        }
                        else if ($support.IsNull($scope.ns.InterviewerName)) {
                            ShowError('Interviewer name is required');
                            return;
                        }
                        else if ($support.IsNull($scope.Date)) {
                            ShowError('Interview date is required');
                            return;
                        }
                        else if (parseInt($scope.Hours) < 1 || parseInt($scope.Minutes) < 0) {
                            ShowError('Interview time is required');
                            return;
                        }
                        else if ($scope.ns.CandidateEmail === $scope.ns.InterviewerEmail) {
                            ShowError('Emails should not be same');
                            return;
                        }
                        else {

                            //if (parseInt($scope.ns.CanId) > 0 && parseInt($scope.ns.JobId) === 0) {
                            //    ShowError('Job Id should not be blank');
                            //    return;
                            //}

                            if (!$support.IsNull($scope.ns.CandidatePhone) && !$support.IsNull($scope.ns.InterviewerPhone)) {
                                if ($scope.ns.CandidatePhone === $scope.ns.InterviewerPhone) {
                                    ShowError('Mobile numbers should not be same');
                                    return;
                                }
                            }
                        }

                        if (!$scope.frmNewSession.$valid) {
                            return;
                        }

                        ShowError('Please wait...');

                        var vDt = new Date($scope.Date + ' ' + $scope.Hours + ':' + $scope.Minutes);
                        $scope.ns.InterviewDate = $support.getUTCTimeZone(vDt);

                        $scope.ns.CompanyId = $scope.CompanyId;
                        $scope.ns.ContactId = $scope.ContactId;
                        $support.start();
                        validateSessions();
                    };

                    function validateSessions() {
                        $ajx.ValidateSession([$scope.ns],
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    var obj = res.data.Results[0];
                                    if (parseInt(obj.Count) > 0) {
                                        ShowError('New session conflicts with other session.');
                                        $support.stop();
                                    } else {
                                        $scope.CheckForUploadResume();
                                    }
                                } else {
                                    ShowError('System fail to process. Please try again.');
                                    $support.stop();
                                }
                            },
                            function (res) {
                                ShowError('System fail to process. Please try again.');
                                $support.stop();
                            }
                        );
                    }

                    $scope.CheckForUploadResume = function () {
                        if (!$support.IsNull($scope.ns.Resume)) {
                            $scope.ns.CandidateResume = '';
                            var fd = new FormData();
                            fd.append("TypeOfDoc", 'Resumes');
                            fd.append("UserId", 0);
                            fd.append("FileData", $scope.ns.Resume);
                            fd.append("AddToProfile", false);

                            $ajx.UploadContents(fd, function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.ns.SharedResume = res.data.Results;
                                    $scope.CheckForUploadJDProfile();
                                } else {
                                    ShowError('System fail to process. Please try again.');
                                    $support.stop();
                                }

                            }, function (res) {
                                ShowError('System fail to process. Please try again.');
                                $support.stop();
                            });
                        }
                        else {
                            $scope.CheckForUploadJDProfile();
                        }
                    };

                    $scope.CheckForUploadJDProfile = function () {

                        if (!$support.IsNull($scope.ns.JDProfile)) {
                            var fd = new FormData();
                            fd.append("TypeOfDoc", 'Jobs');
                            fd.append("UserId", 0);
                            fd.append("FileData", $scope.ns.JDProfile);
                            fd.append("AddToProfile", false);

                            $ajx.UploadContents(fd, function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.ns.SharedJDProfile = res.data.Results;
                                    $scope.UpdateNewSession();
                                } else {
                                    ShowError('System fail to process. Please try again.');
                                    $support.stop();
                                }

                            }, function (res) {
                                ShowError('System fail to process. Please try again.');
                                $support.stop();
                            });
                        }
                        else {
                            $scope.UpdateNewSession();
                        }
                    };

                    $scope.DisplayJobDesc = function () {
                        var desc = '';
                        var item = $support.GetItem($scope.jb, 'Id', $scope.ns.JobId);
                        if (item) {
                            desc = item.Description;
                        }
                        $support.SetText('jobDesc', desc);

                        $support.SetDisabled('sessionJobDesc', false);
                        if (parseInt($scope.ns.JobId) > 0) {
                            $support.SetDisabled('sessionJobDesc', true);
                        }

                    };

                    $scope.UpdateNewSession = function () {
                        if (!$support.IsNull($scope.ns.CandidateResume)) {
                            $scope.ns.SharedResume = $scope.ns.CandidateResume.replace(/^.*[\\\/]/, '');
                        }

                        if (parseInt($scope.ns.JobId) > 0 && $support.IsNull($scope.ns.SharedJDProfile)) {
                            $scope.ns.SharedJDProfile = 'JB' + $scope.ns.JobId + '.pdf';
                        }

                        $ajx.AddSession($scope.ns, function (res) {
                            if ($support.IsSuccess(res)) {
                                if (parseInt(res.data.Results) === 0) {
                                    ShowError('System fail to process. Please try again.');
                                } else {
                                    ShowError('Session created successful.');
                                    $support.SetDisabled('btnSubmitNewSch', true);
                                    bSubmitted = true;
                                }
                            } else {
                                ShowError('System fail to process. Please try again.');
                            }

                            $support.stop();
                        }, function (res) {
                            ShowError('System fail to process. Please try again.');
                            $support.stop();
                        });
                    };

                    $scope.OnCanEmailChanged = function () {
                        var data = {
                            Id: 0,
                            Text: $scope.ns.CandidateEmail
                        };

                        $ajx.GetNameByEmail(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ns.CandidateName = res.data.Results.Item1;
                                $scope.ns.CandidatePhone = res.data.Results.Item2;
                                $scope.ns.CandidateResume = res.data.Results.Item3;
                                $scope.ns.CanTimeZone = GetTimeZoneValueByName(res.data.Results.Item4);
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    };

                    $scope.ShowDeleteResume = function () {
                        $scope.ns.CandidateResume = '';
                    };

                    $scope.OnEvaEmailChanged = function () {

                        var data = {
                            Id: 1,
                            Text: $scope.ns.InterviewerEmail
                        };

                        $ajx.GetNameByEmail(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ns.InterviewerName = res.data.Results.Item1;
                                $scope.ns.InterviewerPhone = res.data.Results.Item2;
                                $scope.ns.IntTimeZone = GetTimeZoneValueByName(res.data.Results.Item4);
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    };

                    function GetTimeZoneValueByName(tName) {
                        var item = $support.GetItem($scope.TimeZonesList, 'Name', tName);
                        if (!$support.IsNull(item)) {
                            return item;
                        }
                        return null;
                    }

                    function GetTimeZoneValueById(tId) {
                        var item = $support.GetItem($scope.TimeZonesList, 'Id', tId);
                        if (!$support.IsNull(item)) {
                            return item;
                        }
                        return null;
                    }

                    $scope.OnCorpEmailChanged = function () {
                        var data = {
                            Id: 3,
                            Text: $scope.ns.CorporateEmail
                        };

                        $ajx.GetNameByEmail(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ns.CorporateName = res.data.Results;
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    };

                    function ShowError(msg) {
                        $support.SetText('schErrDisplay', msg);
                        $support.Show('schErrDisplay');
                        $support.Hide('dummyDisplay');
                    }

                    var canId = 0;
                    $root.$on("PhotoToDelete", function (evt, data) {
                        canId = data.CanId || 0;
                        $support.Show('popDeletePhoto');
                    });

                    $scope.DoDeletePhoto = function () {
                        $ajx.DeletePhoto({ Id: canId }, photoDelSuccess, photoDelFailed);
                    };

                    var photoDelSuccess = function photoDelSuccess(resp) {
                        if (canId > 0) {
                            $root.$broadcast('CanPhotoDeleted', { CanId: canId });
                        } else {
                            var rslt = resp.data.Results;
                            $user.Set('Photo', rslt);
                            $support.broadCastPhoto($root);
                        }
                        canId = 0;
                        $support.Hide('popDeletePhoto');
                    };

                    var photoDelFailed = function photoDelFailed(resp) {
                        alert("Error some thing goes wrong");
                    };
                }]);

    });