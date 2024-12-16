var app = angular.module('CINValidate', []);

app.directive('gstValidate', ['$http', function ($http) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elm, attrs, ngModel) {

            elm.on('blur', function () {
                var url = window.__env.apiUrl;

                var servieUrl = url + '/api/common/IsValidGST';

                var errElm = angular.element(document.querySelector('#cpgstExist'))[0];
                if (errElm) {
                    errElm.style["display"] = 'none';
                }

                var data = { Text: ngModel.$viewValue };

                $http.post(servieUrl, data).then(function (resp) {

                    ngModel.$setValidity(ngModel.id, true);
                    if (resp.data && errElm) {
                        errElm.style["display"] = 'block';
                        ngModel.$setValidity(ngModel.name, false);
                    }
                }), function (resp) {
                    console.log(resp);
                };

            });
        }
    };
}]);