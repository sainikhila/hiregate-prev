var appFile = angular.module('FileChange', []);

appFile.directive('fileChange', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elem, iAttrs, ngModel) {

            var elmId = elem.attr('id');
            var formName = elem.attr('file-form-name');
            var displayStyle = elem.attr('file-diplay-style') || 'inline-block';
            var fileFormats = elem.attr('file-formats') || 'PDF,DOC,DOCX';
            var fileSelf = elem.attr('file-error-self') || false;

            changeValue('');
            ChangeToError('');
            //Hide(errElm);

            if (formName && elem[0].required) {
                scope[formName].$setValidity(elmId, false);
            }

            elem.on('change', function (e) {

                var errElm = angular.element(document.querySelector('#' + elem.attr('file-error-id')));
                var sucElm = angular.element(document.querySelector('#' + elem.attr('file-success-id')));
                var dummyElm = angular.element(document.querySelector('#dummyDisplay'));

                changeValue('');
                ChangeToError('');
                Hide(errElm);
                if (formName) {
                    scope[formName].$setValidity(elmId, false);
                }

                if (e.target.files.length > 0) {

                    var file = e.target.files[0];
                    var tfile = file.name;
                    var tError = 'Invalid file format';

                    if (IsValidFile(tfile)) {
                        tError = 'Max file size allowed: 300 Kb';
                        if (file.size < 307200) {
                            tError = '';
                            changeValue(file);
                            if (formName) {
                                scope[formName].$setValidity(elmId, true);
                            }
                        }
                    }

                    if (tError && tError.length > 0) {
                        errElm.html(tError);
                        Show(errElm);
                        if (dummyElm) Hide(dummyElm);
                        ChangeToError('#e90b0b');
                        scope.$apply();
                    }
                    else {
                        if (dummyElm) {
                            Show(dummyElm);
                            scope.$apply();
                        }
                    }
                }
            });

            function changeValue(val) {
                if (ngModel) {
                    ngModel.$setViewValue(val);
                    ngModel.$render();
                }
            }

            var IsValidFile = function IsValidFile(eVal) {
                if (eVal && eVal.length > 0) {
                    var extn = eVal.split(".").pop().toUpperCase();
                    var tValue = ',' + fileFormats.toUpperCase() + ',';
                    return tValue.indexOf(',' + extn + ',') > -1;
                    //return (extn === "PDF" || extn === "DOC" || extn === "DOCX");
                }
                return false;
            };

            function Show(e) {
                if (e && e.length > 0) {
                    e[0].style['display'] = displayStyle;
                }
            }

            function Hide(e) {
                if (e && e.length > 0) {
                    e[0].style['display'] = 'none';
                }
            }


            function ChangeToError(style) {
                if (elem && elem.length > 0 && fileSelf) {
                    elem.css('color', style);
                    elem.css('border', '');
                    elem.removeAttr('data-error');
                    if (style !== '') {
                        elem.css('border', '1px solid ' + style);
                        elem.attr('data-error','true');
                    } 
                }
            }
        }
    };
});