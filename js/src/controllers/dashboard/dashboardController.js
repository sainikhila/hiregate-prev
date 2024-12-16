
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'controllers/popups/popupController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("dashboardController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'user',
                function ($scope, $root, $ajx, $support, $user) {

                    var longMonths = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

                    $scope.CountYear = 0;
                    $scope.CountMonth = 0;
                    $scope.StatisticsYear = 0;
                    $scope.DaySessionYear = 0;
                    $scope.DaySessionMonth = 0;
                    $scope.TimeSessionYear = 0;
                    $scope.TimeSessionMonth = 0;
                    $scope.MonthSessionYear = 0;
                    $scope.MonthSessionMonth = 0;
                    $scope.MonthSessionJob = 0;

                    $scope.AccountPhoto = $user.Get('Photo');

                    $scope.AllSessions = [];
                    $scope.AllJobs = [];
                    $scope.Sessions = [];
                    $scope.UpComingSessions = [];
                    $scope.ActiveJobs = [];
                    $scope.MyTasks = [];
                    $scope.ShortContact = {
                        Name: '',
                        Email: '',
                        Designation: '',
                        Department: '',
                        Photo: '',
                        AreaCode: '',
                        MobileNumber: '',
                        Phone: ''
                    };

                    $scope.LoadDefaults = function () {
                        var fullYear = $scope.DaySessionYear = $scope.StatisticsYear = new Date().getFullYear();
                        var fullMonth = new Date().getMonth() + 1;

                        $scope.CountYear = fullYear;
                        $scope.CountMonth = fullMonth;

                        $scope.StatisticsYear = fullYear;

                        $scope.DaySessionYear = fullYear;
                        $scope.DaySessionMonth = fullMonth;

                        $scope.TimeSessionYear = fullYear;
                        $scope.TimeSessionMonth = fullMonth;

                        $scope.MonthSessionYear = fullYear;
                        $scope.MonthSessionMonth = fullMonth;
                        $scope.MonthSessionJob = 0;

                        $scope.Sessions = [];
                        $scope.UpComingSessions = [];
                        $scope.ActiveJobs = [];
                        $scope.MyTasks = [];
                        $scope.LoadDashboardItems();
                    };

                    $scope.LoadDashboardItems = function () {
                        GetJobsList();
                        GetMyTasks();
                        $scope.GetSessionsByStatus();
                        $scope.GetSessionsByDay();
                        $scope.GetSessionsByTime();
                        $scope.GetSessionsByMonthly();
                        $scope.GetJobStatistics();
                        $scope.LoadRestItems();
                        $scope.GetActiveJobs();
                    };

                    function GetJobsList() {
                        $scope.AllJobs = [];
                        $ajx.GetJobInfo(function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.AllJobs = res.data.Results;
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    }

                    function GetMyTasks() {
                        $scope.MyTasks = [];
                        $ajx.GetMyTasks(function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.MyTasks = res.data.Results;
                            }
                        }, function (res) {
                            console.log(res);
                        });
                    }

                    $scope.GetActiveJobs = function () {
                        $scope.ActiveJobs = [];
                        $support.start();
                        $ajx.GetJobShortHeaders(function (res) {
                            if ($support.IsSuccess(res)) {
                                $scope.ActiveJobs = res.data.Results;
                                $support.ApplyLocalDate($scope.ActiveJobs, ['DateOn']);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.GetSessionsByStatus = function () {
                        var data = {
                            Year: $scope.CountYear,
                            Month: $scope.CountMonth
                        };
                        $support.start();
                        $ajx.GetSessionsByStatus(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                loadSessionsByStatus(res.data.Results);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };
                    function loadSessionsByStatus(results) {
                        $support.Hide('intstatus');
                        $support.Hide('intstatusmsg');
                        if (results.TotalCount === 0) {
                            $support.Show('intstatusmsg');
                            return;
                        }

                        var items = [
                            ['Completed', results.Completed],
                            ['Not Started', results.Scheduled],
                            ['Cancelled', results.Cancelled],
                            ['Expired', results.Expired],
                            ['No Show', results.NoShow]
                        ];

                        var _title = "Total " + results.TotalCount + " Interviews Scheduled for - " + $scope.CountYear;
                        if ($scope.CountMonth > 0) {
                            _title = "Total " + results.TotalCount
                                + " Interviews Scheduled for - " + longMonths[$scope.CountMonth] + ' ' + $scope.CountYear;
                        }
                        loadInterviewStatus(items, _title);
                        $support.Show('intstatus');
                    }

                    $scope.GetSessionsByDay = function () {
                        var data = {
                            Year: $scope.DaySessionYear,
                            Month: $scope.DaySessionMonth
                        };
                        $support.start();
                        $ajx.GetSessionsByDay(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                var results = res.data.Results;
                                $support.ApplyLocalDate(results, ['Date']);
                                results = extractByWeek(results);
                                loadSessionsByDay(results);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    function extractByWeek(items) {
                        var hours = {};
                        var weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        angular.forEach(items, function (item) {
                            var date = new Date(item.Date);

                            var _week = weeks[date.getDay()];
                            var cnt = 0;

                            if (hours[_week]) cnt = parseInt(hours[_week]);
                            cnt++;
                            hours[_week] = cnt;
                        });

                        return hours;
                    }

                    function loadSessionsByDay(results) {

                        $support.Hide('interviewday');
                        $support.Hide('interviewdaymsg');
                        if ($support.IsArrayEmpty(results)) {
                            $support.Show('interviewdaymsg');
                            return;
                        }

                        var items = [
                            ['Days', '', { role: 'style' }],
                            ['Monday', 0, 'color: #1b994b'],
                            ['Tuesday', 0, 'color: #348ea1'],
                            ['Wednesday', 0, 'color: #fd9827'],
                            ['Thursday', 0, 'color: #a1a036'],
                            ['Friday', 0, 'color: #1ebeca'],
                            ['Saturday', 0, 'color: #f04e63'],
                            ['Sunday', 0, 'color: #7b3294']
                        ];

                        angular.forEach(items, function (item) {
                            var tF = item[0];
                            if (results[tF]) item[1] = results[tF];
                        });

                        var _title = "Period - " + $scope.DaySessionYear;
                        if ($scope.DaySessionMonth > 0) {
                            if (longMonths[$scope.DaySessionMonth]) {
                                _title = "Period - " + longMonths[$scope.DaySessionMonth] + " " + $scope.DaySessionYear;
                            }
                        }
                        loadInterviewsByDay(items, _title);
                        $support.Show('interviewday');
                    }

                    $scope.GetSessionsByTime = function () {
                        var data = {
                            Year: $scope.TimeSessionYear,
                            Month: $scope.TimeSessionMonth
                        };
                        $support.start();
                        $ajx.GetSessionsByTime(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                var results = res.data.Results;
                                $support.ApplyLocalDate(results, ['Date']);
                                results = extractByHour(results);
                                loadSessionsByTime(results);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    function extractByHour(items) {
                        var hours = {};

                        angular.forEach(items, function (item) {
                            var date = new Date(item.Date);
                            var _hour = date.getHours();
                            var cnt = 0;
                            if (_hour >= 6 && _hour < 10) {
                                if (hours['06 AM - 10 AM']) cnt = parseInt(hours['06 AM - 10 AM']);
                                cnt++;
                                hours['06 AM - 10 AM'] = cnt;
                            } else if (_hour > 9 && _hour < 14) {
                                if (hours['10 AM - 02 PM']) cnt = parseInt(hours['10 AM - 02 PM']);
                                cnt++;
                                hours['10 AM - 02 PM'] = cnt;
                            } else if (_hour > 13 && _hour < 18) {
                                if (hours['02 PM - 06 PM']) cnt = parseInt(hours['02 PM - 06 PM']);
                                cnt++;
                                hours['02 PM - 06 PM'] = cnt;
                            } else if (_hour > 17 && _hour < 23) {
                                if (hours['06 PM - 10 PM']) cnt = parseInt(hours['06 PM - 10 PM']);
                                cnt++;
                                hours['06 PM - 10 PM'] = cnt;
                            }
                        });

                        return hours;
                    }

                    function loadSessionsByTime(results) {

                        $support.Hide('timechart');
                        $support.Hide('timechartmsg');
                        if ($support.IsArrayEmpty(results)) {
                            $support.Show('timechartmsg');
                            return;
                        }

                        var items = [
                            ['Time', 'Interview Taken'],
                            ['06 AM - 10 AM', 0],
                            ['10 AM - 02 PM', 0],
                            ['02 PM - 06 PM', 0],
                            ['06 PM - 10 PM', 0],
                            ['10 PM - 02 AM', 0],
                            ['02 AM - 06 AM', 0]
                        ];

                        angular.forEach(items, function (item) {
                            var tF = item[0];
                            if (results[tF]) item[1] = results[tF];
                        });

                        var _title = "Period - " + $scope.TimeSessionYear;
                        if ($scope.TimeSessionMonth > 0) {
                            _title = "Period - " + longMonths[$scope.TimeSessionMonth] + " " + $scope.TimeSessionYear;
                        }
                        loadInterviewsByTime(items, _title);
                        $support.Show('timechart');
                    }

                    $scope.GetSessionsByMonthly = function () {
                        var data = {
                            Year: $scope.MonthSessionYear,
                            Month: $scope.MonthSessionMonth,
                            JobId: $scope.MonthSessionJob
                        };

                        $support.start();
                        $ajx.GetSessionsByMonthly(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                var rsltDt = res.data.Results;
                                $support.ApplyLocalDate(rsltDt, ['Date']);
                                angular.forEach(rsltDt, function (item) {
                                    if (!$support.IsNull(item.Date)) {
                                        var dt = new Date(item.Date);
                                        item.Year = dt.getFullYear();
                                        item.Month = dt.getMonth() + 1;
                                        item.Day = dt.getDate();
                                    }
                                });
                                //console.log(results);
                                loadSessionsByMonthly(rsltDt);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.GetSessionsByMonthlyCond = function () {
                        if (parseInt($scope.MonthSessionMonth) > 0) {
                            var data = {
                                Year: $scope.MonthSessionYear,
                                Month: $scope.MonthSessionMonth,
                                JobId: $scope.MonthSessionJob
                            };

                            $support.start();
                            $ajx.GetSessionsByMonthly(data, function (res) {
                                if ($support.IsSuccess(res)) {

                                    var rsltDt = res.data.Results;
                                    $support.ApplyLocalDate(rsltDt, ['Date']);
                                    angular.forEach(rsltDt, function (item) {
                                        if (!$support.IsNull(item.Date)) {
                                            var dt = new Date(item.Date);
                                            item.Year = dt.getFullYear();
                                            item.Month = dt.getMonth() + 1;
                                            item.Day = dt.getDate();
                                        }
                                    });

                                    loadSessionsByMonthly(rsltDt);
                                }
                                else {
                                    // Show error on the UI
                                }
                                $support.stop();
                            }, function (err) {
                                $support.stop();
                            });
                        }
                    };
                    function loadSessionsByMonthly(results) {

                        $support.Hide('int_schedule_taken');
                        $support.Hide('int_schedule_take_msg');
                        if ($support.IsArrayEmpty(results)) {
                            $support.Show('int_schedule_take_msg');
                            return;
                        }

                        var items = [];
                        angular.forEach(results, function (item) {
                            var _itm = [
                                new Date(item.Year, (item.Month - 1), item.Day),
                                //new Date(item.Date),
                                item.Scheduled,
                                item.Scheduled.toString(),
                                item.Completed,
                                item.Completed.toString()];
                            items.push(_itm);
                        });

                        var _title = "Period - " + $scope.MonthSessionYear;
                        if ($scope.MonthSessionMonth > 0) {
                            _title = "Period - " + longMonths[$scope.MonthSessionMonth] + " " + $scope.MonthSessionYear;
                        }
                        loadInterviewsByMonth(items, _title);

                        var completeCount = $support.GetItemsCount(items, 3, 0);
                        var scheduledCount = $support.GetItemsCount(items, 1, 0);

                        if (completeCount === items.length && scheduledCount === items.length) {
                            $support.Hide('int_schedule_taken');
                            $support.Show('int_schedule_take_msg');
                        } else {
                            $support.Show('int_schedule_taken');
                            $support.Hide('int_schedule_take_msg');
                        }
                    }

                    $scope.GetJobStatistics = function () {
                        var data = {
                            Year: $scope.StatisticsYear
                        };
                        $support.start();
                        $ajx.GetJobStatistics(data, function (res) {
                            if ($support.IsSuccess(res)) {
                                loadJobStatistics(res.data.Results);
                            }
                            else {
                                // Show error on the UI
                            }
                            $support.stop();
                        }, function (err) {
                            $support.stop();
                        });
                    };
                    function loadJobStatistics(results) {
                        $support.Hide('jobstatistics');
                        $support.Hide('jobstatisticsmsg');
                        if ((results.ActiveCount + results.CloseCount + results.SavedCount) === 0) {
                            $support.Show('jobstatisticsmsg');
                            return;
                        }
                        var items = [
                            ['Jobs', '', { role: 'style' }],
                            ['Active Jobs', results.ActiveCount, 'color: #1b994b'],
                            ['Closed Jobs', results.CloseCount, 'color: #348ea1'],
                            ['Saved Jobs', results.SavedCount, 'color: #fd9827']
                        ];
                        var _title = "Jobs Status for " + $scope.StatisticsYear;
                        loadJobStatics(items, _title);
                        $support.Show('jobstatistics');
                    }

                    $scope.LoadRestItems = function () {

                        setTimeout(function () {
                            $support.start();
                            $ajx.GetContactInfo(function (res) {
                                if ($support.IsSuccess(res)) {
                                    $scope.ShortContact = res.data.Results;
                                    $scope.ShortContact.Phone =
                                        $support.TrimString($support.NullToEmpty($scope.ShortContact.AreaCode) + ' ' +
                                            $support.NullToEmpty($scope.ShortContact.MobileNumber));

                                    $user.Set('Photo', $scope.ShortContact.Photo);
                                    $scope.AccountPhoto = $user.Get('Photo');
                                    $root.$broadcast('PhotoChanged', {});
                                }
                                else {
                                    // Show error on the UI
                                }
                                $support.stop();
                            }, function (err) {
                                $support.stop();
                            });
                        }, 100);

                        setTimeout(function () {
                            $support.start();
                            $ajx.GetAllsessions(function (res) {
                                if ($support.IsSuccess(res)) {
                                    var items = res.data.Results;
                                    $scope.Sessions = items;
                                    $support.ApplyLocalDate($scope.Sessions, ['InterviewDate']);
                                    angular.forEach($scope.Sessions, function (item) {
                                        item.JobTag = 'JB' + $support.AddLeadingZeros(item.JobId, 6);
                                    });
                                    $scope.AllSessions = $scope.Sessions;
                                }
                                else {
                                    // Show error on the UI
                                }
                                $support.stop();
                            }, function (err) {
                                $support.stop();
                            });
                        }, 100);
                    };

                    $scope.RefreshSessions = function () {
                        $support.start();
                        $ajx.GetSessionsCount(function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.LoadDefaults();
                            }
                        }, function (err) {
                            $support.stop();
                        });
                    };

                    $scope.ShowContact = function (keyId) {
                        var selectedSession = $support.GetItem($scope.Sessions, 'SessionId', keyId);
                        $root.$broadcast('ShowContact', { Selected: selectedSession });
                    };

                    $scope.HideContact = function () {
                        $root.$broadcast('HideContact', null);
                    };

                    $scope.ShowNewScheduledSession = function () {
                        $root.$broadcast('NewSession', { JobId: 0, CanId: 0 });
                    };

                    $scope.$on('RefreshDSession', function (evt, data) {
                        $scope.RefreshSessions();
                    });

                    $scope.ShowCancelSession = function (keyId) {
                        $root.$broadcast('ShowCancelSession', { KeyId: keyId });
                    };

                    $scope.ShowCancelledSession = function (keyId) {
                        $root.$broadcast('ShowCancelledSession', { KeyId: keyId });
                    };

                    $scope.LoadForPhotoEdit = function () {
                        $root.$broadcast('OpenPhotoForEdit', { Contact: true, Photo: $user.Get('Photo') });
                    };

                    $root.$on('PhotoChanged', function (evt, data) {
                        $scope.AccountPhoto = $user.Get('Photo');
                    });

                    $scope.dsSessionFilter = "All";

                    $scope.OnSessionFilter = function () {
                        if ($scope.dsSessionFilter === "All") {
                            $scope.Sessions = $scope.AllSessions;
                        } else {
                            var filterTag = $scope.dsSessionFilter;
                            if ($scope.dsSessionFilter === "In-Progress") {
                                filterTag = 'Started';
                            }
                            else if ($scope.dsSessionFilter === "Scheduled") {
                                filterTag = 'Confirmed';
                            }
                            $scope.Sessions = $support.GetItems($scope.AllSessions, 'Status', filterTag);
                        }
                    };

                }
            ]
        );
    });