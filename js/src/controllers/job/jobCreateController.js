
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/fileChange' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/common/autoCompleteController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onTouch' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("jobCreateController",
            ['$scope', 'sharedService', 'sharedMethod', '$controller', 'user',
                function ($scope, $ajx, $support, $controller, $user) {

                    angular.extend(this, $controller('autoCompleteController', {
                        $scope: $scope,
                        $support: $support,
                        $ajx: $ajx
                    }));

                    $scope.CompanyName = $user.Get('Company');
                    $scope.pubDateFrom = '';
                    $scope.pubDateTo = '';
                    $scope.pubToFaceIt1 = true;
                    $scope.CountryId = 'IN';
                    $scope.Assignees = [];
                    $scope.jb = {};
                    $scope.LoadDefaults = function () {
                        $support.start();
                        $scope.GetCitiesByCountry($scope.CountryId);
                        $ajx.GetJobAssignees(function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.Assignees = res.data.Results;
                            }
                        }, function (err) {
                            $support.stop();
                        });

                        $scope.EXistingParameters = [];
                        $scope.PredefinedParameters = [];

                        $ajx.GetFeedBackForNewJob(0, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.EXistingParameters = $support.ExcludeItem(res.data.Results, 'CompanyId', 0);
                                $scope.PredefinedParameters = $support.GetItems(res.data.Results, 'CompanyId', 0);
                            }
                        }, function (res) {

                        });
                    };

                    function IsValidRange(val1, val2) {
                        return parseInt(val1) < parseInt(val2);
                    }

                    function IsValidForm() {
                        $support.ChangeClass('txtAssigneesLabel', 'pgSubHead');
                        $support.ChangeClass('txtParamsLabel', 'pgSubHead');

                        var bValid = $scope.frmJobCreate.$valid;

                        HighLightFields();

                        var tCount = $support.GetItemsCount($scope.Assignees, 'Selected', true);
                        if (tCount === 0) {
                            if (bValid) {
                                $support.SetText('submitError', 'Atleast assign one user to this Job');
                            }
                            $support.ChangeClass('txtAssigneesLabel', 'pgSubHead_error');
                            bValid = false;
                        }

                        var newParameters = $support.GetItems($scope.NewParameters, 'Selected', true);
                        var postParameters = $support.GetItems($scope.EXistingParameters, 'Selected', true);
                        var preParameters = $support.GetItems($scope.PredefinedParameters, 'Selected', true);

                        var cnt = newParameters.length + postParameters.length + preParameters.length;

                        if (cnt === 0) {
                            if (bValid) {
                                $support.SetText('submitError', 'Min 5 Rating Parameters are required');
                            }
                            $support.ChangeClass('txtParamsLabel', 'pgSubHead_error');
                            bValid = false;
                        } else {
                            if (cnt < 5 && bValid) {
                                $support.ChangeClass('txtParamsLabel', 'pgSubHead_error');
                                $support.SetText('submitError', 'Min 5 Rating Parameters are required');
                                $support.Show('submitError');
                                bValid = false;
                            }
                        }

                        return bValid;
                    }

                    function HighLightFields() {
                        angular.forEach($scope.frmJobCreate.$error, function (vals) {
                            if (angular.isArray(vals)) {
                                angular.forEach(vals, function (val) {
                                    if (val) {
                                        var elName = val.$name;
                                        var elm = elName + 'Label';

                                        if (elName === 'txtJobWorkExpYear1' || elName === 'txtJobWorkExpYear2') {
                                            elm = 'txtJobWorkExpYearLabel';
                                        } else if (elName === 'txtJobSalary1' || elName === 'txtJobSalary1') {
                                            elm = 'txtJobSalaryLabel2';
                                        } else if (elName === 'txtJobContName' || elName === 'txtJobContPhone' || elName === 'txtJobContEmail') {
                                            elm = 'txtContactLabel';
                                        }

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
                                                if (elm === 'txtContactLabel') {
                                                    element.className = 'pgSubHead_error';
                                                } else {
                                                    element.className = 'labelheading_error';
                                                }
                                            }
                                            else {
                                                if (elm === 'txtContactLabel') {
                                                    element.className = 'pgSubHead';
                                                } else {
                                                    element.className = 'labelheading';
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }

                    $scope.ResetRequired = function (elm, css) {
                        var element = document.getElementById(elm + 'Label');
                        if (!element) {
                            element = document.getElementsByName(elm + 'Label')[0];
                        }

                        if (element) {
                            element.className = css;
                        }
                    };

                    $scope.SaveJob = function () {
                        $support.SetText('submitError', 'Please fill mandatory fields');
                        $support.Hide('submitOk');
                        $support.Hide('submitError');
                        if (!IsValidForm()) {
                            $support.Show('submitError');
                        } else {
                            var data = getJobModal();
                            $support.start();
                            $ajx.CreateNewJob(data, function (res) {
                                $support.stop();
                                if ($support.IsSuccess(res)) {
                                    $support.SetText('submitOk', 'Job Saved Successfully');
                                    $support.Show('submitOk');
                                    $support.SetDisabled('btnPubJob', true);
                                    $support.SetDisabled('btnSaveJob', true);
                                } else {
                                    $support.SetText('submitError', 'System fail to process. Please try again.');
                                    $support.Show('submitError');
                                }
                            }, function (err) {
                                $support.stop();
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            });
                        }
                    };

                    $scope.OnPublishShow = function () {
                        $support.Hide('errorCreatePubMsg');
                        $support.SetText('submitError', 'Please fill mandatory fields');
                        $support.Hide('submitOk');
                        $support.Hide('submitError');
                        $scope.pubToFaceIt1 = true;
                        if (!IsValidForm()) {
                            $support.Show('submitError');
                        } else {
                            $support.Show('popPublishJob');
                        }
                    };

                    $scope.OnPublishHide = function () {
                        $scope.pubDateFrom = '';
                        $scope.pubDateTo = '';
                        $scope.pubToFaceIt1 = true;
                        $support.Hide('popPublishJob');
                    };

                    $scope.PublishJob = function () {
                        $support.Hide('errorCreatePubMsg');
                        if ($support.IsNull($scope.pubDateFrom) || $support.IsNull($scope.pubDateTo)) {
                            $support.Show('errorCreatePubMsg');
                            return;
                        }

                        $support.Hide('popPublishJob');

                        var data = getJobModal();
                        data.RecordStatus = 0;
                        data.PublishedOn = $support.getUTCTimeZone2($scope.pubDateFrom);
                        data.ClosedOn = $support.getUTCTimeZone2($scope.pubDateTo);
                        data.PublishToFaceIt = $scope.pubToFaceIt1;
                        $support.start();
                        $ajx.CreateNewJob(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.SetText('submitOk', 'Job Published Successfully');
                                $support.Show('submitOk');
                                $support.SetDisabled('btnPubJob', true);
                                $support.SetDisabled('btnSaveJob', true);
                            } else {
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            }
                        }, function (err) {
                            $support.stop();
                            $support.SetText('submitError', 'System fail to process. Please try again.');
                            $support.Show('submitError');
                        });
                    };

                    $scope.OnLocationSelected = function () {
                        var loc = '';

                        angular.forEach($scope.jb.JobLocation, function (item) {
                            if (!$support.IsNull(item)) {
                                var tLoc = $scope.GetCityName(item);
                                if (tLoc) {
                                    if ($support.IsNull(loc)) {
                                        loc = tLoc;
                                    } else {
                                        loc = loc + ',' + tLoc;
                                    }
                                }
                            }
                        });

                        $scope.SelectedJobLocations = loc;
                    };

                    function getJobModal() {

                        var jb = $scope.jb;

                        var job = {};

                        job.JobTitle = jb.JobTitle;
                        job.RecordStatus = 1;

                        var loc = '';

                        angular.forEach(jb.JobLocation, function (item) {
                            if (!$support.IsNull(item)) {
                                var tLoc = $scope.GetCityName(item);
                                if (tLoc) {
                                    if ($support.IsNull(loc)) {
                                        loc = tLoc;
                                    } else {
                                        loc = loc + ',' + tLoc;
                                    }
                                }
                            }
                        });

                        jb.JobSalary1 = jb.JobSalary1 || 0;
                        jb.JobSalary2 = jb.JobSalary2 || 0;

                        job.JobDetails = [{
                            JobSkills: jb.JobSkills,
                            JobDescription: jb.JobDesc,
                            JobResponsibilities: jb.JobResponse,
                            JobEducation: jb.JobEducation,
                            JobCountry: $scope.GetCountryName($scope.CountryId),
                            JobLocations: loc,
                            JobWorkExp: jb.JobWorkExpYear1 + '-' + jb.JobWorkExpYear2,
                            JobSalaryRange: jb.JobSalary1 + '-' + jb.JobSalary2
                        }];

                        job.JobAssignees = [];
                        angular.forEach($scope.Assignees, function (item) {
                            if (item.Selected) {
                                job.JobAssignees.push({ ContactId: item.Id });
                            }
                        });

                        job.JobContacts = [{
                            Name: jb.JobContName,
                            Email: jb.JobContEmail,
                            Phone: jb.JobContPhone
                        }];

                        var newParameters = $support.GetItems($scope.NewParameters, 'Selected', true);
                        var postParameters = $support.GetItems($scope.EXistingParameters, 'Selected', true);
                        var preParameters = $support.GetItems($scope.PredefinedParameters, 'Selected', true);

                        job.JobRatingParams = [];

                        angular.forEach(newParameters, function (item) {
                            job.JobRatingParams.push(
                                { Id: 0, Type: 1, Title: item.Title, Description: item.Description }
                            );
                        });

                        angular.forEach(postParameters, function (item) {
                            job.JobRatingParams.push(
                                { Id: item.Id, Type: 1, Title: item.Title, Description: item.Description }
                            );
                        });

                        angular.forEach(preParameters, function (item) {
                            job.JobRatingParams.push(
                                { Id: item.Id, Type: 0, Title: item.Title, Description: item.Description }
                            );
                        });

                        return job;
                    }

                    /* Rating Parameters */

                    $scope.NewParameters = [{ Id: 1, Selected: false, Title: '', Description: '' }];

                    $scope.EXistingParameters = [];
                    $scope.PredefinedParameters = [];

                    $scope.paramPreviousList = false;
                    $scope.paramPreDefinedList = false;

                    $scope.AddNewParameter = function () {

                        var cnt = $scope.NewParameters.length + 1;

                        $scope.NewParameters.push(
                            { Id: cnt, Selected: false, Title: '', Description: '' }
                        );

                    };

                }]);
    });