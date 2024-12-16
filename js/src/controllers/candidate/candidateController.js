
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/onlyDigits' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("candidateController",
        ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'storageFactory',
            function ($scope, $root, ajx, $support, $shared) {
                $scope.Results = [];
                $scope.ResultsBackup = [];
                $scope.FilterItemsDisplay = [];
                $scope.FindString = "";
                $scope.propertyName = '';
                $scope.reverse = false;
                $scope.pricestart = 0;
                $scope.priceend = 0;
                $scope.CanFilter = {
                    Company: true,
                    Assessed: false,
                    All: false
                };
                $scope.LanguagesPack = [];
                $scope.codetext = "";

                $scope.IsAddPhoto = function (_photo) {
                    if (_photo) {
                        return _photo.indexOf('/photo_add') > -1;
                    }
                    return true;
                };

                $scope.DeleteAccountPhoto = function (id) {
                    $root.$broadcast('PhotoToDelete', { CanId: id });
                };

                $root.$on("CanPhotoDeleted", function (evt, data) {
                    $scope.LoadDefaults();
                });

                $scope.OnLoadResults = function () {
                    $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterType', 'KeyWordSearch');
                    $scope.LoadDefaults();
                };

                $scope.LoadDefaults = function () {
                    $support.start();
                    $scope.FilterItemsDisplay = [];
                    $scope.loadResults();
                };

                $scope.loadResults = function () {
                    $scope.Results = [];
                    $scope.ResultsBackup = [];

                    $scope.FindString = $shared.getValue('FindString', '');

                    ajx.GetAllCandidates(function (res) {
                        $support.stop();
                        if ($support.IsSuccess(res)) {
                            $scope.ResultsBackup = res.data.Results;
                            $scope.Results = $scope.ResultsBackup;
                            if (!$support.IsNull($scope.FindString)) {
                                ExtractKeyWords();
                            }
                            $scope.DoFilters();
                        }
                    }, function (err) {
                        $support.stop();
                    });
                };

                function ExtractKeyWords() {

                    var keywords = $scope.FindString.split(" ");
                    var iKey = 1;

                    var items = $support.ExcludeItem($scope.FilterItemsDisplay, 'Type', 'KeyWordSearch');

                    angular.forEach(keywords, function (item) {
                        if (!$support.IsNull(item)) {
                            items.push(
                                { FilterIndex: 0, FilterType: 'KeyWordSearch', FilterLabel: item, FilterValue: item });
                        }
                    });

                    var cnt = 1;

                    angular.forEach($scope.items, function (key) {
                        key.FilterIndex = cnt;
                        cnt++;
                    });

                    $scope.FilterItemsDisplay = items;
                }

                $scope.FilterClicked = function (fltType, fltLabel, val) {

                    $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterType', fltType);

                    $scope.FilterItemsDisplay.push({ FilterIndex: 0, FilterType: fltType, FilterLabel: fltLabel, FilterValue: val });

                    var cnt = 1;

                    angular.forEach($scope.FilterItemsDisplay, function (key) {
                        key.FilterIndex = cnt;
                        cnt++;
                    });

                    $scope.DoFilters();
                };

                $scope.OnCandidateFilterC = function () {
                    //$scope.CanFilter.Assessed = false;
                    //$scope.CanFilter.All = false;
                    $scope.DoFilters();
                };

                $scope.OnCandidateFilterA = function () {
                    //$scope.CanFilter.Company = false;
                    //$scope.CanFilter.All = false;
                    $scope.DoFilters();
                };

                $scope.OnCandidateFilter = function () {
                    $scope.CanFilter.Company = false;
                    $scope.CanFilter.Assessed = false;
                    $scope.DoFilters();
                };

                $scope.ClearFilter = function () {

                    var tCount = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'KeyWordSearch');

                    $scope.ResetRadioCheckBoxes('');

                    $scope.FilterItemsDisplay = [];
                    $scope.SrchSkillName = '';
                    $scope.SrchLocation = '';
                    $scope.SrchExp = '0';
                    $scope.SrchSalary = '0';

                    if (tCount > 0) {
                        $support.clearValue('FindString');
                        $scope.LoadDefaults();
                    }
                    else {
                        $scope.DoFilters();
                    }
                };

                $scope.RemoveFilter = function (index, ttype) {

                    $scope.ResetRadioCheckBoxes(ttype);

                    if (ttype === 'KeyWordSearch') {

                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterType', 'KeyWordSearch');

                        $scope.FindString = '';

                        var items = $support.GetItems($scope.FilterItemsDisplay, 'FilterType', 'KeyWordSearch');

                        for (var i = 0; i < items.length; i++) {
                            var tVal = items[i].FilterValue;

                            if ($scope.FindString === '') {
                                $scope.FindString = tVal;
                            }
                            else {
                                $scope.FindString += ' ' + tVal;
                            }
                        }

                        $support.setValue('FindString', $scope.FindString);
                        $scope.LoadDefaults();
                        return;
                    }
                    else {
                        var _tItem = $support.GetItem($scope.FilterItemsDisplay, 'FilterIndex', index);
                        if (_tItem.FilterType === 'SKeyWordSearch') {
                            var _cnt = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'SKeyWordSearch');
                            if (_cnt <= 1) {
                                $scope.SrchSkillName = '';
                            }
                        }
                        else if (_tItem.FilterType === 'SLocation') {
                            $scope.SrchLocation = '';
                        }
                        else if (_tItem.FilterType === 'SExperience') {
                            $scope.SrchExp = '0';
                        }
                        else if (_tItem.FilterType === 'SCTC') {
                            $scope.SrchSalary = '0';
                        }
                        $scope.FilterItemsDisplay = $support.ExcludeItem($scope.FilterItemsDisplay, 'FilterIndex', index);
                    }

                    $scope.DoFilters();
                };

                $scope.sortBy = function (sortid, propertyName, reverse) {

                    var sortings = ['sort01', 'sort02', 'sort03', 'sort04'];

                    for (var i = 0; i < sortings.length; i++) {
                        $support.ChangeClass(sortings[i], 'sortlabel');
                        if (sortings[i] === sortid) {
                            $support.ChangeClass(sortings[i], 'sortlabel-selected');
                        }
                    }

                    if (reverse) {
                        $scope.reverse = $scope.propertyName === propertyName ? !$scope.reverse : reverse;
                    }
                    else {
                        $scope.reverse = reverse;
                    }

                    $scope.propertyName = propertyName;
                };

                $scope.DoFilters = function () {

                    $scope.Results = $scope.ResultsBackup;

                    var fltArray = $scope.FilterItemsDisplay;

                    if (fltArray.length > 0) {
                        for (var i = 0; i < fltArray.length; i++) {
                            if (fltArray[i].FilterValue !== undefined) {
                                $scope.Results = $scope.GetFilterInfo($scope.Results, fltArray[i].FilterType, fltArray[i].FilterValue);
                            }
                        }
                    }

                    if ($scope.CanFilter.Company && !$scope.CanFilter.Assessed) {
                        $scope.Results = $scope.GetFilterInfo($scope.Results, 'List', 'Company');
                    }
                    if (!$scope.CanFilter.Company && $scope.CanFilter.Assessed) {
                        $scope.Results = $scope.GetFilterInfo($scope.Results, 'List', 'Assessed');
                    }
                    if (!$scope.CanFilter.Company && !$scope.CanFilter.Assessed) {
                        $scope.Results = [];
                    }
                };

                $scope.GetFilterInfo = function (itemFilters, typeFilter, valueFilter) {

                    var fltPeople = [];

                    if (typeFilter === 'KeyWordSearch') {
                        return itemFilters;
                    }

                    if (itemFilters.length > 0) {
                        for (var i = 0; i < itemFilters.length; i++) {
                            var starting, ending, tItem;
                            if (typeFilter === 'Rating') {
                                tItem = itemFilters[i][typeFilter];

                                if (tItem >= valueFilter) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'Gender') {
                                if (itemFilters[i][typeFilter] === valueFilter) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'CTC' || typeFilter === 'SCTC') {
                                if (typeFilter === 'SCTC') typeFilter = 'CTC';
                                var orgval = parseFloat(itemFilters[i][typeFilter]) * 100000;

                                starting = parseFloat(valueFilter.split('-')[0]);
                                ending = parseFloat(valueFilter.split('-')[1]);

                                if (orgval >= starting && orgval <= ending) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'Experience' || typeFilter === 'SExperience') {
                                if (typeFilter === 'SExperience') typeFilter = 'Experience';
                                var orgYears = parseFloat(itemFilters[i]['Years']);

                                starting = parseFloat(valueFilter.split('-')[0]);
                                ending = parseFloat(valueFilter.split('-')[1]);

                                if (orgYears >= starting && orgYears <= ending) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'ReviewsCount') {

                                tItem = itemFilters[i].HeaderContent[typeFilter];

                                if (tItem >= valueFilter) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'SLocation') {
                                tItem = itemFilters[i]['City'];

                                if (tItem.toLowerCase() === valueFilter.toLowerCase()) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'SKeyWordSearch') {

                                valueFilter = valueFilter.toLowerCase();
                                var tName = itemFilters[i]['Name'];
                                var tSkills = itemFilters[i]['KeySkills'];

                                tName = !$support.IsNull(tName) ? tName.toLowerCase() : '';
                                tSkills = !$support.IsNull(tSkills) ? tSkills.toLowerCase() : '';

                                if (tName.indexOf(valueFilter.toLowerCase()) > -1) {
                                    fltPeople.push(itemFilters[i]);
                                } else if (tSkills.indexOf(valueFilter.toLowerCase()) > -1) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                            else if (typeFilter === 'List') {
                                if (valueFilter === 'Company' && itemFilters[i]['Internal']) {
                                    fltPeople.push(itemFilters[i]);
                                } else if (valueFilter === 'Assessed' && !itemFilters[i]['Internal']) {
                                    fltPeople.push(itemFilters[i]);
                                }
                            }
                        }
                    }

                    return fltPeople;
                };

                $scope.ViewProfile = function (_keyId, _internal) {
                    if (_internal) {
                        $root.NavigateToRoute('cnp/I' + _keyId);
                    } else {
                        $root.NavigateToRoute('cnp/E' + _keyId);
                    }
                };

                $scope.ResetRadioCheckBoxes = function (tType) {

                    if ($support.IsNull(tType) || tType === 'Rating') {
                        var tCount = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'Rating');
                        if (tCount > 0) {
                            for (var i = 1; i <= 5; i++) {
                                $support.RadioButtonStatus('radiorating' + i, false);
                            }
                        }
                    }

                    if ($support.IsNull(tType) || tType === 'Experience') {
                        tCount = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'Experience');

                        if (tCount > 0) {
                            for (var k = 1; k <= 4; k++) {
                                $support.RadioButtonStatus('radioexp' + k, false);
                            }
                        }
                    }

                    if ($support.IsNull(tType) || tType === 'CTC') {
                        tCount = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'CTC');

                        if (tCount > 0) {
                            for (var l = 1; l <= 3; l++) {
                                $support.RadioButtonStatus('radioprice' + l, false);
                            }

                            $support.SetValue('pricestart', '0');
                            $support.SetValue('priceend', '0');
                        }
                    }

                    if ($support.IsNull(tType) || tType === 'Gender') {
                        tCount = $support.GetItemsCount($scope.FilterItemsDisplay, 'FilterType', 'Gender');

                        if (tCount > 0) {
                            for (var m = 1; m <= 2; m++) {
                                $support.RadioButtonStatus('radiogender' + m, false);
                            }
                        }
                    }

                };

                $scope.CanName = '';
                $scope.CanEmail = '';
                $scope.CanPhone = '';
                var lastCanId = 0;
                $scope.ShowCandidateDelete = function (canId) {
                    lastCanId = canId;
                    $support.Show('popDeleteCandidate');
                };

                $scope.ConfirmCandidateDelete = function () {
                    $support.start();
                    ajx.DeleteCandidate(lastCanId,
                        function (res) {
                            $support.stop();
                            $scope.HideCandidateDelete();
                            $scope.LoadDefaults();
                        }, function (res) {
                            $support.stop();
                        }
                    );
                };

                $scope.HideCandidateDelete = function () {
                    lastCanId = 0;
                    $support.Hide('popDeleteCandidate');
                };


                $scope.ShowHideCandidate = function (bshow) {
                    $scope.CanName = '';
                    $scope.CanEmail = '';
                    $scope.CanPhone = '';

                    $support.SetValue('canName', '');
                    $support.SetValue('canEmail', '');
                    $support.SetValue('canPhone', '');

                    if (bshow) {
                        $support.Show('popAddNewCandidate');
                    } else {
                        $support.Hide('popAddNewCandidate');
                    }
                };

                $scope.ToNullValue = function (_val) {
                    return $support.ToNullValue(_val);
                };

                $scope.SubmitCandidate = function () {
                    $support.Hide('errCanAdd');

                    $scope.CanName = $support.GetValue('canName');
                    $scope.CanEmail = $support.GetValue('canEmail');
                    $scope.CanPhone = $support.GetValue('canPhone');

                    if ($support.IsNull($scope.CanName) ||
                        $support.IsNull($scope.CanEmail) ||
                        $support.IsNull($scope.CanPhone)) {
                        $support.SetText('errCanAdd', 'All fields are mandatory');
                        $support.Show('errCanAdd');
                        return;
                    }

                    if (!$support.IsValidEmail($scope.CanEmail)) {
                        $support.SetText('errCanAdd', 'Enter valid e-mail');
                        $support.Show('errCanAdd');
                        return;
                    }

                    $support.start();

                    var data = {
                        Name: $scope.CanName,
                        Email: $scope.CanEmail,
                        Phone: $scope.CanPhone
                    };

                    ajx.AddCandidate(data, function (res) {
                        $support.stop();
                        if ($support.IsSuccess(res)) {
                            if (parseInt(res.data.Results) === 0) {
                                $support.SetText('errCanAdd', 'E-mail already registered.');
                                $support.Show('errCanAdd');
                            }
                            else if (parseInt(res.data.Results) === -1) {
                                $support.SetText('errCanAdd', 'System fail to process. Please try again.');
                                $support.Show('errCanAdd');
                            } else {
                                $scope.loadResults();
                                $scope.ShowHideCandidate(false);
                                $support.Show('popAddCandidateSuccessful');
                            }
                        }
                    }, function (err) {
                        $support.stop();
                    });

                };

                $scope.ChangePhoto = function (canId, _photo) {
                    $root.$broadcast('OpenPhotoForEdit', { Candidate: true, KeyId: canId, Photo: _photo });
                };

                $root.$on('CanPhotoUpdated', function (evt, data) {
                    var keyId = data.KeyId, _photo = data.Photo;
                    angular.forEach($scope.Results, function (item) {
                        if (item.CandidateId === keyId) {
                            item.Photo = _photo;
                        }
                    });
                });

                $scope.SrchSkillName = '';
                $scope.SrchLocation = '';
                $scope.SrchExp = '0';
                $scope.SrchSalary = '0';

                $scope.OnSearchFilterClicked = function () {

                    var keywords = $scope.SrchSkillName.split(" ");
                    var items = [];
                    $scope.FilterItemsDisplay = [];

                    var cnt = 1;

                    angular.forEach(keywords, function (item) {
                        if (!$support.IsNull(item)) {
                            items.push(
                                { FilterIndex: cnt, FilterType: 'SKeyWordSearch', FilterLabel: item, FilterValue: item });
                            cnt++;
                        }
                    });

                    $scope.FilterItemsDisplay = items;

                    if (!$support.IsNull($scope.SrchLocation)) {
                        cnt++;
                        $scope.FilterItemsDisplay.push({ FilterIndex: cnt, FilterType: 'SLocation', FilterLabel: $scope.SrchLocation, FilterValue: $scope.SrchLocation });
                    }

                    if (!$support.IsNull($scope.SrchExp) && $scope.SrchExp !== '0') {
                        cnt++;
                        $scope.FilterItemsDisplay.push({ FilterIndex: cnt, FilterType: 'SExperience', FilterLabel: $scope.SrchExp, FilterValue: $scope.SrchExp });
                    }

                    if (!$support.IsNull($scope.SrchSalary) && $scope.SrchSalary !== '0') {
                        cnt++;
                        var lblSalary = '';
                        switch ($scope.SrchSalary) {
                            case '100000-500000': lblSalary = '01 Lakh - 5 Lakh'; break;
                            case '500000-1000000': lblSalary = '06 Lakh - 10 Lakh'; break;
                            case '1000000-9999999': lblSalary = 'Over 10 Lakh'; break;
                        }

                        $scope.FilterItemsDisplay.push({ FilterIndex: cnt, FilterType: 'SCTC', FilterLabel: lblSalary, FilterValue: $scope.SrchSalary });
                    }

                    $scope.DoFilters();
                };

                $scope.ShowNewScheduledSession = function (keyId) {
                    $root.$broadcast('NewSession', { JobId: 0, CanId: keyId });
                };

                $scope.ShowCodeChallenge = function (keyId) {
                    $root.$broadcast('ShowCodeChallenge', { AppliedId: 0, CanId: keyId });
                };

                $scope.ViewCodeChallenge = function (data) {
                    $root.$broadcast('ShowCodeForCompile', {
                        CodeId: data.CodeId,
                        Question: data.Question,
                        Answer: data.Answer
                    });
                };

            }]);
});