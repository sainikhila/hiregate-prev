var appFile = angular.module('FilePhotoChange', []);

appFile.directive('filePhotoChange', function () {
    return {
        restrict: 'A',
        scope: { callbackFn: '&callbackFn' },
        link: function (scope, elem, iAttrs, ngModel) {

            elem.on('click', function (e) {
                this.value = null;
            });
            elem.on('change', function (e) {
                scope.callbackFn({ $event: e.target });
            });
        }
    };
});