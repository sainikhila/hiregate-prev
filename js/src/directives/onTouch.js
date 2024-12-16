var app = angular.module('OnTouch', []);

app.directive('onTouch', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind('click blur change', function () {
                var lblElemId = elm[0].name + 'Label';
                var lblElem = document.getElementById(lblElemId);
                if (lblElem) {

                    var rollbackcss = 'labelheading';

                    var rollCssAtr = elm[0].attributes['roll-back-css'];

                    if (rollCssAtr) {
                        rollbackcss = rollCssAtr.value;
                    }

                    lblElem.className = rollbackcss;
                }
            });

            //elm.bind('blur', function () {
            //    var lblElemId = elm[0].name + 'Label';
            //    var lblElem = document.getElementById(lblElemId);
            //    if (lblElem) {

            //        var rollbackcss = 'labelheading';

            //        var rollCssAtr = elm[0].attributes['roll-back-css'];

            //        if (rollCssAtr) {
            //            rollbackcss = rollCssAtr.value;
            //        }

            //        lblElem.className = rollbackcss;
            //    }
            //});

            elm.bind('focus', function () {
                //elm[0].style['border'] = '1px solid #ffff00';
            });
        }
    };
});

app.directive('onTouchReset', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind('click blur change', function () {

                var resetId = elm[0].attributes['on-touch-reset'];
                scope[resetId.value] = '';
                scope.$apply();
            });

        }
    };
});