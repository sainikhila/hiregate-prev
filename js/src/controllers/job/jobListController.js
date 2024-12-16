
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngEnter' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/fileChange' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("jobListController",
            ['$scope', '$rootScope', '$routeParams', '$location', 'sharedService', 'sharedMethod', 'user',
                function ($scope, $root, $rparams, $loc, $ajx, $support, $user) {

                    $scope.JobFormatFile = window.__env.apiUrl + '/Documents/formats/JobsFormat.csv';

                    $scope.JobHeaders = {};
                    $scope.JobFilters = {};
                    $scope.SelectedJob = {};
                    $scope.pubDateFrom = '';
                    $scope.pubDateTo = '';
                    $scope.pubToFaceIt3 = true;
                    $scope.searchString = '';
                    $scope.findTitleString = '';

                    $scope.filterPublishedBy = '0';
                    $scope.filterByStatus = 'Status';
                    $scope.filterByJobId = '0';
                    $scope.dtPublishedFrom = $scope.dtPublishedTo = '';
                    $scope.dtClosedFrom = $scope.dtClosedTo = '';
                    $scope.searchString = $scope.findTitleString = '';

                    $scope.LoadDefaults = function () {
                        loadInit();
                    };

                    function loadInit() {
                        $support.start();
                        $ajx.GetJobHeaders(
                            function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.JobHeaders = res.data.Results;
                                    $support.ApplyLocalDate($scope.JobHeaders,
                                        ['ClosedOn', 'CreatedOn', 'PublishedOn'], 'YYYY-MM-DD');

                                    $scope.JobFilters = $scope.JobHeaders;
                                    $scope.FiltersListJobId =
                                        $support.GetKeyValuePairsDefault($scope.JobHeaders,
                                            'JobId', 'JobTag', 'Job Id');

                                    $scope.FiltersListPublish =
                                        $support.GetKeyValuePairsDefault($scope.JobHeaders,
                                            'JobId', 'CreatedBy', 'Published By');

                                    $scope.FiltersListPublish =
                                        $support.RemoveDuplicates($scope.FiltersListPublish, 'Name');
                                }
                                $support.stop();
                            }, function (res) {
                                $support.stop();
                            }
                        );
                    }

                    $scope.ShowOneBlock = function (eTag, bRefresh) {

                        $scope.SelectedJob = {};

                        var selectedVal = undefined;

                        if (!bRefresh) {
                            selectedVal = resetDisplayedBlock(eTag);
                        } else {
                            selectedVal = getDisplayedBlock(eTag);
                        }

                        if (selectedVal) {
                            var keyId = 'Block_' + selectedVal.JobId + '_' + selectedVal.JobTag;
                            var resultId = 'Results_' + selectedVal.JobId + '_' + selectedVal.JobTag;
                            var errorId = 'Error_' + selectedVal.JobId + '_' + selectedVal.JobTag;
                            var progressId = 'Progess_' + selectedVal.JobId + '_' + selectedVal.JobTag;

                            $support.Show(keyId);
                            $support.Show(progressId);
                            $ajx.GetJobDetails(selectedVal.JobId,
                                function (res) {
                                    $support.Hide(progressId);
                                    if ($support.IsSuccess(res)) {
                                        $scope.SelectedJob = res.data.Results;
                                        $support.Show(resultId);
                                    } else {
                                        $support.Show(errorId);
                                    }
                                }, function (res) {
                                    $support.Hide(progressId);
                                    $support.Show(errorId);
                                }
                            );
                        }
                    };

                    function getDisplayedBlock(eTag) {

                        var selectedId = undefined;

                        angular.forEach($scope.JobFilters, function (tItem) {
                            if (eTag === tItem.JobId) {
                                selectedId = tItem;
                            }
                        });

                        return selectedId;
                    }

                    function resetDisplayedBlock(eTag) {

                        var selectedId = undefined;

                        for (var i = 0; i < $scope.JobFilters.length; i++) {

                            var vjob = $scope.JobFilters[i];

                            var tItem = vjob.JobId;
                            var keyId = 'Block_' + vjob.JobId + '_' + vjob.JobTag;
                            var resultId = 'Results_' + vjob.JobId + '_' + vjob.JobTag;
                            var errorId = 'Error_' + vjob.JobId + '_' + vjob.JobTag;
                            var progressId = 'Progess_' + vjob.JobId + '_' + vjob.JobTag;
                            //var refreshId = 'Refresh_' + vjob.JobId + '_' + vjob.JobTag;

                            //$support.Hide(refreshId);
                            $support.Hide(resultId);
                            $support.Hide(errorId);
                            $support.Hide(progressId);

                            var elLabel = $support.getElement('labelText_' + vjob.JobId);
                            if (elLabel) {
                                elLabel.val('View');
                            }

                            var elem = $support.getElement(keyId);

                            if (elem) {
                                if (eTag === tItem && elem[0].style['display'] !== 'block') {
                                    selectedId = vjob;
                                    elLabel.val('Hide');
                                }
                                else if (elem[0].style['display'] === 'block') {
                                    $support.Hide(keyId);
                                }
                            }
                        }

                        return selectedId;
                    }

                    $scope.SetNA = function (val) {
                        return $support.IsNull(val) ? 'N/A' : val;
                    };

                    $scope.OnPublishShow = function () {
                        $support.Hide('errorPubMsg');
                        $support.Show('popPublishJob');
                    };

                    $scope.OnPublishHide = function () {
                        $scope.pubDateFrom = '';
                        $scope.pubDateTo = '';
                        $scope.pubToFaceIt3 = true;
                        $support.Hide('popPublishJob');
                    };

                    $scope.OnPublishCompleted = function () {
                        $scope.pubDateFrom = '';
                        $scope.pubDateTo = '';
                        $scope.pubToFaceIt3 = true;
                        $support.Hide('popJobPublishSuccessful');
                        loadInit($scope.SelectedJob.JobId);
                    };

                    $scope.PublishJob = function () {
                        $support.SetText('errorPubMsg', 'Select From and To date');
                        $support.Hide('errorPubMsg');
                        if ($support.IsNull($scope.pubDateFrom) || $support.IsNull($scope.pubDateTo)) {
                            $support.Show('errorPubMsg');
                            return;
                        }

                        var data = {
                            JobId: $scope.SelectedJob.JobId,
                            RecordStatus: 0,
                            PublishedOn: $support.getUTCTimeZone2($scope.pubDateFrom),
                            ClosedOn: $support.getUTCTimeZone2($scope.pubDateTo),
                            PublishToFaceIt: $scope.pubToFaceIt3
                        };

                        $support.start();
                        $ajx.PublishExistingJob(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.OnPublishHide();
                                $support.Show('popJobPublishSuccessful');
                            } else {
                                $support.SetText('errorPubMsg', 'System fail to process. Please try again.');
                                $support.Show('errorPubMsg');
                            }
                        }, function (err) {
                            $support.stop();
                            $support.SetText('errorPubMsg', 'System fail to process. Please try again.');
                            $support.Show('errorPubMsg');
                        });
                    };

                    $scope.OnCloseShow = function (keyId) {
                        $support.Hide('errorCloseMsg');
                        $support.Show('popJobCloseConfirm');
                    };

                    $scope.OnCloseCancel = function () {
                        $support.Hide('popJobCloseConfirm');
                    };

                    $scope.OnCloseComplete = function () {
                        $support.SetText('errorCloseMsg', 'Please Wait...');

                        $support.Show('errorCloseMsg');

                        var data = {
                            JobId: $scope.SelectedJob.JobId,
                            RecordStatus: 4,
                            PublishedOn: $support.getUTCTimeZone2($scope.SelectedJob.PublishedOn),
                            ClosedOn: $support.getUTCTimeZone2(new Date())
                        };

                        $support.start();
                        $ajx.PublishExistingJob(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.Hide('popJobCloseConfirm');
                                loadInit($scope.SelectedJob.JobId);
                            } else {
                                $support.SetText('errorCloseMsg', 'System fail to process. Please try again.');
                                $support.Show('errorCloseMsg');
                            }
                        }, function (err) {
                            $support.stop();
                            $support.SetText('errorCloseMsg', 'System fail to process. Please try again.');
                            $support.Show('errorCloseMsg');
                        });
                    };

                    $scope.OnDeleteShow = function (keyId) {
                        $support.Hide('errorDeleteMsg');
                        $support.Show('popJobDeleteConfirm');
                    };

                    $scope.OnDeleteCancel = function () {
                        $support.Hide('popJobDeleteConfirm');
                    };

                    $scope.OnDeleteComplete = function () {
                        $support.SetText('errorDeleteMsg', 'Please Wait...');
                        $support.Show('errorDeleteMsg');

                        var data = {
                            JobId: $scope.SelectedJob.JobId,
                            RecordStatus: 2,
                            PublishedOn: $support.getUTCTimeZone2($scope.SelectedJob.PublishedOn),
                            ClosedOn: $support.getUTCTimeZone2(new Date())
                        };

                        $support.start();
                        $ajx.PublishExistingJob(data, function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $support.Hide('popJobDeleteConfirm');
                                loadInit($scope.SelectedJob.JobId);
                            } else {
                                $support.SetText('errorDeleteMsg', 'System fail to process. Please try again.');
                                $support.Show('errorDeleteMsg');
                            }
                        }, function (err) {
                            $support.stop();
                            $support.SetText('errorDeleteMsg', 'System fail to process. Please try again.');
                            $support.Show('errorDeleteMsg');
                        });

                    };

                    /* Filters section starts here */
                    $scope.FilterItemsDisplay = [];
                    $scope.FiltersListJobId = [];
                    $scope.FiltersListPublish = [];

                    $scope.FindString = "";
                    $scope.filterByStatus = 'Status';
                    $scope.filterByJobId = '0';
                    $scope.filterPublishedBy = '0';

                    $scope.dtPublishedFrom = '';
                    $scope.dtPublishedTo = '';
                    $scope.dtClosedFrom = '';
                    $scope.dtClosedTo = '';

                    $scope.OnFilterChanged = function () {
                        DoFilters();
                    };

                    $scope.OnFilterStatusChanged = function () {
                        if ($scope.filterByStatus === 'Status') {
                            UpdateFilterItems('Status', 'Status', null, null, null, null, true);
                        } else {
                            UpdateFilterItems('Status', 'Status', $scope.filterByStatus, $scope.filterByStatus);
                        }
                    };

                    $scope.OnFilterByJobIdChanged = function () {
                        if (parseInt($scope.filterByJobId) === 0) {
                            UpdateFilterItems('JobId', 'Job Id', null, null, null, null, true);
                        } else {
                            var item = $support.GetItem($scope.FiltersListJobId,
                                'Id', parseInt($scope.filterByJobId));
                            UpdateFilterItems('JobId', 'Job Id', $scope.filterByJobId, item.Name);
                        }
                    };

                    $scope.OnFilterPublishedByChanged = function () {
                        if (parseInt($scope.filterPublishedBy) === 0) {
                            UpdateFilterItems('CreatedBy', 'Published By', null, null, null, null, true);
                        } else {
                            var item = $support.GetItem($scope.FiltersListPublish,
                                'Id', parseInt($scope.filterPublishedBy));
                            UpdateFilterItems('CreatedBy', 'Published By', item.Name, item.Name);
                        }
                    };

                    $scope.OnFilterPublishedDtChanged = function () {
                        if (!$support.IsNull($scope.dtPublishedFrom) && !$support.IsNull($scope.dtPublishedTo)) {
                            UpdateFilterItems('PDate', 'Publlished Date', null,
                                $scope.dtPublishedFrom + ' To ' + $scope.dtPublishedTo,
                                $scope.dtPublishedFrom, $scope.dtPublishedTo);
                        } else if (!$support.IsNull($scope.dtPublishedFrom) && $support.IsNull($scope.dtPublishedTo)) {
                            UpdateFilterItems('PDate', 'Publlished Date From', null,
                                $scope.dtPublishedFrom,
                                $scope.dtPublishedFrom, $scope.dtPublishedTo);
                        } else if ($support.IsNull($scope.dtPublishedFrom) && !$support.IsNull($scope.dtPublishedTo)) {
                            UpdateFilterItems('PDate', 'Publlished Date To', null,
                                $scope.dtPublishedTo,
                                $scope.dtPublishedFrom, $scope.dtPublishedTo);
                        } else {
                            UpdateFilterItems('PDate', null, null, null, null, true);
                        }
                    };

                    $scope.OnFilterClosedDtChanged = function () {
                        if (!$support.IsNull($scope.dtClosedFrom) && !$support.IsNull($scope.dtClosedTo)) {
                            UpdateFilterItems('CDate', 'Closing Date', null,
                                $scope.dtClosedFrom + ' To ' + $scope.dtClosedTo,
                                $scope.dtClosedFrom, $scope.dtClosedTo);
                        } else if (!$support.IsNull($scope.dtClosedFrom) && $support.IsNull($scope.dtClosedTo)) {
                            UpdateFilterItems('CDate', 'Closing Date From', null,
                                $scope.dtClosedFrom,
                                $scope.dtClosedFrom, $scope.dtClosedTo);
                        } else if ($support.IsNull($scope.dtClosedFrom) && !$support.IsNull($scope.dtClosedTo)) {
                            UpdateFilterItems('CDate', 'Closing Date To', null,
                                $scope.dtClosedTo,
                                $scope.dtClosedFrom, $scope.dtClosedTo);
                        } else {
                            UpdateFilterItems('CDate', null, null, null, null, true);
                        }
                    };

                    $scope.OnSearchSelected = function () {
                        $scope.findTitleString = $scope.searchString;
                        $scope.searchString = '';
                        if (!$support.IsNull($scope.findTitleString)) {
                            UpdateFilterItems('Search', 'Search', $scope.findTitleString, $scope.findTitleString);
                        }
                        DoFilters();
                    };

                    $scope.ClearFilter = function () {
                        $scope.FilterItemsDisplay = [];
                        DoFilters();
                    };

                    $scope.RemoveFilter = function (index) {

                        var item = $support.GetItem($scope.FilterItemsDisplay, 'FilterIndex', index);
                        var items = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', index);
                        if ($support.IsArrayEmpty(items)) items = [];
                        $scope.FilterItemsDisplay = items;

                        switch (item.FilterType) {
                            case 'Status': $scope.filterByStatus = 'Status'; break;
                            case 'JobId': $scope.filterByJobId = '0'; break;
                            case 'CreatedBy': $scope.filterPublishedBy = '0'; break;
                            case 'PDate': $scope.dtPublishedFrom = $scope.dtPublishedTo = ''; break;
                            case 'CDate': $scope.dtClosedFrom = $scope.dtClosedTo = ''; break;
                            case 'Search': $scope.findTitleString = $scope.findTitleString = ''; break;
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

                        filterBackUp = items;
                    }

                    var filterBackUp = $scope.FilterItemsDisplay;

                    function DoFilters() {

                        $scope.FilterItemsDisplay = filterBackUp;
                        filterBackUp = [];
                        $scope.JobHeaders = $scope.JobFilters;

                        angular.forEach($scope.FilterItemsDisplay, function (item) {
                            switch (item.FilterType) {
                                case 'Status':
                                    $scope.JobHeaders = $support.GetItems($scope.JobHeaders, 'StatusTag', item.FilterValue);
                                    break;
                                case 'JobId':
                                    $scope.JobHeaders = $support.GetItems($scope.JobHeaders, 'JobId', parseInt(item.FilterValue));
                                    break;
                                case 'CreatedBy':
                                    $scope.JobHeaders = $support.GetItems($scope.JobHeaders, 'CreatedBy', item.FilterValue);
                                    break;
                                case 'PDate':
                                    if (!$support.IsNull(item.DateFrom)) {
                                        $scope.JobHeaders = $support.GetItemsByDate($scope.JobHeaders,
                                            'PublishedOn', item.DateFrom, 2);
                                    }

                                    if (!$support.IsNull(item.DateTo)) {
                                        $scope.JobHeaders = $support.GetItemsByDate($scope.JobHeaders,
                                            'PublishedOn', item.DateTo, -2);
                                    }
                                    break;
                                case 'CDate':
                                    if (!$support.IsNull(item.DateFrom)) {
                                        $scope.JobHeaders = $support.GetItemsByDate($scope.JobHeaders,
                                            'ClosedOn', item.DateFrom, 2);
                                    }

                                    if (!$support.IsNull(item.DateTo)) {
                                        $scope.JobHeaders = $support.GetItemsByDate($scope.JobHeaders,
                                            'ClosedOn', item.DateTo, -2);
                                    }
                                    break;
                                case 'Search':
                                    $scope.JobHeaders = $support.GetContainedItems($scope.JobHeaders, 'JobTitle', item.FilterValue);
                                    break;
                            }
                        });

                        resetFilterValues();

                        changeDropDownStyle();
                    }

                    function changeDropDownStyle() {
                        angular.forEach($("select"), function (item) {
                            if (item.id) {
                                $support.EnableSelect(item.id, true);
                                if (item.selectedIndex === 0) {
                                    $support.EnableSelect(item.id, false);
                                }
                            }
                        });
                    }

                    function resetFilterValues() {
                        var items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'Status');
                        if ($support.IsNull(items)) $scope.filterByStatus = 'Status';

                        items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'JobId');
                        if ($support.IsNull(items)) $scope.filterByJobId = '0';

                        items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'CreatedBy');
                        if ($support.IsNull(items)) $scope.filterPublishedBy = '0';

                        items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'PDate');
                        if ($support.IsNull(items)) $scope.dtPublishedFrom = $scope.dtPublishedTo = '';

                        items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'CDate');
                        if ($support.IsNull(items)) $scope.dtClosedFrom = $scope.dtClosedTo = '';

                        items = $support.GetItem($scope.FilterItemsDisplay, 'FilterType', 'Search');
                        if ($support.IsNull(items)) $scope.searchString = $scope.findTitleString = '';
                    }

                    function HideImportJobMsg(bFull) {
                        if ($support.IsNull(bFull)) $('#importJobXLS').val('');
                        $support.Hide('jobImpErrorMsg');
                        $support.Hide('jobImpSuccessMsg');
                        $support.Hide('jobImpFileError');
                        $support.Hide('jobImpFailedError');
                    }

                    $scope.OnFileChanged = function () {
                        $support.Hide('jobImpErrorMsg');
                        $support.Hide('jobImpSuccessMsg');
                    };

                    $scope.OnImportJobHide = function () {
                        HideImportJobMsg();
                        $support.Hide('popImportJob');
                    };

                    $scope.OnImportJobShow = function () {
                        HideImportJobMsg();
                        $support.Show('popImportJob');
                    };

                    $scope.ImportJobXLS = null;
                    $scope.OnImportJobClick = function () {
                        HideImportJobMsg(true);
                        if ($support.IsNull($scope.ImportJobXLS)) {
                            $support.Show('jobImpErrorMsg');
                            return;
                        }
                        $support.start();
                        UploadExcelJob();
                    };

                    function UploadExcelJob() {
                        var fd = new FormData();
                        fd.append("TypeOfDoc", 'Jobs');
                        fd.append("UserId", 101);
                        fd.append("FileData", $scope.ImportJobXLS);
                        fd.append("AddToProfile", false);

                        $ajx.UploadContents(fd, function (res) {
                            if ($support.IsSuccess(res)) {
                                getJobImport(res.data.Results);
                            } else {
                                $support.Show('jobImpFailedError');
                                $support.stop();
                            }

                        }, function (res) {
                            $support.Show('jobImpFailedError');
                            $support.stop();
                        });
                    }

                    function getJobImport(file) {
                        $ajx.GetJobImport(file, function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.OnImportJobHide();
                                $support.stop();
                                loadInit();
                            } else {
                                $support.Show('jobImpFailedError');
                                $support.stop();
                            }

                        }, function (res) {
                            $support.Show('jobImpFailedError');
                            $support.stop();
                        });
                    }

                    changeDropDownStyle();
                }]);
    });