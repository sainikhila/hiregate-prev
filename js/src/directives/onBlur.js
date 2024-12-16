var app = angular.module('OnBlur', []);

app.directive('onBlur', function () {
    return {
        restrict: 'A',
        scope: {
            'onBlur': '&'
        },
        link: function (scope, elm, attrs) {
            elm.bind('blur change', function () {
                if (scope.onBlur) scope.onBlur();
            });
        }
    };
});
