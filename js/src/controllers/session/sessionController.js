
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("sessionController",
            ['$scope', '$rootScope', '$routeParams', 'sharedService', 'sharedMethod',
                function ($scope, $root, $rparams, $ajx, $support) {

                    $scope.JobCreatedIdFilters = [];
                    $scope.CreatedIdFilters = [];
                    $scope.ScheduledBackupItems = [];
                    $scope.SessionFilters = [];
                    $scope.filterStatus = 'Status';
                    $scope.filterCreatedID = "Scheduled By";
                    $scope.filterJCreatedID = "Job Created By";
                    $scope.SessionIdFilters = [];
                    $scope.filterIdStatus = 'Session Id';
                    $scope.companySearch = '';
                    $scope.SelectedSession = {};
                    $scope.reasonToCancel = '';
                    $scope.FilterItemsDisplay = [];

                    var paramId = !$support.IsNull($rparams.Id) ? $rparams.Id : 0;
                    $scope.Initialize = function () {
                        $scope.FilterItemsDisplay = [];
                        $scope.companySearch = '';

                        setTimeout(function () {
                            $support.start();
                            $scope.ScheduledItems = [];
                            $ajx.GetAllsessions(function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.ScheduledBackupItems = res.data.Results;
                                    $support.ApplyLocalDate($scope.ScheduledBackupItems, ['InterviewDate']);
                                    $scope.SessionIdFilters = $support.GetSingleColumnValuesDefault($scope.ScheduledBackupItems, 'SessionTag', 'Session Id');
                                    $scope.CreatedIdFilters = $support.GetSingleColumnValuesDefault($scope.ScheduledBackupItems, 'CreatedBy', 'Scheduled By');
                                    $scope.JobCreatedIdFilters = $support.GetSingleColumnValuesDefault($scope.ScheduledBackupItems, 'JCreatedBy', 'Job Created By');
                                    $scope.SessionIdFilters = $support.RemoveDuplicatesArray($scope.SessionIdFilters);
                                    $scope.CreatedIdFilters = $support.RemoveDuplicatesArray($scope.CreatedIdFilters);
                                    $scope.JobCreatedIdFilters = $support.RemoveDuplicatesArray($scope.JobCreatedIdFilters);

                                    DoFilter();
                                }
                                $support.stop();
                                setTimeout(function () {
                                    if (paramId > 0) $scope.ShowOneBlock(parseInt(paramId));
                                }, 100);
                            }, function (res) {
                                console.log(res);
                                $support.stop();
                            });
                        }, 100);
                    };

                    $scope.ShowOneBlock = function (eTag, bRefresh) {

                        $scope.SelectedSession = {};

                        var selectedVal = undefined;

                        if (!bRefresh) {
                            selectedVal = resetDisplayedBlock(eTag);
                        } else {
                            selectedVal = getDisplayedBlock(eTag);
                        }

                        if (selectedVal) {
                            var keyId = 'Block_' + selectedVal.SessionId + '_' + selectedVal.SessionTag;
                            var refreshId = 'Refresh_' + selectedVal.SessionId + '_' + selectedVal.SessionTag;

                            if (selectedVal.StatusTag === 'Completed') {
                                GetCompletedSession(selectedVal.SessionId);
                            }

                            $support.Show(keyId);
                            $support.ShowInline(refreshId);
                        }
                    };

                    var getDisplayedBlock = function getDisplayedBlock(eTag) {

                        var selectedId = undefined;

                        angular.forEach($scope.SessionFilters, function (tItem) {
                            if (eTag === tItem.SessionId) {
                                selectedId = tItem;
                            }
                        });

                        return selectedId;
                    };

                    var resetDisplayedBlock = function resetDisplayedBlock(eTag) {

                        var selectedId = undefined;

                        for (var i = 0; i < $scope.SessionFilters.length; i++) {

                            var vsession = $scope.SessionFilters[i];

                            var tItem = vsession.SessionId;
                            var keyId = 'Block_' + vsession.SessionId + '_' + vsession.SessionTag;
                            var refreshId = 'Refresh_' + vsession.SessionId + '_' + vsession.SessionTag;

                            $support.Hide(refreshId);

                            var elLabel = $support.getElement('labelText_' + vsession.SessionId);
                            if (elLabel) {
                                elLabel.val('View');
                            }

                            var elem = $support.getElement(keyId);

                            if (elem) {
                                if (eTag === tItem && elem[0].style['display'] !== 'block') {
                                    selectedId = vsession;
                                    elLabel.val('Hide');
                                }
                                if (elem[0].style['display'] === 'block') {
                                    $support.Hide(keyId);
                                }
                            }
                        }

                        return selectedId;
                    };

                    function GetCompletedSession(_keyId) {
                        $support.start();
                        $ajx.GetCompletedSession(_keyId, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.SelectedSession = res.data.Results;
                                $support.ApplyLocalDate($scope.SelectedSession, ['SessionStart', 'SessionEnd']);
                            }
                            $support.stop();
                        }, function (res) {
                            console.log(res);
                            $support.stop();
                        });
                    }

                    $scope.OnPlayAtPosition = function (_time) {
                        var vdoObj = $('#sessionvideocontrol');
                        if (vdoObj !== null) {
                            vdoObj[0].currentTime = _time;
                        }
                    };

                    $scope.OnFilterIdChanged = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 1);
                        if ($scope.filterIdStatus !== 'Session Id') {
                            $scope.FilterItemsDisplay.push({ FilterIndex: 1, FilterType: 'Session', FilterLabel: 'Session Id', FilterValue: $scope.filterIdStatus });
                        }
                        DoFilter();
                    };

                    $scope.OnFilterStatusChanged = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 2);
                        if ($scope.filterStatus !== 'Status') {
                            $scope.FilterItemsDisplay.push({ FilterIndex: 2, FilterType: 'Status', FilterLabel: 'Status', FilterValue: $scope.filterStatus });
                        }
                        DoFilter();
                    };

                    $scope.OnFilterJCreatedIdChanged = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 6);
                        if ($scope.filterJCreatedID !== 'Job Created By') {
                            $scope.FilterItemsDisplay.push({ FilterIndex: 6, FilterType: 'JCreatedBy', FilterLabel: 'Job Created By', FilterValue: $scope.filterJCreatedID });
                        }
                        DoFilter();
                    };

                    $scope.OnFilterCreatedIdChanged = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 4);
                        if ($scope.filterCreatedID !== 'Scheduled By') {
                            $scope.FilterItemsDisplay.push({ FilterIndex: 4, FilterType: 'CreatedBy', FilterLabel: 'Scheduled By', FilterValue: $scope.filterCreatedID });
                        }
                        DoFilter();
                    };

                    $scope.OnFilterSessionDateChanged = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 5);

                        if (!$support.IsNull($scope.dtSesFilterFrom) && !$support.IsNull($scope.dtSesFilterTo)) {
                            UpdateFilterItems(5,'Date', 'Interview Date', 
                                $scope.dtSesFilterFrom + ' To ' + $scope.dtSesFilterTo,
                                $scope.dtSesFilterFrom, $scope.dtSesFilterTo);
                        } else if (!$support.IsNull($scope.dtSesFilterFrom) && $support.IsNull($scope.dtSesFilterTo)) {
                            UpdateFilterItems(5,'Date', 'Interview Date From', 
                                $scope.dtSesFilterFrom,
                                $scope.dtSesFilterFrom, $scope.dtSesFilterTo);
                        } else if ($support.IsNull($scope.dtSesFilterFrom) && !$support.IsNull($scope.dtSesFilterTo)) {
                            UpdateFilterItems(5,'Date', 'Interview Date To',
                                $scope.dtSesFilterTo,
                                $scope.dtSesFilterFrom, $scope.dtSesFilterTo);
                        }

                        DoFilter();
                    };

                    function UpdateFilterItems(filterIndex, filterType, filterLabel, filterValue, dtFrom, dtTo) {

                        var item = {
                            FilterIndex: filterIndex,
                            FilterType: filterType,
                            FilterLabel: filterLabel,
                            FilterValue: filterValue,
                            DateFrom: dtFrom,
                            DateTo: dtTo
                        };

                        $scope.FilterItemsDisplay.push(item);
                    }

                    $scope.OnFilterSearch = function () {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', 3);
                        if (!$support.IsNull($scope.companySearch)) {
                            $scope.FilterItemsDisplay.push({ FilterIndex: 3, FilterType: 'Search', FilterLabel: 'Candidate Name', FilterValue: $scope.companySearch });
                        }

                        DoFilter();
                    };

                    $scope.RemoveFilter = function (_id) {
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', _id);
                        if (_id === 1) {
                            $scope.filterIdStatus = 'Session Id';
                        } else if (_id === 2) {
                            $scope.filterStatus = 'Status';
                        } else if (_id === 3) {
                            $scope.companySearch = '';
                        } else if (_id === 4 ) {
                            $scope.filterCreatedID = "Scheduled By";
                        } else if (_id === 5) {
                            $scope.dtSesFilterFrom = "";
                            $scope.dtSesFilterTo = "";
                        } else if (_id === 6) {
                            $scope.filterJCreatedID = "Job Created By";
                        }
                        
                        DoFilter();
                    };

                    $scope.ClearFilters = function () {

                        $scope.FilterItemsDisplay = [];
                        $scope.filterStatus = 'Status';
                        $scope.filterIdStatus = 'Session Id';
                        $scope.filterCreatedID = "Scheduled By";
                        $scope.filterJCreatedID = "Job Created By";
                        $scope.dtSesFilterFrom = "";
                        $scope.dtSesFilterTo = "";
                        DoFilter();
                    };

                    function DoFilter() {

                        $scope.SessionFilters = $scope.ScheduledBackupItems;
                        var fltArray = $scope.FilterItemsDisplay;

                        if (fltArray.length > 0) {
                            for (var i = 0; i < fltArray.length; i++) {
                                if (fltArray[i].FilterValue !== undefined) {
                                    if (fltArray[i].FilterIndex === 1) {
                                        $scope.SessionFilters =
                                            $support.GetItems($scope.SessionFilters, 'SessionTag', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterIndex === 2) {
                                        var vStatue = fltArray[i].FilterValue;
                                        if (vStatue === 'In-Progress') vStatue = "Ongoing";
                                        $scope.SessionFilters =
                                            $support.GetItems($scope.SessionFilters, 'StatusTag', vStatue);
                                    } else if (fltArray[i].FilterIndex === 3) {
                                        $scope.SessionFilters =
                                            $support.GetContainedItems($scope.SessionFilters, 'CandidateName', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterIndex === 4) {
                                        $scope.SessionFilters =
                                            $support.GetContainedItems($scope.SessionFilters, 'CreatedBy', fltArray[i].FilterValue);
                                    } else if (fltArray[i].FilterIndex === 5) {

                                        if (!$support.IsNull(fltArray[i].DateFrom)) {
                                            $scope.SessionFilters = $support.GetItemsByDate($scope.SessionFilters,
                                                'InterviewDate', fltArray[i].DateFrom, 2);
                                        }
                                        if (!$support.IsNull(fltArray[i].DateTo)) {
                                            $scope.SessionFilters = $support.GetItemsByDate($scope.SessionFilters,
                                                'InterviewDate', fltArray[i].DateTo, -2);
                                        }
                                    } else if (fltArray[i].FilterIndex === 6) {
                                        $scope.SessionFilters =
                                            $support.GetContainedItems($scope.SessionFilters, 'JCreatedBy', fltArray[i].FilterValue);
                                    }
                                }
                            }
                        }
                    }

                    $scope.$on('RefreshSSession', function (evt, data) {
                        $scope.Initialize();
                    });

                    $scope.ShowContact = function (keyId) {
                        var selectedSession = $support.GetItem($scope.SessionFilters, 'SessionId', keyId);
                        $root.$broadcast('ShowContact', { Selected: selectedSession });
                    };

                    $scope.HideContact = function () {
                        $root.$broadcast('HideContact', null);
                    };

                    $scope.ShowCancelSession = function (keyId) {
                        $root.$broadcast('ShowCancelSession', { KeyId: keyId });
                    };

                    $scope.ShowNewScheduledSession = function () {
                        $root.$broadcast('NewSession', { JobId: 0, CanId: 0 });
                    };

                    $scope.IsValueFound = function (_value) {
                        return !$support.IsNull(_value);
                    };

                    var sharedId = 0;
                    $scope.OnShareSessionClicked = function (keyId) {
                        ShowLoginState('', 0);
                        sharedId = keyId;
                        $support.Show('popShareSessionDiv');
                    };

                    $scope.ShareGDPR = false;
                    $scope.OnSubmitSharedClicked = function () {

                        ShowLoginState('', 0);

                        var _email = $support.GetValue('txtShareEmail');
                        if ($support.IsNull(_email) || !$support.IsValidEmail(_email)) {
                            ShowLoginState('Enter valid e-mail address', -1);
                            return;
                        }

                        var shareName = '';
                        if ($scope.ShareGDPR) {
                            shareName = $support.GetValue('txtSharedName');
                            if ($support.IsNull(shareName)) {
                                ShowLoginState('Provide company or contact name', -1);
                                return;
                            }
                        }

                        $support.start();

                        var data = [{
                            SharedId: sharedId,
                            Email: _email,
                            SharedName: shareName
                        }];

                        $ajx.SharedSession(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                ShowLoginState('Session shared successfully', 0);
                                $support.Hide('btnShareSession');
                                $scope.ShowOneBlock(sharedId, true);
                                $support.stop();
                            } else {
                                var msg = res.data.statusText;
                                ShowLoginState(msg, -1);
                                $support.stop();
                            }
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.OnCancelSharedClicked = function () {
                        sharedId = 0;
                        ShowLoginState('', 0);
                        $scope.ShareGDPR = false;
                        $support.SetValue('txtShareEmail', '');
                        $support.SetValue('txtSharedName', '');
                        $support.Hide('popShareSessionDiv');
                        $support.ShowInline('btnShareSession');
                    };

                    $scope.ShowRecoredLink = function (recordedLink) {
                        $support.AddVideoSrc('sessionvideocontrol', recordedLink);
                        $support.TriggerDialog('popRecordedVideoDiv', true);
                    };

                    $scope.OnSharedUpdateClicked = function (sharedItems) {
                        $support.start();
                        $ajx.SetSharedList(sharedItems, function (res) {
                            $support.stop();
                        }, function (res) {
                            $support.stop();
                        });
                    };

                    function ShowLoginState(msg, _succ) {
                        $support.SetText('errorShare', '');
                        $support.SetText('successShare', '');
                        $support.Hide('errorShare');
                        $support.Hide('successShare');

                        if (!$support.IsNull(msg)) {
                            if (_succ === 0) {
                                $support.SetText('successShare', msg);
                                $support.Show('successShare');
                            } else {
                                $support.SetText('errorShare', msg);
                                $support.Show('errorShare');
                            }
                        }
                    }
                }]);

    });