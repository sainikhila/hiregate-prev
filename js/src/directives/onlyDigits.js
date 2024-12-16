var app = angular.module('OnlyDigits', []);

app.directive('onlyDigits', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {

            if (modelCtrl !== null) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (inputValue === undefined) return '';
                    var transformedInput = inputValue.replace(/[^0-9]/g, '');
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