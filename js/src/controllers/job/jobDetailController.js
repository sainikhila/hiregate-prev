
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("jobDetailController",
            ['$scope', '$rootScope', '$routeParams', 'sharedService', 'sharedMethod', 'user',
                function ($scope, $root, $params, $ajx, $support, $user) {

                    var jobId = $params.Id;

                    $scope.Job = {};
                    $scope.Candidate = {};

                    $scope.LoadDefaults = function () {
                        $support.start();
                        $ajx.GetJobFullDetails(jobId, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.Job = res.data.Results;
                                $support.ApplyLocalDate($scope.Job,
                                    ['ClosedOn', 'CreatedDate', 'PublishedOn', 'UpdatedDate'], 'YYYY-MM-DD');
                                $support.ApplyLocalDate($scope.Job.Sessions, ['InterviewDate'], 'YYYY-MM-DD hh:mm');
                                $support.ApplyLocalDate($scope.Job.JobsApplied, ['AppliedOn'], 'YYYY-MM-DD');
                                $scope.Job.JobTag = "JB" + $support.AddLeadingZeros($scope.Job.JobId, 5);
                                $scope.Job.JobContName = $scope.Job.JobContacts[0].Name;
                                $scope.Job.JobContPhone = $scope.Job.JobContacts[0].Phone;
                                $scope.Job.JobContEmail = $scope.Job.JobContacts[0].Email;
                            }
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.GetCandidate = function (keyId, typeId) {
                        $scope.Candidate = {};
                        $support.start();
                        $ajx.GetCandidate(keyId, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.Candidate = res.data.Results;
                                $support.Show('popCanDetails');
                            }
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.SelectedContact = {};
                    $scope.GetCandidateContact = function (keyId) {
                        var item = $support.GetItem($scope.Job.JobsApplied, 'CandidateId', keyId);
                        $scope.SelectedContact = {};
                        if (item) {
                            $scope.SelectedContact = {
                                Name: item.Candidate,
                                Email: item.Email,
                                Phone: item.MobileNumber
                            };
                        }
                        $support.Show('popContactDetails2');
                    };

                    $scope.HideContact = function () {
                        $scope.SelectedContact = {};
                        $support.Hide('popContactDetails2');
                    };

                    $scope.ShowCodeForCompile = function (_appliedId) {
                        var item = $support.GetItem($scope.Job.JobsApplied, 'AppliedId', _appliedId);
                        $root.$broadcast('ShowCodeForCompile', {
                            CodeId: item.CodeId,
                            Answer: item.Answer,
                            Question: item.Question
                        });
                    };

                    var lastCanId = 0;
                    $scope.ShowJobCandidateDelete = function (canId) {
                        lastCanId = canId;
                        $support.Show('popJobDeleteCandidate');
                    };

                    $scope.ConfirmJobCandidateDelete = function () {
                        $support.start();
                        ajx.DeleteCandidate(lastCanId,
                            function (res) {
                                $support.stop();
                                $scope.HideJobCandidateDelete();
                                $scope.LoadDefaults();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    };

                    $scope.HideJobCandidateDelete = function () {
                        lastCanId = 0;
                        $support.Hide('popJobDeleteCandidate');
                    };

                    $scope.UpdateContacts = function () {
                        $support.RemoveClass('contName');
                        $support.RemoveClass('contEmail');
                        $support.RemoveClass('contPhone');

                        if ($support.IsNull($scope.Job.JobContName)) {
                            $support.ChangeClass('contName', 'inputError');
                        } else if ($support.IsNull($scope.Job.JobContPhone)) {
                            $support.ChangeClass('contPhone', 'inputError');
                        } else if ($support.IsNull($scope.Job.JobContEmail)) {
                            $support.ChangeClass('contEmail', 'inputError');
                        } else if (!$support.IsValidEmail($scope.Job.JobContEmail)) {
                            $support.ChangeClass('contEmail', 'inputError');
                        } else {
                            var data = {
                                Item1: $scope.Job.JobContacts[0].JobContactId,
                                Item2: $scope.Job.JobContName,
                                Item3: $scope.Job.JobContEmail,
                                Item4: $scope.Job.JobContPhone
                            };

                            $support.start();
                            $ajx.UpdateJobContact(data, function (res) {
                                $support.stop();
                            }, function (err) {
                                $support.stop();
                            });
                        }
                    };

                    $scope.UpdateEndDate = function () {
                        var data = {
                            JobId: $scope.Job.JobId,
                            ClosedOn: $support.getUTCTimeZone2($scope.Job.ClosedOn)
                        };

                        $support.start();
                        $ajx.UpdateJobEndDate(data, function (res) {
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.ResetContacts = function () {
                        $support.RemoveClass('contName');
                        $support.RemoveClass('contEmail');
                        $support.RemoveClass('contPhone');
                        $scope.Job.JobContName = $scope.Job.JobContacts[0].Name;
                        $scope.Job.JobContPhone = $scope.Job.JobContacts[0].Phone;
                        $scope.Job.JobContEmail = $scope.Job.JobContacts[0].Email;
                    };

                    $scope.ShowNewScheduledSession = function (_canId) {
                        $root.$broadcast('NewSession', { JobId: jobId, CanId: _canId });
                    };
                    
                    $scope.ShowCodeChallenge = function (_appliedId,_canId) {
                        $root.$broadcast('ShowCodeChallenge', { AppliedId: _appliedId, CanId: _canId });
                    };

                }]);
    });