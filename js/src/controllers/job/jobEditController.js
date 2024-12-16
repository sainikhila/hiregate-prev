
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

        app.controller("jobEditController",
            ['$scope', '$rootScope', '$routeParams', 'sharedService', 'sharedMethod', '$controller', 'user',
                function ($scope, $root, $params, $ajx, $support, $controller, $user) {

                    angular.extend(this, $controller('autoCompleteController', {
                        $scope: $scope,
                        $support: $support,
                        $ajx: $ajx
                    }));

                    var jobId = $params.Id;
                    $scope.CompanyName = $user.Get('Company');
                    $scope.SelectedJobLocations = '';
                    $scope.pubDateFrom = '';
                    $scope.pubDateTo = '';
                    $scope.pubToFaceIt2 = true;
                    $scope.CountryId = 'IN';
                    $scope.Assignees = [];
                    $scope.jb = {};

                    $scope.LoadDefaults = function () {
                        $support.start();
                        $ajx.GetJobAssignees(function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.Assignees = res.data.Results;
                                getJobDetails();
                            }
                        }, function (err) {
                            $support.stop();
                        });

                        $scope.EXistingParameters = [];
                        $scope.PredefinedParameters = [];
                    };

                    function getJobDetails() {
                        $support.start();
                        $scope.jb = {};
                        $ajx.GetJobDetails(jobId,
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.SelectedJob = res.data.Results;
                                    mapToLocal($scope.SelectedJob);
                                    loadParamters(jobId);
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    }

                    function loadParamters(jobId) {
                        $ajx.GetFeedBackForNewJob(jobId, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.EXistingParameters = $support.ExcludeItem(res.data.Results, 'CompanyId', 0);
                                $scope.PredefinedParameters = $support.GetItems(res.data.Results, 'CompanyId', 0);
                            }
                        }, function (res) {

                        });
                    }
                    $scope.ReloadJob = function () {
                        $support.start();
                        getJobDetails();
                    };

                    function mapToLocal(vjob) {
                        $scope.SelectedJobLocations = vjob.JobLocations;
                        $scope.CountryId = $scope.GetCountryId(vjob.JobCountry);
                        $scope.GetCitiesByCountry($scope.CountryId, function () {

                            $scope.jb = {
                                JobTitle: vjob.JobTitle,
                                JobDesc: vjob.JobDescription,
                                JobSkills: vjob.JobSkills,
                                JobResponse: vjob.JobResponsibilities,
                                JobEducation: vjob.JobEducation,
                                JobCountry: vjob.JobCountry,
                                JobLocation: getLocLis(vjob),
                                JobContName: vjob.JobContacts[0].Name,
                                JobContPhone: vjob.JobContacts[0].Phone,
                                JobContEmail: vjob.JobContacts[0].Email,
                                JobWorkExpYear1: parseInt($support.SplitItem(vjob.JobWorkExp, '-', 0)),
                                JobWorkExpYear2: parseInt($support.SplitItem(vjob.JobWorkExp, '-', 1)),
                                JobSalary1: parseInt($support.SplitItem(vjob.JobSalaryRange, '-', 0)),
                                JobSalary2: parseInt($support.SplitItem(vjob.JobSalaryRange, '-', 1)),
                                Status: vjob.Status
                            };

                            mapAssignees(vjob);

                        });

                    }

                    function getLocLis(vjob) {
                        var rItems = [];
                        if (!$support.IsNull(vjob.JobLocations)) {
                            var items = vjob.JobLocations.split(',');
                            angular.forEach(items, function (item) {
                                rItems.push($scope.GetCityId(item));
                            });
                        }
                        return rItems;
                    }

                    //$.each(values.split(","), function (i, e) {
                    //    $("#strings option[value='" + e + "']").prop("selected", true);
                    //});

                    function mapAssignees(vjob) {
                        angular.forEach(vjob.JobAssignees, function (item) {
                            var vIndx = $support.GetItemIndex($scope.Assignees, 'Id', item.ContactId);
                            $scope.Assignees[vIndx].Selected = false;
                            if (vIndx > -1) {
                                $scope.Assignees[vIndx].Selected = true;
                            }
                        });
                    }

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

                    $scope.SaveJob = function (isNewPublish) {
                        asNewJob = isNewPublish;
                        $support.SetText('submitError', 'Please fill mandatory fields');
                        $support.Hide('submitOk');
                        $support.Hide('submitError');
                        if (!IsValidForm()) {
                            $support.Show('submitError');
                        } else {
                            var data = getJobModal();
                            data.RecordStatus = 1;
                            if (asNewJob) {
                                saveAsNewJob(data);
                            }
                            else {
                                saveExistingJob(data);
                            }
                        }
                    };

                    function saveExistingJob(data) {
                        $support.start();
                        $ajx.UpdateExistingJob(data, function (res) {
                            asNewJob = false;
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.SetText('submitOk', 'Job Saved Successfully');
                                $support.Show('submitOk');
                                DisabledButtons();
                            } else {
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            }
                        }, function (err) {
                            asNewJob = false;
                            $support.stop();
                            $support.SetText('submitError', 'System fail to process. Please try again.');
                            $support.Show('submitError');
                        });
                    }

                    function saveAsNewJob(data) {
                        $support.start();
                        $ajx.CreateNewJob(data, function (res) {
                            asNewJob = false;
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.SetText('submitOk', 'Job Saved Successfully');
                                $support.Show('submitOk');
                                DisabledButtons();
                            } else {
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            }
                        }, function (err) {
                            asNewJob = false;
                            $support.stop();
                            $support.SetText('submitError', 'System fail to process. Please try again.');
                            $support.Show('submitError');
                        });
                    }

                    var asNewJob = false;
                    $scope.OnPublishShow = function (isNewPublish) {
                        $scope.pubToFaceIt2 = true;
                        $support.Hide('errorEditPubMsg');
                        asNewJob = isNewPublish;
                        $support.SetText('submitError', 'Please fill mandatory fields');
                        $support.Hide('submitOk');
                        $support.Hide('submitError');
                        if (!IsValidForm()) {
                            $support.Show('submitError');
                        } else {
                            $support.Show('popPublishJob');
                        }
                    };

                    $scope.OnPublishHide = function () {
                        $scope.pubDateFrom = '';
                        $scope.pubDateTo = '';
                        $scope.pubToFaceIt2 = true;
                        $support.Hide('popPublishJob');
                    };

                    $scope.PublishJob = function () {
                        $support.Hide('errorEditPubMsg');
                        if ($support.IsNull($scope.pubDateFrom) || $support.IsNull($scope.pubDateTo)) {
                            $support.Show('errorEditPubMsg');
                            return;
                        }

                        $support.Hide('popPublishJob');
                        //$scope.pubToFaceIt = $('#pubToFaceIt2').prop('checked');
                        var data = getJobModal();
                        data.RecordStatus = 0;
                        data.PublishedOn = $support.getUTCTimeZone2($scope.pubDateFrom);
                        data.ClosedOn = $support.getUTCTimeZone2($scope.pubDateTo);
                        data.PublishToFaceIt = $scope.pubToFaceIt2;
                        if (asNewJob) {
                            publishAsNewJob(data);
                        } else {
                            publishExistingJob(data);
                        }
                    };

                    function publishAsNewJob(data) {
                        $support.start();
                        $ajx.CreateNewJob(data, function (res) {
                            asNewJob = false;
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.SetText('submitOk', 'Job Published Successfully');
                                $support.Show('submitOk');
                                DisabledButtons();
                            } else {
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            }
                        }, function (err) {
                            asNewJob = false;
                            $support.stop();
                            $support.SetText('submitError', 'System fail to process. Please try again.');
                            $support.Show('submitError');
                        });
                    }

                    function publishExistingJob(data) {
                        $support.start();
                        $ajx.UpdateExistingJob(data, function (res) {
                            asNewJob = false;
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.SetText('submitOk', 'Job Published Successfully');
                                $support.Show('submitOk');
                                DisabledButtons();

                            } else {
                                $support.SetText('submitError', 'System fail to process. Please try again.');
                                $support.Show('submitError');
                            }
                        }, function (err) {
                            asNewJob = false;
                            $support.stop();
                            $support.SetText('submitError', 'System fail to process. Please try again.');
                            $support.Show('submitError');
                        });
                    }

                    function DisabledButtons() {
                        for (var i = 1; i < 6; i++) {
                            $support.SetDisabled('btnSaveJob' + i, true);
                            $support.SetDisabled('btnPubJob' + i, true);
                        }
                    }

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
                        var mJob = $scope.SelectedJob;

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

                        mJob.JobTitle = jb.JobTitle;
                        mJob.JobSkills = jb.JobSkills;
                        mJob.JobDescription = jb.JobDesc;
                        mJob.JobResponsibilities = jb.JobResponse;
                        mJob.JobEducation = jb.JobEducation;
                        mJob.JobCountry = $scope.GetCountryName($scope.CountryId);
                        mJob.JobLocations = loc;
                        mJob.JobWorkExp = jb.JobWorkExpYear1 + '-' + jb.JobWorkExpYear2;

                        jb.JobSalary1 = jb.JobSalary1 || 0;
                        jb.JobSalary2 = jb.JobSalary2 || 0;

                        mJob.JobSalaryRange = jb.JobSalary1 + '-' + jb.JobSalary2;

                        mJob.JobContacts[0].Name = jb.JobContName;
                        mJob.JobContacts[0].Email = jb.JobContEmail;
                        mJob.JobContacts[0].Phone = jb.JobContPhone;

                        angular.forEach(mJob.JobAssignees, function (item) {
                            item.Selected = false;
                        });

                        angular.forEach($scope.Assignees, function (item) {
                            var vItem = $support.GetItem(mJob.JobAssignees, 'ContactId', item.Id);
                            if (!$support.IsNull(vItem)) {
                                vItem.Selected = item.Selected;
                            } else {
                                if (item.Selected) {
                                    vItem = {
                                        JobId: jobId,
                                        ContactId: item.Id,
                                        Selected: true
                                    };

                                    mJob.JobAssignees.push(vItem);
                                }
                            }
                        });

                        jb = {
                            JobId: jobId,
                            JobTitle: mJob.JobTitle,
                            JobAssignees: mJob.JobAssignees,
                            JobContacts: mJob.JobContacts

                        };

                        delete mJob['JobAssignees'];
                        delete mJob['JobContacts'];
                        jb.JobDetails = [mJob];
                        var newParameters = $support.GetItems($scope.NewParameters, 'Selected', true);
                        var postParameters = $support.GetItems($scope.EXistingParameters, 'Selected', true);
                        var preParameters = $support.GetItems($scope.PredefinedParameters, 'Selected', true);

                        jb.JobRatingParams = [];

                        angular.forEach(newParameters, function (item) {
                            jb.JobRatingParams.push(
                                { Id: 0, Type: 1, Title: item.Title, Description: item.Description }
                            );
                        });

                        angular.forEach(postParameters, function (item) {
                            jb.JobRatingParams.push(
                                { Id: item.Id, Type: 1, Title: item.Title, Description: item.Description }
                            );
                        });

                        angular.forEach(preParameters, function (item) {
                            jb.JobRatingParams.push(
                                { Id: item.Id, Type: 0, Title: item.Title, Description: item.Description }
                            );
                        });

                        return jb;
                    }

                    /* Rating Parameters */

                    $scope.NewParameters = [{ Id: 1, Selected: false, Title: '', Description: '' }];

                    $scope.EXistingParameters = [];
                    $scope.PredefinedParameters = [];

                    $scope.paramPreviousList = true;
                    $scope.paramPreDefinedList = true;

                    $scope.AddNewParameter = function () {

                        var cnt = $scope.NewParameters.length + 1;

                        $scope.NewParameters.push(
                            { Id: cnt, Selected: false, Title: '', Description: '' }
                        );

                    };
                }]);
    });