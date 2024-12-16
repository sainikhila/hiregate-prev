var app = angular.module('OnlyAlpha', []);

app.directive('onlyAlpha', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {

            if (modelCtrl != null) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (inputValue == undefined) return '';
                    var transformedInput = inputValue.replace(/[^a-zA-z ]/gi, '');
                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
            else {
                return null;
            }
        }
    };
});