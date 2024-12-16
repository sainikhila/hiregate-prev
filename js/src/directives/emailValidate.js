var app = angular.module('EmailValidate', []);

app.directive('emailValidate', ['$http', function ($http) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elm, attrs, ngModel) {

            elm.on('blur', function () {
                var url = window.__env.apiUrl; //elm.attr('service-url');
                var keyId = elm.attr('key-id');
                var servieUrl = url + '/api/common/IsValidEmail';

                var errElm = angular.element(document.querySelector('#emailExist'))[0];
                if (errElm) {
                    errElm.style["display"] = 'none';
                }

                var invalidElm = angular.element(document.querySelector('#emailInvalid'))[0];
                if (invalidElm) {
                    invalidElm.style["display"] = 'none';
                }

                if (ngModel.$error.email) {
                    if (invalidElm) {
                        invalidElm.style["display"] = 'block';
                    }                    
                    ngModel.$setValidity(ngModel.name, false);
                }

                if (!ngModel.$error.email && !ngModel.$error.required) {
                    var data = { Text: ngModel.$viewValue, Id: keyId };

                    $http.post(servieUrl, data).then(function (resp) {
                        ngModel.$setValidity(ngModel.id, true);

                        if (resp.data && errElm) {
                            errElm.style["display"] = 'block';
                            ngModel.$setValidity(ngModel.name, false);
                        }
                    }), function (resp) {
                        console.log(resp);
                    };

                }
            });

            elm.on('focus', function () {
                var errElm = angular.element(document.querySelector('#emailExist'))[0];
                if (errElm) {
                    errElm.style["display"] = 'none';
                }

                var invalidElm = angular.element(document.querySelector('#emailInvalid'))[0];
                if (invalidElm) {
                    invalidElm.style["display"] = 'none';
                }
            });

        }
    };
}]);