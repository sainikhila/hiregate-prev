var appDir = angular.module('BoundModel', []);

appDir.directive('boundModel', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elm, attrs, model) {
            elm.bind('change', function (evt) {
                model.$setViewValue(elm.val());
                model.$render();
            });
        }
    };
});