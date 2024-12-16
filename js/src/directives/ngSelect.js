var app = angular.module('NgSelect', []);

app.directive('ngSelect', function () {
    return function (scope, element, attrs) {

        element.bind("change blur focus keyup", function (e) {
            changeColor();
        });

        function changeColor() {
            element.css('color', '');
            if (element[0].selectedIndex < 1) {
                element.css('color', '#c1c1c1');
            }
        }

        scope.$watch(function () {
            changeColor();
        });

        changeColor();
    };
});