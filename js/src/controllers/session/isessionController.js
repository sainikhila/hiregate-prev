
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/session/bulkImportController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("isessionController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod',
                function ($scope, $root, $ajx, $support) {

                    $scope.SessionFormatFile = window.__env.apiUrl + '/Documents/formats/SessionsFormat.csv';

                    $scope.FiltersListJobId = [];
                    $scope.ScheduledBackupItems = [];
                    $scope.SessionFilters = [];
                    $scope.FilterItemsDisplay = [];
                    $scope.filterIdStatus = 'Status';
                    $scope.FilterTypeCan = '';
                    $scope.FilterTypeEva = '';
                    $scope.dtFilterFrom = '';
                    $scope.dtFilterTo = '';
                    $scope.filterByJobId = '0';

                    $scope.Initialize = function () {
                        $scope.FilterItemsDisplay = [];
                        setTimeout(function () {
                            ReloadDetails();
                        }, 100);
                        setTimeout(function () {
                            loadTimeZones();
                        }, 100);
                    };

                    $scope.TimeZonesList = {};

                    function loadTimeZones() {
                        $ajx.GetJsonFile('js/data/timezones.json',
                            function (resp) {
                                $scope.TimeZonesList = resp.data;
                            }, function (resp) {
                                $scope.TimeZonesList = {};
                            });
                    }

                    $scope.$on('SessionRefreshImport', function (evt, data) {
                        $scope.FilterItemsDisplay = [];
                        ReloadDetails();
                    });

                    $scope.ShowNewScheduledSession = function () {
                        $root.$broadcast('NewSession', { JobId: 0, CanId: 0 });
                    };

                    $scope.SubmitForNewSession = function (indx) {
                        var item = $support.GetItem($scope.SessionFilters, 'SessionId', indx);
                        $root.$broadcast('NewSession', { JobId: 0, CanId: item.CanId, EvaId: item.EvaId });
                    };

                    function ReloadDetails() {

                        $support.start();
                        $scope.ScheduledItems = [];
                        $ajx.GetAllScheduledJobs(function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ScheduledBackupItems = res.data.Results;
                                $support.ApplyLocalDate($scope.ScheduledBackupItems, ['ScheduledOn']);

                                angular.forEach($scope.ScheduledBackupItems, function (item) {
                                    item.Selected = false;
                                });

                                DoFilters();

                                angular.forEach($scope.SessionFilters, function (item) {
                                    $scope.SessionItemChecked(item.SessionId);
                                });
                                highlightConflicts($scope.Conflicts);
                                $scope.Conflicts = [];
                            }
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        });
                    }

                    function DoFilters() {

                        $scope.SessionFilters = $scope.ScheduledBackupItems;
                        var fltArray = $scope.FilterItemsDisplay;

                        if (fltArray.length > 0) {
                            for (var i = 0; i < fltArray.length; i++) {
                                if (fltArray[i].FilterValue !== undefined) {
                                    if (fltArray[i].FilterType === 'Status') {
                                        $scope.SessionFilters =
                                            $support.GetItems($scope.SessionFilters, 'Status', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterType === 'JobId') {
                                        $scope.SessionFilters =
                                            $support.GetItems($scope.SessionFilters, 'JobId', parseInt(fltArray[i].FilterValue));
                                    } else if (fltArray[i].FilterType === 'Can') {
                                        $scope.SessionFilters =
                                            $support.GetContainedItems($scope.SessionFilters, 'CName', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterType === 'Eva') {
                                        $scope.SessionFilters =
                                            $support.GetContainedItems($scope.SessionFilters, 'EName', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterType === 'SDate') {
                                        if (!$support.IsNull(fltArray[i].DateFrom)) {
                                            $scope.SessionFilters = $support.GetItemsByDate($scope.SessionFilters,
                                                'ScheduledOn', fltArray[i].DateFrom, 2);
                                        }
                                        if (!$support.IsNull(fltArray[i].DateTo)) {
                                            $scope.SessionFilters = $support.GetItemsByDate($scope.SessionFilters,
                                                'ScheduledOn', fltArray[i].DateTo, -2);
                                        }
                                    }
                                }
                            }
                        }

                        $scope.FiltersListJobId =
                            $support.GetKeyValuePairsDefault($scope.SessionFilters,
                                'JobId', 'JobTag', 'Job Id');

                        $scope.FiltersListJobId = $support.RemoveDuplicates($scope.FiltersListJobId, 'Id');
                    }

                    $scope.SessionItemChecked = function (indx) {
                        //var item = $support.GetItem($scope.SessionFilters, 'SessionId', indx);
                        //if (item.Selected) {
                        //    $support.ChangeClass('acceptIcon_' + indx, 'acceptIcon');
                        //} else {
                        //    $support.ChangeClass('acceptIcon_' + indx, 'acceptIconDisable');
                        //}

                        var item = $support.GetItemsCount($scope.SessionFilters, 'Selected', true);

                        $scope.EnableBulkUpdate = item < 2;
                    };

                    $scope.ShowImportingDialog = function () {
                        $support.start();
                        $ajx.GetUserJobInfo(
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    $root.$broadcast('SessionBulkImport', { Jobs: res.data.Results });
                                }
                                $support.stop();
                            },
                            function (res) {
                                $support.stop();
                            }
                        );
                    };

                    $scope.SelectedContact = {};
                    $scope.ShowContactDialog = function (indx) {
                        $scope.SelectedContact = $support.GetItem($scope.SessionFilters, 'SessionId', indx);
                        $support.Show('popContactDetails');
                    };

                    var contactIndex = 0;
                    $scope.ShowContactUpdateDialog = function (indx) {
                        contactIndex = indx;
                        $scope.SelectedContact = $support.GetItem($scope.SessionFilters, 'SessionId', contactIndex);
                        $scope.SelectedContact.CTimeZone = GetTimeZoneValueByName($scope.SelectedContact.CTime);
                        $scope.SelectedContact.ETimeZone = GetTimeZoneValueByName($scope.SelectedContact.ETime);
                        $support.Show('popTimeZoneUpdate');
                    };

                    $scope.HideContactUpdateDialog = function () {
                        $scope.SelectedContact = {};
                        $support.Hide('popTimeZoneUpdate');
                    };

                    $scope.UpdateContactTimeZone = function () {
                        var data = [];
                        var item = $scope.SelectedContact;
                        data.push({ Id: item.CanId, TimeZone: item.CTimeZone.Name });
                        data.push({ Id: item.EvaId, TimeZone: item.ETimeZone.Name });

                        $support.start();
                        $ajx.UpdateTimeZones(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                UpdateTimeZoneValues();
                                $support.Hide('popTimeZoneUpdate');
                            }
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        });
                    };

                    function UpdateTimeZoneValues() {
                        var itemZone = $scope.SelectedContact;
                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.SessionId === contactIndex) {
                                item.CTime = itemZone.CTimeZone.Name;
                                item.ETime = itemZone.ETimeZone.Name;
                            }
                        });
                        angular.forEach($scope.ScheduledBackupItems, function (item) {
                            if (item.SessionId === contactIndex) {
                                item.CTime = itemZone.CTimeZone.Name;
                                item.ETime = itemZone.ETimeZone.Name;
                            }
                        });
                        $scope.SelectedContact = {};
                    }

                    function GetTimeZoneValueByName(tName) {
                        var item = $support.GetItem($scope.TimeZonesList, 'Name', tName);
                        if (!$support.IsNull(item)) {
                            return item;
                        }
                        return null;
                    }

                    $scope.SelectedCandidate = {};
                    $scope.ShowCandidateDialog = function (indx) {
                        $support.start();
                        $scope.SelectedCandidate = {};
                        $ajx.GetCandidate(indx, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.SelectedCandidate = res.data.Results;
                                $support.Show('popCanDetails');
                            }
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        });
                    };

                    $scope.SelectedEvaluator = {};
                    $scope.ShowEvaluatorDialog = function (indx) {
                        $support.start();
                        $scope.SelectedEvaluator = {};
                        $ajx.GetEvaluator(indx, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.SelectedEvaluator = res.data.Results;
                                $support.Show('popIntDetails');
                            }
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        });
                    };

                    $scope.SelectedSessionId = 0;
                    $scope.ShowCancelledDialog = function (indx) {
                        ShowCancellError('');
                        $scope.SelectedSessionId = indx;
                        $support.Show('popConfirmDiscard');
                    };

                    $scope.HideCancelledDialog = function () {
                        $scope.SelectedSessionId = 0;
                        $support.Hide('popConfirmDiscard');
                    };

                    $scope.SubmitForCancellation = function () {
                        ShowCancellError('');
                        var reason = 'Cancelled Session';
                        var data = {
                            Reason: reason,
                            SessionId: $scope.SelectedSessionId
                        };

                        $support.start();
                        $ajx.CancelSessions(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                var items = res.data.Results;
                                if (items === 'Success') {
                                    $scope.HideCancelledDialog();
                                    ReloadDetails();
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

                    function ShowCancellError(msg) {
                        $support.Hide('submitCancelError');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('submitCancelError', msg);
                            $support.Show('submitCancelError');
                        }
                    }

                    $scope.ShowDeleteDialog = function (indx) {
                        ShowDeleteError('');
                        $scope.SelectedSessionId = indx;
                        $support.Show('popConfirmDelete');
                    };

                    $scope.HideDeletedDialog = function () {
                        $scope.SelectedSessionId = 0;
                        $support.Hide('popConfirmDelete');
                    };

                    $scope.SubmitForDeletion = function () {
                        ShowDeleteError('');
                        var data = {
                            SessionId: $scope.SelectedSessionId
                        };

                        $support.start();
                        $ajx.DeleteSessions(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                var items = res.data.Results;
                                if (items === 'Success') {
                                    $scope.HideDeletedDialog();
                                    ReloadDetails();
                                }
                                else {
                                    ShowDeleteError('System fail to process. Please try again.');
                                }
                            }
                            else {
                                ShowDeleteError('System fail to process. Please try again.');
                            }
                        }, function (err) {
                            $support.stop();
                            ShowDeleteError('System fail to process. Please try again.');
                        });
                    };

                    function ShowDeleteError(msg) {
                        $support.Hide('submitDeleteError');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('submitDeleteError', msg);
                            $support.Show('submitDeleteError');
                        }
                    }


                    $scope.ReScheduledDate = '';
                    $scope.reSchByHour = '00';
                    $scope.reSchByMinute = '-1';

                    $scope.ShowRescheduledDialog = function (indx) {
                        $scope.reSchByHour = '00';
                        $scope.reSchByMinute = '-1';
                        $scope.ReScheduledDate = '';
                        ShowRescheduledError('');
                        $scope.SelectedSessionId = indx;
                        $support.Show('popConfirmReSchedule');
                    };

                    $scope.HideRescheduledDialog = function () {
                        $scope.SelectedSessionId = 0;
                        $scope.reSchByHour = '00';
                        $scope.reSchByMinute = '-1';
                        $scope.ReScheduledDate = '';
                        $support.Hide('popConfirmReSchedule');
                    };

                    $scope.SubmitForScheduledDialog = function (indx) {
                        $scope.SelectedSessionId = indx;
                        $support.Show('popConfirmSchedule');
                    };

                    $scope.HideSubmitForScheduledDialog = function () {
                        $scope.SelectedSessionId = 0;
                        $support.Hide('popConfirmSchedule');
                    };

                    $scope.SubmitForScheduled = function () {
                        $support.Hide('popConfirmSchedule');
                        var item = $support.GetItem($scope.SessionFilters, 'SessionId', $scope.SelectedSessionId);
                        $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '');
                        var eDate = moment(item.ScheduledOn, "YYYY-MMM-DD HH:mm").format("YYYYMMDDHHmm");
                        if (eDate === "Invalid date") {
                            eDate = moment(item.ScheduledOn, "YYYY-MMM-DDTHH:mm:ss").format("YYYYMMDDHHmm");
                        }
                        if (eDate === "Invalid date") {
                            eDate = moment(item.ScheduledOn, "YYYY-MM-DDTHH:mm:ss").format("YYYYMMDDHHmm");
                        }

                        var tDate = $support.GetDateValueFormat('yyyyMMddHHmm');

                        if (tDate > eDate) {
                            $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '#e90b0b');
                            return;
                        }
                        $scope.SelectedSessionId = 0;
                        $support.start();
                        if ($support.IsNull(item.ResumeFile)) {
                            $scope.SubmitForScheduledContent(indx);
                        } else {
                            upLoadFileContent(indx);
                        }
                    };

                    function upLoadFileContent(indx) {

                        var item = $support.GetItem($scope.SessionFilters, 'SessionId', indx);

                        var fd = new FormData();

                        if (!$support.IsNull(item.ResumeFile)) {
                            fd.append("R" + indx, item.ResumeFile);
                        }

                        if (!$support.IsNull(item.JDFile)) {
                            fd.append("J" + indx, item.JDFile);
                        }

                        fd.append('TypeOfDoc', 'Jobs');

                        angular.forEach($scope.SessionFilters, function (item) {
                            item.ResumeFile = '';
                            item.JDFile = '';
                        });

                        $ajx.AddBulkFileUpload(fd, function (res) {
                            if ($support.IsSuccess(res)) {

                                angular.forEach(res.data.Results, function (rslt) {
                                    var rId = parseInt(rslt.Id.replace('R', ''));
                                    if (!isNaN(rId)) {
                                        item = $support.GetItem($scope.SessionFilters, 'SessionId', rId);
                                        item.ResumeFile = rslt.Name;
                                    }

                                    var jId = parseInt(rslt.Id.replace('J', ''));
                                    if (!isNaN(jId)) {
                                        item = $support.GetItem($scope.SessionFilters, 'SessionId', jId);
                                        item.JDFile = rslt.Name;
                                    }
                                });

                                $scope.SubmitForScheduledContent(indx);
                            } else {
                                $support.stop();
                                $support.Show('popScheduleInterviewFailed');
                            }
                        }, function (res) {
                            $support.stop();
                            $support.Show('popScheduleInterviewFailed');
                        });
                    }

                    $scope.SubmitForScheduledContent = function (indx) {

                        var item = $support.GetItem($scope.SessionFilters, 'SessionId', indx);

                        var data = [];
                        data.push({
                            ScheduledOn: $support.getUTCTimeZone(item.ScheduledOn),
                            SessionId: item.SessionId,
                            ResumeFile: item.ResumeFile,
                            JDFile: item.JDFile
                        });

                        $ajx.RescheduledSession(data,
                            function (res) {
                                $support.stop();

                                angular.forEach($scope.SessionFilters, function (item) {
                                    item.Selected = false;
                                });
                                var count = $support.GetItemsCount($scope.SessionFilters, 'Selected', true);
                                $scope.EnableBulkUpdate = count < 2;

                                var rslt = res.data.Results[0];
                                var elm = $('#dtSessionDate_' + rslt.SessionId);
                                if (elm) elm.removeAttr('data-tip');
                                $support.ChangeStyle('dtSessionDate_' + rslt.SessionId, 'color', '');
                                if (parseInt(rslt.Status) !== 0) {
                                    if (elm) elm.attr('data-tip', 'Conflicts with others');
                                    $support.ChangeStyle('dtSessionDate_' + rslt.SessionId, 'color', '#e90b0b');
                                    $support.Show('popDupScheduleInterview');
                                } else {
                                    $support.Show('popScheduleInterviewSuccessful');
                                    if ($support.IsSuccess(res)) {
                                        ReloadDetails();
                                    }
                                }

                            }, function (res) {
                                $support.stop();
                                $support.Show('popScheduleInterviewFailed');
                            }
                        );
                    };

                    $scope.SubmitForRescheduled = function () {
                        ShowRescheduledError("");
                        if ($support.IsNull($scope.ReScheduledDate) ||
                            parseInt($scope.reSchByHour) === 0 ||
                            parseInt($scope.reSchByMinute) < 0) {
                            ShowRescheduledError("All fields are mandatory");
                            return;
                        }
                        var itemIndex = $support.GetItemIndex($scope.SessionFilters, 'SessionId', $scope.SelectedSessionId);

                        if (itemIndex > -1) {
                            var vDt = new Date($scope.ReScheduledDate + ' ' + $scope.reSchByHour + ':' + $scope.reSchByMinute);
                            $scope.SessionFilters[itemIndex].ScheduledOn = moment(vDt).format('YYYY-MMM-DD HH:mm');

                            $scope.SessionFilters[itemIndex].Selected = true;
                            $scope.SessionItemChecked($scope.SelectedSessionId);
                        }
                        $scope.HideRescheduledDialog();
                    };

                    function ShowRescheduledError(msg) {
                        $support.Hide('submitRescheduledError');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('submitRescheduledError', msg);
                            $support.Show('submitRescheduledError');
                        }
                    }

                    $scope.OnFilterChanged = function () {

                        $scope.FilterItemsDisplay = [];
                        if ($scope.filterIdStatus !== 'Status') {
                            UpdateFilterItems('Status', 'Status', $scope.filterIdStatus, $scope.filterIdStatus);
                        }

                        if (parseInt($scope.filterByJobId) > 0) {
                            var item = $support.GetItem($scope.FiltersListJobId,
                                'Id', parseInt($scope.filterByJobId));
                            UpdateFilterItems('JobId', 'Job Id', $scope.filterByJobId, item.Name);
                        }

                        if (!$support.IsNull($scope.FilterTypeCan)) {
                            UpdateFilterItems('Can', 'Candidate Name', $scope.FilterTypeCan, $scope.FilterTypeCan);
                        }

                        if (!$support.IsNull($scope.FilterTypeEva)) {
                            UpdateFilterItems('Eva', 'Interviewer Name', $scope.FilterTypeEva, $scope.FilterTypeEva);
                        }

                        if (!$support.IsNull($scope.dtFilterFrom) && !$support.IsNull($scope.dtFilterTo)) {
                            UpdateFilterItems('SDate', 'Interview Date', null,
                                $scope.dtFilterFrom + ' To ' + $scope.dtFilterTo,
                                $scope.dtFilterFrom, $scope.dtFilterTo);
                        } else if (!$support.IsNull($scope.dtFilterFrom) && $support.IsNull($scope.dtFilterTo)) {
                            UpdateFilterItems('SDate', 'Interview Date From', null,
                                $scope.dtFilterFrom,
                                $scope.dtFilterFrom, $scope.dtFilterTo);
                        } else if ($support.IsNull($scope.dtFilterFrom) && !$support.IsNull($scope.dtFilterTo)) {
                            UpdateFilterItems('SDate', 'Interview Date To', null,
                                $scope.dtFilterTo,
                                $scope.dtFilterFrom, $scope.dtFilterTo);
                        }

                        DoFilters();

                    };

                    $scope.ClearFilters = function () {
                        $scope.FilterItemsDisplay = [];
                        $scope.filterIdStatus = 'Status';
                        $scope.filterByJobId = '0';
                        $scope.FilterTypeCan = '';
                        $scope.FilterTypeEva = '';
                        $scope.dtFilterFrom = $scope.dtFilterTo = '';
                        DoFilters();
                    };

                    $scope.RemoveFilter = function (indx) {
                        var item = $support.GetItem($scope.FilterItemsDisplay, 'FilterIndex', indx);
                        var items = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', indx);
                        if ($support.IsArrayEmpty(items)) items = [];
                        $scope.FilterItemsDisplay = items;

                        switch (item.FilterType) {
                            case 'Status': $scope.filterIdStatus = 'Status'; break;
                            case 'JobId': $scope.filterByJobId = '0'; break;
                            case 'Can': $scope.FilterTypeCan = ''; break;
                            case 'Eva': $scope.FilterTypeEva = ''; break;
                            case 'SDate': $scope.dtFilterFrom = $scope.dtFilterTo = ''; break;
                        }

                        DoFilters();
                    };

                    function UpdateFilterItems(filterType, filterLabel, filterValue, displayValue, dtFrom, dtTo, removed) {
                        var items = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterType', filterType);
                        if ($support.IsArrayEmpty(items)) items = [];
                        if (!removed) {
                            items.push({
                                FilterIndex: 0,
                                FilterType: filterType,
                                FilterLabel: filterLabel,
                                FilterValue: filterValue,
                                DisplayValue: displayValue,
                                DateFrom: dtFrom,
                                DateTo: dtTo
                            });
                        }

                        var indx = 0;
                        angular.forEach(items, function (item) {
                            indx++;
                            item.FilterIndex = indx;
                        });

                        $scope.FilterItemsDisplay = items;
                    }

                    $scope.Conflicts = [];
                    $scope.EnableBulkUpdate = true;

                    $scope.SubmitForScheduled2 = function () {
                        var cnt = $support.GetItemsCount($scope.SessionFilters, 'Selected', true);
                        if (cnt === 0) return;

                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.Selected) {
                                item.Valid = true;

                                var rId = item.SessionId + '_ResumeFile';

                                var elm = $('#' + rId);

                                if (elm && elm.attr('data-error')) {
                                    item.Valid = false;
                                }

                                rId = item.SessionId + '_JDProfile';

                                elm = $('#' + rId);

                                if (elm && elm.attr('data-error')) {
                                    item.Valid = false;
                                }
                            }
                        });

                        var tCount = $support.GetItemsCount($scope.SessionFilters, 'Valid', false);
                        if (tCount > 0) {
                            return;
                        }

                        var data = [];

                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.Selected) {
                                data.push({
                                    ScheduledOn: item.ScheduledOn,
                                    SessionId: item.SessionId,
                                    ResumeFile: item.ResumeFile,
                                    JDFile: item.JDFile
                                });
                            }
                        });

                        var now = moment(new Date());
                        angular.forEach(data, function (item) {
                            var end = moment(item.ScheduledOn);
                            var duration = moment.duration(end.diff(now));
                            var days = duration.asMilliseconds();
                            item.Valid = true;
                            if (days < 0) {
                                item.Valid = false;
                            }
                        });

                        tCount = $support.GetItemsCount(data, 'Valid', false);
                        if (tCount > 0) {
                            angular.forEach(data, function (item) {
                                $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '');
                                if (!item.Valid) {
                                    $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '#e90b0b');
                                }
                            });
                            return;
                        }

                        $support.Show('popConfirmSchedule2');
                    };

                    $scope.HideSubmitForScheduledDialog2 = function () {
                        $support.Hide('popConfirmSchedule2');
                    };

                    $scope.BulkUpdate = function () {
                        $support.Hide('popConfirmSchedule2');
                        $support.start();

                        var data = [];

                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.Selected) {
                                data.push({
                                    ScheduledOn: item.ScheduledOn,
                                    SessionId: item.SessionId,
                                    ResumeFile: item.ResumeFile,
                                    JDFile: item.JDFile
                                });
                            }
                        });

                        var tCount1 = $support.GetNonEmptyItemsCount(data, 'ResumeFile');
                        var tCount2 = $support.GetNonEmptyItemsCount(data, 'JDFile');
                        if (tCount1 === 0 && tCount2 === 0) {
                            submitForBulkSchedules();
                        } else {
                            bulkUpLoadFilesContent();
                        }
                    };

                    function bulkUpLoadFilesContent() {

                        var fd = new FormData();
                        fd.append('TypeOfDoc', 'Jobs');
                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.Selected) {
                                if (!$support.IsNull(item.ResumeFile)) {
                                    fd.append("R" + item.SessionId, item.ResumeFile);
                                }

                                if (!$support.IsNull(item.JDFile)) {
                                    fd.append("J" + item.SessionId, item.JDFile);
                                }
                            }
                        });

                        angular.forEach($scope.SessionFilters, function (item) {
                            item.ResumeFile = '';
                            item.JDFile = '';
                        });

                        $ajx.AddBulkFileUpload(fd, function (res) {
                            if ($support.IsSuccess(res)) {

                                angular.forEach(res.data.Results, function (rslt) {
                                    var rId = parseInt(rslt.Id.replace('R', ''));
                                    var item;
                                    if (!isNaN(rId)) {
                                        item = $support.GetItem($scope.SessionFilters, 'SessionId', rId);
                                        item.ResumeFile = rslt.Name;
                                    }

                                    var jId = parseInt(rslt.Id.replace('J', ''));
                                    if (!isNaN(jId)) {
                                        item = $support.GetItem($scope.SessionFilters, 'SessionId', jId);
                                        item.JDFile = rslt.Name;
                                    }
                                });

                                submitForBulkSchedules();
                            } else {
                                $support.stop();
                                $support.Show('popScheduleInterviewFailed');
                            }
                        }, function (res) {
                            $support.stop();
                            $support.Show('popScheduleInterviewFailed');
                        });
                    }

                    function submitForBulkSchedules() {

                        var data = [];

                        angular.forEach($scope.SessionFilters, function (item) {
                            if (item.Selected) {
                                data.push({
                                    ScheduledOn: $support.getUTCTimeZone(item.ScheduledOn),
                                    SessionId: item.SessionId,
                                    ResumeFile: item.ResumeFile,
                                    JDFile: item.JDFile
                                });
                            }
                        });

                        $ajx.RescheduledSession(data,
                            function (res) {
                                $support.stop();

                                angular.forEach($scope.SessionFilters, function (item) {
                                    item.Selected = false;
                                });

                                var count = $support.GetItemsCount($scope.SessionFilters, 'Selected', true);
                                $scope.EnableBulkUpdate = count < 2;

                                var _success = parseInt(res.status) === 200 && parseInt(res.data.status) === 200;

                                var rslt = res.data.Results;
                                $scope.Conflicts = rslt;
                                _success = highlightConflicts(rslt);

                                if (!_success) {
                                    $support.Show('popDupScheduleInterview');
                                }

                                ReloadDetails();

                            }, function (res) {
                                $support.stop();
                                ShowCancellError('System fail to process. Please try again.');
                            }
                        );
                    }

                    function highlightConflicts(rslt) {
                        var _success = true;
                        angular.forEach(rslt, function (item) {
                            var elm = $('#dtSessionDate_' + item.SessionId);
                            if (elm) elm.removeAttr('data-tip');
                            $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '');
                            if (parseInt(item.Status) !== 0) {
                                if (elm) elm.attr('data-tip', 'Conflicts with others');
                                $support.ChangeStyle('dtSessionDate_' + item.SessionId, 'color', '#e90b0b');
                                _success = false;
                            }
                        });

                        return _success;
                    }
                    $scope.Times = [];
                    $scope.Times.unshift({ Value: '00', Text: 'Hour' });
                    $scope.MinutesList = [];
                    $scope.MinutesList.unshift({ Value: '-1', Text: 'Min' });
                    $scope.DisableNaNTimes = function () {
                        var sh = 6;
                        var eh = 24;
                        var now = moment(new Date());
                        var end = moment($scope.ReScheduledDate);
                        var duration = moment.duration(end.diff(now));
                        var days = duration.asMilliseconds();
                        if (days < 0) {
                            sh = now.hour();
                        }

                        $scope.Times = [];
                        for (var i = sh; i < eh; i++) {
                            $scope.Times.push({ Value: i, Text: $support.AddLeadingZeros(i, 2) });
                        }

                        $scope.Times.unshift({ Value: '00', Text: 'Hour' });
                    };

                    $scope.DisableNaNMinutes = function () {
                        $scope.MinutesList = [
                            { Value: '00', Text: '00' },
                            { Value: '15', Text: '15' },
                            { Value: '30', Text: '30' },
                            { Value: '45', Text: '45' }
                        ];
                        var now = moment(new Date());
                        var end = moment($scope.ReScheduledDate);
                        var duration = moment.duration(end.diff(now));
                        var days = duration.asMilliseconds();
                        if (days < 0) {
                            var sh = now.minutes();
                            if (now.hour() === $scope.reSchByHour) {
                                var lst = [];
                                angular.forEach($scope.MinutesList, function (item) {
                                    if (parseInt(item.Value) > sh)
                                        lst.push(item);
                                });

                                if ($support.IsArrayEmpty(lst)) {
                                    $scope.reSchByHour++;
                                } else {
                                    $scope.MinutesList = lst;
                                }
                            }
                        }
                        $scope.MinutesList.unshift({ Value: '-1', Text: 'Min' });
                    };

                    $scope.ShowDeleteResume = function (indx) {
                        ShowResumeDeleteError('');
                        $scope.SelectedSessionId = indx;
                        $support.Show('popConfirmDeleteResume');
                    };

                    $scope.HideDeleteResume = function () {
                        $scope.SelectedSessionId = 0;
                        $support.Hide('popConfirmDeleteResume');
                    };

                    $scope.SubmitForResumeDeletion = function () {

                        ShowResumeDeleteError('');

                        var data = {
                            SessionId: $scope.SelectedSessionId
                        };

                        $support.start();
                        $ajx.DeleteSessionResume(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                var items = res.data.Results;
                                if (items === 'Success') {
                                    $scope.HideDeleteResume();
                                    ReloadDetails();
                                }
                                else {
                                    ShowResumeDeleteError('System fail to process. Please try again.');
                                }
                            }
                            else {
                                ShowResumeDeleteError('System fail to process. Please try again.');
                            }
                        }, function (err) {
                            $support.stop();
                            ShowResumeDeleteError('System fail to process. Please try again.');
                        });
                    };

                    function ShowResumeDeleteError(msg) {
                        $support.Hide('submitResumeDeleteError');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('submitResumeDeleteError', msg);
                            $support.Show('submitResumeDeleteError');
                        }
                    }
                }
            ]);

    });