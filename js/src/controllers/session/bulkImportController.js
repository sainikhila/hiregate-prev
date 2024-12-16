
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/fileChange' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("bulkImportController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod',
                function ($scope, $root, $ajx, $support) {

                    $scope.importSessionCSV = '';
                    $scope.Rows = [];
                    $scope.Jobs = [];
                    $scope.chkSelectSAll = true;
					$scope.SelectedItems = [];

                    $scope.$on('SessionBulkImport', function (evt, data) {
                        ShowError('');
                        $scope.Jobs = data.Jobs;
                        $scope.Jobs.unshift({ Id: 0, Text: 'Select' });
                        $support.Hide('seImpFileError');
                        $support.Hide('btnSECancel2');
                        $support.Hide('importrowsHeaderDiv');
                        $support.Hide('importrowsDiv');
                        $support.Hide('btnSEImport');
                        $support.Hide('btnSESchedule');
                        $support.ShowInline('btnSECancel');
                        $support.Show('noimportrowsDiv');
                        $support.Show('popImportDetails');
                    });

                    $scope.GetImportCSV = function () {
                        extractFile();
                    };

                    $scope.OnDateClicked = function (rowId) {
                        //loadCalendar('impDatepicker_' + rowId);
                    };

                    function extractFile() {
                        $scope.Rows = [];
                        var fileInput = document.getElementById("importSessionCSV");
                        var reader = new FileReader();

                        reader.onload = function () {
                            var lines = reader.result.split('\n');
                            var rows = [];
                            var iRow = 0, headers;
                            lines.forEach(function (item) {
                                if (!$support.IsNull(item)) {
                                    if (iRow === 0) {
                                        headers = 'CName,CEmail,CPhone,EName,EEmail,EPhone,IDate,ITime';
                                    } else {
                                        rows.push(parseRow(headers, item, iRow));
                                    }
                                    iRow++;
                                }
                            });

                            $root.safeApply(function () {
                                $scope.Rows = rows;
                            });
                            if (!$support.IsArrayEmpty($scope.Rows)) {
                                $support.ShowInline('btnSEImport');
                                $support.ShowInline('btnSESchedule');
                                $support.ShowInline('btnSECancel2');
                                $support.Hide('noimportrowsDiv');
                                $support.Show('importrowsHeaderDiv');
                                $support.Show('importrowsDiv');
                            }
                        };
                        reader.readAsBinaryString(fileInput.files[0]);
                    }

                    function parseRow(headerRow, row, rowIndex) {
                        var headers = headerRow.split(',');
                        var insideQuote = false, indx = 0, entries = {}, entry = [];

                        row.split('').forEach(function (character) {
                            if (character === '"') {
                                insideQuote = !insideQuote;
                            } else {
                                if (character === "," && !insideQuote) {
                                    entries[headers[indx]] = entry.join('');
                                    entry = [];
                                    indx++;
                                } else {
                                    entry.push(character);
                                }
                            }
                        });

                        entries['JobId'] = 0;
                        entries['Resume'] = '';
                        entries['JDProfile'] = '';
                        entries['ITime'] = entry.join('');
                        parseDate(entries);
                        entries['RowIndex'] = rowIndex;

                        return entries;
                    }

                    function parseDate(entries) {
                        entries['Checked'] = true;
                        entries['DateString'] = '';
                        entries['DateHour'] = '00';
                        entries['DateMinute'] = '-1';

                        var dtIn = entries['IDate'].replace(/-/g, ' ');
                        if (!$support.IsNull(dtIn)) {
                            var _date = Date.parse(dtIn);
                            entries['DateString'] = moment(_date).format('YYYY-MMM-DD');
                            dtIn = entries['ITime'];

                            if (dtIn.indexOf(':') < 0) dtIn = dtIn + ':00';

                            entries['DateHour'] = parseInt(dtIn.split(':')[0]);
                            var mn = parseInt(dtIn.split(':')[1]);
							
							if (mn === 15 || mn === 30 || mn === 45) {
                                // DO NOTHING
                            } else if (mn > -1 && mn < 15) {
                                mn = 0;
                            } else if (mn > 14 && mn < 30) {
                                mn = 15;
                            } else if (mn > 30 && mn < 45) {
                                mn = 30;
                            } else if (mn > 44 && mn < 60) {
                                mn = 45;
                            } else {
                                mn = 0;
                            }

                            entries['DateMinute'] = mn.toString();
                        }
                    }

                    function ShowError(msg) {
                        $support.Hide('importErrorMsg');
                        if (!$support.IsNull(msg)) {
                            $support.SetText('importErrorMsg', msg);
                            $support.Show('importErrorMsg');
                        }
                    }

                    $scope.SubmitSchedules = function (impType) {
						
                        ShowError("");
						
						$scope.SelectedItems = $support.GetItems($scope.Rows,'Checked',true);
						if ( $support.IsArrayEmpty($scope.SelectedItems) ){
							ShowError("Select atleast one imported session");
                            return;
						}
						
						var bValid = true;
                        angular.forEach($scope.SelectedItems, function (row) {
							row.Import = impType;
                            var tagId1 = 'txtSessCV_' + row.RowIndex;
                            var tagId2 = 'txtSessJD_' + row.RowIndex;
                            SetErrorStyle(tagId1, true);
                            SetErrorStyle(tagId2, true);
                            if (!$support.IsNull(row.JDProfile) && !$support.IsNull(row.Resume)) {
                                if (row.JDProfile.name.toUpperCase() === row.Resume.name.toUpperCase()) {
                                    SetErrorStyle(tagId1);
                                    SetErrorStyle(tagId2);
                                    bValid = false;
                                }
                            }
                        });

                        if (!bValid) {
                            ShowError("Resume and JD Profile cannot be same");
                            return;
                        }
						
						angular.forEach($scope.SelectedItems, function (row) {
                            var tagId = 'txtSessJob_' + row.RowIndex;
                            SetErrorStyle(tagId, true);
                            if (row.Checked && parseInt(row.JobId) === 0) {
                                SetErrorStyle(tagId);
                                bValid = false;
                            }
                        });

                        angular.forEach($scope.SelectedItems, function (row) {
                            var tagId = 'impDatepicker_' + row.RowIndex;
                            SetErrorStyle(tagId, true);
                            if (row.Checked) {
                                if (!$support.IsNull(row.DateString)) {
                                    if (!moment(row.DateString, 'YYYY-MMM-DD', true).isValid()) {
                                        SetErrorStyle(tagId);
                                        bValid = false;
                                    } else if (parseInt(row.DateHour) < 1 || parseInt(row.DateMinute) < 0) {
                                        SetErrorStyle(tagId);
                                        bValid = false;
                                    } else {
                                        row.IDate = row.DateString + ' ' + row.DateHour + ':' + row.DateMinute;
                                    }
                                } else {
                                    SetErrorStyle(tagId);
                                    bValid = false;
                                }
                            }
                        });

                        if (!bValid) {
                            ShowError("Clear all required fields");
                            return;
                        }
						
						validateSessions();
                    };

                    function validateSessions() {
                        $support.start();
                        var data = [];
                        angular.forEach($scope.SelectedItems, function (row) {
                            data.push(
                                {
                                    InterviewDate: $support.getUTCTimeZoneOnSplit(row.IDate),
                                    CandidateEmail: row.CEmail,
                                    CandidateName: row.CName,
                                    CandidatePhone: row.CPhone,
                                    InterviewerEmail: row.EEmail,
                                    InterviewerName: row.EName,
                                    InterviewerPhone: row.EPhone,
                                    SessionId: row.RowIndex
                                }
                            );
                        });
						
                        $ajx.ValidateSession(data,
                            function (res) {
                                if (res.status === 200 && res.data.status === 200) {
                                    var results = res.data.Results;
                                    if ($support.IsArrayEmpty(results)) {
                                        ShowError('System fail to process. Please try again.');
                                        $support.stop();
                                    } else {
                                        var bValid = true;
                                        angular.forEach($scope.SelectedItems, function (row) {
                                            var item = $support.GetItem(results, 'Id', row.RowIndex);
                                            if (item && parseInt(item.Count) > 0) {
                                                bValid = false;
                                                var tagId = 'impDatepicker_' + row.RowIndex;
                                                SetErrorStyle(tagId);
                                            }
                                        });
                                        if (!bValid) {
                                            ShowError('Few sessions are conflicts with other sessions.');
                                            $support.stop();
                                        } else {
                                            doPost();
                                        }
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

                    function doPost() {
                        var jdLst = $support.GetArrayValues($scope.SelectedItems, 'JDProfile');
                        var cvLst = $support.GetArrayValues($scope.SelectedItems, 'Resume');

                        if (!$support.IsArrayEmpty(jdLst) || !$support.IsArrayEmpty(cvLst)) {
                            var fd = new FormData();
                            angular.forEach($scope.SelectedItems, function (row) {
                                if (!$support.IsNull(row.JDProfile))
                                    fd.append("J" + row.RowIndex, row.JDProfile);
                                if (!$support.IsNull(row.Resume))
                                    fd.append("R" + row.RowIndex, row.Resume);
                            });
                            fd.append('TypeOfDoc', 'Jobs');
                            //$support.start();
                            $ajx.AddBulkFileUpload(fd, function (res) {
                                if (res.status === 200 && res.data.status === 200) {
                                    uploadContent(res.data.Results);
                                } else {
                                    $support.stop();
                                    ShowError("System fail to process. Please try again.");
                                }
                            }, function (res) {
                                $support.stop();
                                ShowError("System fail to process. Please try again.");
                            });
                        } else {
                            uploadContent();
                        }
                    }

                    function uploadContent(files) {

                        if (!$support.IsArrayEmpty(files)) {
                            angular.forEach($scope.SelectedItems, function (row) {
                                var tagId = 'J' + row.RowIndex;
                                var item = $support.GetItem(files, 'Id', tagId);
                                if (item) row.JDProfile = item.Name;

                                tagId = 'R' + row.RowIndex;
                                item = $support.GetItem(files, 'Id', tagId);
                                if (item) row.Resume = item.Name;
                            });
                        }

                        var data = [];

                        angular.forEach($scope.SelectedItems, function (row) {
                            if (row.Checked) {
                                var item = {
                                    CandidateName: row.CName,
                                    CandidateEmail: row.CEmail,
                                    CandidatePhone: row.CPhone,
                                    InterviewerName: row.EName,
                                    InterviewerEmail: row.EEmail,
                                    InterviewerPhone: row.EPhone,
                                    InterviewDate: $support.getUTCTimeZoneOnSplit(row.IDate),
                                    JobId: row.JobId,
                                    SharedJDProfile: row.JDProfile,
                                    SharedResume: row.Resume,
                                    Import: row.Import
                                };
                                data.push(item);
                            }
                        });

                        $ajx.AddBulkSession(data,
                            function (res) {
                                if (res.status === 200 && res.data.status === 200) {
                                    if (parseInt(res.data.Results) === 1) {
                                        $support.stop();
                                        ShowError("System fail to process. Please try again.");
                                    } else if (parseInt(res.data.Results) === -1) {
                                        $support.stop();
                                        ShowError("Some of the scheduleds was not imported.");
                                    } else {
                                        $root.$broadcast('SessionRefreshImport', {});
                                        $support.Hide('popImportDetails');
                                    }

                                } else {
                                    $support.stop();
                                    ShowError("System fail to process. Please try again.");
                                }
                            }, function (res) {
                                $support.stop();
                                ShowError("System fail to process. Please try again.");
                            }
                        );
                    }

                    function AddToExt(val) {
                        if (val && !val.toUpperCase().endsWith('.PDF')) {
                            return val + '.pdf';
                        }
                        return val;
                    }
                    $scope.HideBulkImport = function () {
                        $('#importSessionCSV').val('');
                        $support.Hide('popImportDetails');
                    };

                    $scope.OnCheckClicked = function (indx) {
                        var cCount = $support.GetItemsCount($scope.Rows, 'Checked', false);
                        $scope.chkSelectSAll = cCount === 0;
                    };

                    $scope.OnCheckAllClicked = function (indx) {
                        angular.forEach($scope.Rows, function (row) {
                            row.Checked = $scope.chkSelectSAll;
                        });
                    };

                    function SetErrorStyle(el, remove) {
                        var element = $support.getElement(el);
                        if (element) {
                            if (remove) {
                                element.css({
                                    "border-color": "#96c4c8",
                                    "border-width": "1px",
                                    "border-style": "solid"
                                });
                            } else {
                                element.css({
                                    "border-color": "#f80c3a",
                                    "border-width": "1px",
                                    "border-style": "solid"
                                });
                            }
                        }
                    }
                }
            ]);

    });