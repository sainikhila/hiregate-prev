var app = angular.module('NgHide', []);

app.directive('ngHide', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            scope.$apply(function () {
                var element = angular.element(document.querySelector('#' + attrs.ngHide));
                if (element) {
                    element[0].style['display'] = 'none';
                }
            });
        });
    };
});