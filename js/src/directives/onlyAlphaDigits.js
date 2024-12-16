var app = angular.module('OnlyAlphaDigits', []);

app.directive('onlyAlphaDigits', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {

            if (modelCtrl != null) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (inputValue == undefined) return '';
                    var transformedInput = inputValue.replace(/[^a-z0-9] /gi, '');
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