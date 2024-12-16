var ratingapp = angular.module('RatingPanel', []);

ratingapp.directive('ratingPanel', function () {
    return {
        restrict: 'E',
        scope: {
            elementid: '@',
            elementcss: '@',
            ngModel: '='
        },
        template:
            '<div class="{{elementcss}}">' +
                '<input type="radio" name="ratingInt{{elementid}}" value="1" ng-click="RatingSelected(1)"><i></i>' +
                '<input type="radio" name="ratingInt{{elementid}}" value="2" ng-click="RatingSelected(2)"><i></i>' +
                '<input type="radio" name="ratingInt{{elementid}}" value="3" ng-click="RatingSelected(3)"><i></i>' +
                '<input type="radio" name="ratingInt{{elementid}}" value="4" ng-click="RatingSelected(4)"><i></i>' +
                '<input type="radio" name="ratingInt{{elementid}}" value="5" ng-click="RatingSelected(5)"><i></i>' +
            '</div>',
        link: function (scope, element, attr) {
            scope.RatingSelected = function (rtid) {
                scope.ngModel = rtid;
            };
        }
    }
});