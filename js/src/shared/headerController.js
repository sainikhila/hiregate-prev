
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/menuController' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/photoController' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/menuItems' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("headerController",
        ['$scope', '$rootScope', '$route', '$location', 'sharedService', 'sharedMethod', 'user',
            function ($scope, $rootScope, $route, $location, $ajx, $support, $user) {

                $("#eventTrigger").removeAttr('onclick');
                $("#eventTrigger").removeAttr('class');
                $scope.Type = $user.Get('Type');
                $scope.LoggedInFullName = $user.Get('FullName');
                $scope.CompanyName = $user.Get('Company');
                $scope.HeaderStateId = $support.IsNull($scope.CompanyName) ? 0 : 1;

                $scope.IsAddPhoto = function (_photo) {
                    if (_photo) {
                        return _photo.indexOf('/photo_add') > -1;
                    }
                    return true;
                };

                $scope.OpenCompanySite = function () {
                    var webSite = $user.Get('WebSite');
                    if (!$support.IsNull(webSite)) {
                        $("#companyUrl").attr('href', webSite);
                    } else {
                        $("#companyUrl").attr('href', 'javascript:void(0);');
                    }
                };

                $rootScope.$on("SessionExpired", function (evt, data) {
                    $support.stop();
                    $support.TriggerDialog('popNotifySessionTimeOut', true);
                });

                $rootScope.$on("MultipleSession", function (evt, data) {
                    $support.stop();
                    $support.TriggerDialog('popNotifyMultipleSignOn', true);
                });
				
				$scope.SignOutHeaderClicked = function () {
                    $ajx.LogoutFromServer(logoutSuccess, logoutSuccess);
                };

                var logoutSuccess = function logoutSuccess(resp) {
                    sessionStorage.clear();
                    $user.Init();
					$support.Hide('popNotifySessionTimeOut');
					$support.Hide('popNotifyMultipleSignOn');
                    $rootScope.NavigateToRoute('/');
                };
            }]);
});
