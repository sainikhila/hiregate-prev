
define(['faceitconfig' + window.__env.minUrl, 'angular-sanitize',
    , window.__env.baseUrl + 'controllers/shared/SharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl], function (app) {

        "use strict";

        app.controller("MessageController",
            ['$scope', '$rootScope', '$location', 'sharedService', 'sharedMethod', 'storageFactory',
            function ($scope, $rootScope, $location, sharedSrv, sharedMethod, sharedData) {

                $scope.Messages = [];
                $scope.MessagesBackup = [];
                $scope.MessageHeader = '';
                $scope.SelectedAll = false;
                $scope.EnableDeleted = true;
                $scope.FilterType = '';
                $scope.FilterTypeId = '-1';

                $scope.$on("LoadDefaults", function (evt, data) {
                    sharedData.clearValue('FindString');
                    $scope.LoadDefaults();
                });

                $scope.LoadDefaults = function () {
                    sharedMethod.start();
                    sharedSrv.GetAllFIMessages($scope.MessagesRetrievedSuccess, $scope.MessagesRetrievedFailed);
                };

                $scope.MessagesRetrievedSuccess = function (resp) {

                    $scope.MessageHeader = '';
                    $scope.Messages = resp;

                    if (parseInt(resp.status) == 200) {
                        $scope.Messages = resp.data.Results;

                        angular.forEach($scope.Messages, function (item) {
                            item.Checked = false;
                            item.MsgFrom = item.MsgFrom.split('<')[0];
                        });

                        var readCount = sharedMethod.GetItemsCount($scope.Messages, 'MsgRead', false);
                        var totCount = $scope.Messages.length;

                        $scope.MessageHeader = totCount + ' / ' + readCount + ' Unread';
                    }
                    else {
                        // Show error on the UI
                    }

                    $scope.MessagesBackup = $scope.Messages;

                    sharedMethod.Hide('nomsgcontent');
                    if ($scope.Messages.length == 0) {
                        sharedMethod.Show('nomsgcontent');
                    }

                    sharedMethod.stop();
                };

                $scope.MessagesRetrievedFailed = function (resp) {
                    sharedMethod.stop();
                };

                var lastOpened = 0;

                $scope.PreviewPanelVisible = function (msgId) {
                    var _item = 'Block' + msgId;
                    return sharedMethod.IsElmVisible(_item);
                };

                $scope.ShowOneBlock = function (msgId) {
                    var bShow = false;
                    angular.forEach($scope.Messages, function (item) {
                        var _item = 'Block' + item.MsgId;
                        sharedMethod.Hide(_item);
                        if (item.MsgId === msgId && lastOpened !== msgId) {
                            bShow = true;
                            sharedMethod.Show(_item);
                            lastOpened = msgId;
                            if (!item.MsgRead) {
                                item.MsgRead = true;
                                $scope.UpdateMessage(item);
                            }
                        }
                    });

                    if (!bShow) {
                        lastOpened = 0;
                    }
                };

                $scope.UpdateMessage = function (item) {
                    sharedMethod.start();
                    sharedSrv.UpdateFIMessage(item, $scope.UpdateMessageSuccess, $scope.MessagesRetrievedFailed);
                };

                $scope.UpdateMessageSuccess = function (resp) {
                    sharedMethod.stop();
                    $rootScope.$broadcast('MessageUpdated', null);
                };

                $scope.AllSelectedChecked = function () {
                    angular.forEach($scope.Messages, function (item) {
                        item.Checked = $scope.SelectedAll;
                    });
                    $scope.UnSelectChecked();
                };

                $scope.DeleteClicked = function () {
                    angular.forEach($scope.Messages, function (item) {
                        if (item.Checked) {
                            item.RecordStatus = 2;
                        }
                    });

                    var msgs = sharedMethod.GetItems($scope.MessagesBackup, 'Checked', true);

                    sharedMethod.start();
                    sharedSrv.DeleteFIMessages(msgs, $scope.LoadDefaults, $scope.MessagesRetrievedFailed);
                };

                $scope.UnSelectChecked = function () {
                    var vChecked = sharedMethod.GetItemsCount($scope.Messages, 'Checked', false);
                    $scope.SelectedAll = vChecked === 0;

                    vChecked = sharedMethod.GetItemsCount($scope.Messages, 'Checked', true);
                    $scope.EnableDeleted = vChecked == 0;
                };

                $scope.FilterChanged = function () {
                    $scope.FilterType = '';
                    $scope.SelectedAll = false;
                    if (parseInt($scope.FilterTypeId) === -1) {
                        $scope.Messages = $scope.MessagesBackup;
                    }
                    else if (parseInt($scope.FilterTypeId) === 0) {
                        $scope.Messages = sharedMethod.GetItems($scope.MessagesBackup, 'MsgRead', false);
                    }
                    else if (parseInt($scope.FilterTypeId) === 1) {
                        $scope.Messages = sharedMethod.GetItems($scope.MessagesBackup, 'MsgRead', true);
                    }
                };

            }]);

    });