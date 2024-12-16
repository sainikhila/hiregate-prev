
var app = angular.module('MenuItems', []);

app.directive('menuItems', ['$rootScope', '$routeParams', function ($rootScope, $routeParams) {
    return {
        restrict: 'E',
        scope: {
            "tabItemType": '='
        },
        template: '<ul><li ng-repeat="itm in SelectedTabItem">' +
            '<a id="{{itm.Id}}" class="{{itm.cClass}}" ng-click="LoadMenuItems(itm.urHash)" href="javascript:void(0);">{{itm.Text}}</a></li></ul>',
        link: function (scope, elm, attrs) {

            var TabItems = [];

            LoadItems();

            function getMenuItems() {
                TabItems = [];

                var navCorporate = [
                    { Id: 'db', Text: 'Dashboard', urHash: 'db' },
                    { Id: 'cn', Text: 'Candidate', urHash: 'cn' },
                    { Id: 'in', Text: 'Interviewer', urHash: 'in' },
                    { Id: 'jb', Text: 'Jobs', urHash: 'jb' },
                    { Id: 'cs', Text: 'Sessions', urHash: 'cs' },
                    { Id: 'is', Text: 'Interview Schedule', urHash: 'is' },
                    { Id: 'psl', Text: 'Pre Test', urHash: 'psl' }
                ];

                TabItems.push(navCorporate);
            }

            function setMenuItem() {
                var _params = $routeParams;

                var urHash = _params.section;

                if (urHash.startsWith('/')) {
                    urHash = urHash.substring(1, urHash.length);
                }

                if (urHash.indexOf('/') > 0) {
                    urHash = urHash.substring(0, urHash.indexOf('/'));
                }

                if (urHash.length > 5) {
                    urHash = urHash.substring(urHash, 5);
                }

                switch (urHash) {
                    case "cnp": urHash = 'cn'; break;
                    case "jbc":
                    case "jbd":
                    case "jbe": urHash = 'jb'; break;
                    case "ps": urHash = 'psl'; break;
                }

                for (var indx = 0; indx < scope.SelectedTabItem.length; indx++) {
                    var item = scope.SelectedTabItem[indx];

                    if (item.urHash === urHash) {
                        scope.SelectedTabItem[indx].cClass = 'current';

                        scope.SelectedTabItem[indx].href = 'javascript:void(0)';
                        if (window.location.hash === 'cip') {
                            scope.SelectedTabItem[indx].href = item.urHash;
                        }
                    }
                    else {
                        scope.SelectedTabItem[indx].href = item.urHash;
                        scope.SelectedTabItem[indx].cClass = '';
                    }
                }
            }

            function LoadItems() {
                getMenuItems();
                scope.SelectedTabItem = TabItems[0];
                setMenuItem();
            }

            scope.LoadMenuItems = function (eItem) {
                $rootScope.NavigateToRoute(eItem);
            };

        }
    };
}]);
