"use strict";

define(['faceitConsApp' + window.__env.minUrl], function (app) {

    app.service('sharedMethod', ['$filter', function ($filter) {


        this.IsSuccess = function (res) {
            return parseInt(res.status) === 200 && parseInt(res.data.status) === 200;
        };

        this.IsFailed = function (res) {
            return parseInt(res.status) === 200 && parseInt(res.data.status) === 400;
        };

        this.ApplyLocalDate = function (input, items, formatType) {
            if (!IsArrEmpty(input)) {
                if (IsArr(input)) {
                    angular.forEach(input, function (vals) {
                        angular.forEach(items, function (item) {
                            if (!IsNullValue(vals[item])) {
                                vals[item] = moment.utc(vals[item]).toDate();
                                if (!IsNullValue(formatType)) {
                                    vals[item] = moment(vals[item]).format(formatType);
                                }
                            }
                        });
                    });
                } else {
                    angular.forEach(items, function (item) {
                        if (!IsNullValue(input[item])) {
                            input[item] = moment.utc(input[item]).toDate();
                            if (!IsNullValue(formatType)) {
                                input[item] = moment(input[item]).format(formatType);
                            }
                        }
                    });
                }
            } else {
                angular.forEach(input, function (vals) {
                    angular.forEach(items, function (item) {
                        if (!IsNullValue(vals[item])) {
                            vals[item] = moment.utc(vals[item]).toDate();
                            if (!IsNullValue(formatType)) {
                                vals[item] = moment(vals[item]).format(formatType);
                            }
                        }
                    });
                });
            }
        };

        function IsArrEmpty(eVal) {
            if (eVal === undefined || eVal === '' || eVal === null || Object.keys(eVal).length === 0 || eVal instanceof Array) {
                return true;
            }
            return false;
        }

        function IsArr(eVal) {
            if (eVal instanceof Array) {
                return true;
            }
            return false;
        }

        this.getLocalTimeZone = function (dt) {
            var stillUtc = moment.utc(dt).toDate();
            return moment(stillUtc).local().format('YYYY-MM-DDTHH:mm:ss');
        };

        this.getUTCTimeZone = function (dt) {
            var dtStr = new Date(dt).toUTCString();
            //console.log('dtStr:' + dtStr);
            //console.log('moment:' + moment.utc(dtStr).format());
            return moment.utc(dtStr).format();
        };

        this.getUTCTimeZoneOnSplit = function (dt) {
            var dtParts = dt.split(' ');
            var dtPart = dtParts[0].split('-');
            var dtDate = dtPart[0] + '-' + getMonthNumber(dtPart[1]) + '-' + dtPart[2];
            var dtStr = new Date(dtDate + ' ' + dtParts[1]);
            return moment.utc(dtStr).format();
        };

        function getMonthNumber(val) {
            val = val.toUpperCase();
            var rtnVal = 0;
            if (val.startsWith('JAN')) {
                rtnVal = 1;
            } else if (val.startsWith('FEB')) {
                rtnVal = 2;
            } else if (val.startsWith('MAR')) {
                rtnVal = 3;
            } else if (val.startsWith('APR')) {
                rtnVal = 4;
            } else if (val.startsWith('MAY')) {
                rtnVal = 5;
            } else if (val.startsWith('JUN')) {
                rtnVal = 6;
            } else if (val.startsWith('JUL')) {
                rtnVal = 7;
            } else if (val.startsWith('AUG')) {
                rtnVal = 8;
            } else if (val.startsWith('SEP')) {
                rtnVal = 9;
            } else if (val.startsWith('OCT')) {
                rtnVal = 10;
            } else if (val.startsWith('NOV')) {
                rtnVal = 11;
            } else if (val.startsWith('DEC')) {
                rtnVal = 12;
            }
            if (rtnVal < 10) rtnVal = '0' + rtnVal;
            return rtnVal;
        }

        this.getUTCTimeZone2 = function (dt) {
            var date = new Date();
            var tTime = $filter('date')(date, 'HH:mm:ss.ms');
            var dtStr = new Date(dt + 'T' + tTime).toUTCString();
            return moment.utc(dtStr).format();
        };

        this.EncodeDetails = function (obj) {
            var result = [];
            for (var key in obj) {
                result.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return result.join('&');
        };

        this.ToInteger = function (obj) {
            return obj ? 1 : 0;
        };

        this.ResultCodeStatus = function (code) {
            var msg = '';

            switch (code) {
                case 1: msg = "Unable to register the email."; break;
                case 2: msg = "Email already registered"; break;
                case 3: msg = "Invalid Credentials. Please retry"; break;
                case 4: msg = "Email is not registered"; break;
                case 5: msg = "Please confirm your email."; break;
                case 6: msg = "Invalid OLD password"; break;
                case 7: msg = "Registration approval is pending"; break;
                case 8: msg = "This account was deleted"; break;
                case 9: msg = "This account was rejected"; break;
                case 10: msg = "Provide the valid credentials"; break;
                case 400: msg = "System is down. Please try later."; break;
                default: msg = "500 (Internal Server Error)."; break;
            }

            return msg;
        };

        this.GetRandomNumber = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        this.IsValidEmail = function (val) {
            var re = /([A-Z0-9a-z_-][^@])+?@[^$#<>?]+?\.[\w]{2,4}/.test(val);
            if (!re) {
                return false;
            }
            return true;
        };

        this.IsValidExperience = function (sy, ey, n) {
            var syr = parseInt(sy), eyr = parseInt(ey), tn = parseInt(n);
            return (eyr - syr) >= tn;
        };

        this.broadCastPhoto = function ($root) {
            var evtItems = ['PhotoChanged', 'ProfilePhotoChanged', 'ReloadProfileActivity'];
            angular.forEach(evtItems, function (item) {
                $root.$broadcast(item, {});
            });
        };

        this.AddVideoSrc = function (elm, src) {
            var video = document.getElementById(elm);
            if (video) {
                video.src = src;
            }
        };

        this.broadCastSession = function ($root) {
            var evtItems = ['ReloadSessions', 'ReloadRatings'];
            angular.forEach(evtItems, function (item) {
                $root.$broadcast(item, {});
            });
        };

        this.broadEmitSession = function ($root) {
            var evtItems = ['ReloadSessions', 'ReloadRatings'];
            angular.forEach(evtItems, function (item) {
                $root.$emit(item, {});
            });
        };

        this.refreshImg = function (imgId) {
            var imgElm = angular.element(document.querySelector());
            if (imgElm && imgElm.length > 0) {
                $('#' + imgId).attr('src', imgElm[0].attr("src"));
            }
        };

        this.resetForm = function (scope, name) {
            var form = scope.form[name];
            scope['CancelSubmit'] = false;
            form['CancelSubmit'] = false;
            angular.forEach(form, function (elem) {
                if (elem !== undefined && elem.$modelValue !== undefined) {
                    elem.$viewValue = null;
                    elem.$setViewValue(null);
                    elem.$commitViewValue();
                    elem.$render();
                }
            });
        };

        this.setModalValue = function (scope, frm, name, val) {
            var model = scope.form[frm][name];
            if (model) {
                model.$setViewValue(val);
                model.$render();
            }
        };

        this.getModalValue = function (scope, frm, name) {
            return scope.form[frm][name].$modelValue;
        };

        this.Get24TimeValue = function (timeF) {
            return $filter('date')(timeF, 'H');
        };

        this.GetDateValue = function (timeF, format) {
            return $filter('date')(timeF, format);
        };

        this.GetDateValueFormat = function (format) {
            var date = new Date();
            return $filter('date')(date, format);
        };

        this.GetTimeValue = function (timeF) {
            if (timeF > 11) {
                timeF = timeF - 12;
                if (timeF > 0) {
                    timeF = timeF + ' PM';
                }
                else {
                    timeF = '12 Noon';
                }
            }
            else {
                timeF = timeF + ' AM';
            }
            return timeF;
        };

        this.GetTimeValue2 = function (timeF) {
            return GetTimeValue(timeF, timeF + 1);
        };

        this.IsValidURL = function (url) {
            var expression = /^(http(s?):\/\/)?(www\.)+[a-zA-Z0-9\.\-\_]+(\.[a-zA-Z]{2,3})+(\/[a-zA-Z0-9\_\-\s\.\/\?\%\#\&\=]*)?$/gi;
            var regex = new RegExp(expression);
            var t = url;
            if (!t.match(regex)) {
                return false;
            }

            return true;
        };

        this.BaseURL = function () {
            return '/FaceItWeb';
        };

        this.AddLeadingZeros = function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            if (num.length > len) return num;
            num = '' + num;
            while (num.length < len) {
                num = '0' + num;
            }
            return num;
        };

        this.RemoveDuplicates = function (collection, keyname) {
            var output = [],
                keys = [];

            angular.forEach(collection, function (item) {
                var key = item[keyname];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };

        this.RemoveDuplicatesArray = function (collection) {
            var output = [];

            angular.forEach(collection, function (item) {
                if (output.indexOf(item) === -1) {
                    output.push(item);
                }
            });

            return output;
        };

        this.WaitFor = function (bWait) {

            var bgWait = angular.element(document.querySelector('#loader_disable_bg'));
            bgWait[0].style["display"] = 'block';

            console.log("Waiting is " + bWait);
        };

        this.ToBool = function (tval) {
            if (!tval) return false;
            if (tval === 'false') {
                return false;
            }
            return true;
        };

        this.IntToBool = function (val) {
            return parseInt(val) === 1 ? true : false;
        };

        this.ResetAutoComplextInput = function (inputId) {

            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                bgWait[0].value = '';
            }
        };

        this.GetValue = function (inputId) {
            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                return bgWait.val();
            }
            return '';
        };

        this.GetText = function (inputId) {
            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                return bgWait.text();
            }
            return '';
        };

        this.SetText = function (inputId, val) {
            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                bgWait.text(val);
            }
        };

        this.GetInputValue = function (inputId) {
            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                return bgWait.val();
            }
            return '';
        };

        this.SetInputValue = function (inputId, val) {
            var bgWait = angular.element(document.querySelector('#' + inputId));
            if (bgWait) {
                return bgWait.val(val);
            }

        };

        this.GetInputValueByName = function (inputId) {
            var bgWait = angular.element(document.querySelector(inputId));
            return bgWait.val();
        };

        this.GetDOMInputValueByName = function (inputId) {
            var bgWait = document.getElementsByName(inputId);
            if (bgWait) {
                return bgWait[0].value;
            }
            return '';
        };


        this.IsItemExist = function (collection, keyname, matchvalue) {

            var curItem = false;

            for (var i = 0; i < collection.length; i++) {
                if (ToUpperCaseFun(collection[i][keyname]) === ToUpperCaseFun(matchvalue)) {
                    curItem = true;
                    break;
                }
            }

            return curItem;
        };

        this.SumOfValues = function (collection, keyname) {

            var curItem = 0.0;

            for (var i = 0; i < collection.length; i++) {
                curItem += parseFloat(collection[i][keyname]);
            }

            return curItem;
        };

        this.SumOfValuesByFilter = function (collection, keyname, matchvalue) {

            var curItem = 0.0;

            for (var i = 0; i < collection.length; i++) {
                if (parseFloat(collection[i][keyname]) === parseFloat(matchvalue)) {
                    curItem += parseFloat(collection[i][keyname]);
                }
            }

            return curItem;
        };

        this.GetItem = function (collection, keyname, matchvalue) {

            var curItem = undefined;

            for (var i = 0; i < collection.length; i++) {
                if (ToUpperCaseFun(collection[i][keyname]) === ToUpperCaseFun(matchvalue)) {
                    curItem = collection[i];
                    break;
                }
            }

            return curItem;
        };

        this.GetItems = function (collection, keyname, matchvalue) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (collection[i][keyname] === matchvalue) {
                    curItem.push(collection[i]);
                }
            }

            return curItem;
        };

        this.GetItemsByDate = function (collection, keyname, matchvalue, valType) {
            var chkDate = new Date(matchvalue);
            chkDate = moment(chkDate).format('YYYYMMDD');
            var curItem = [];
            for (var i = 0; i < collection.length; i++) {
                var cmpTo = new Date(collection[i][keyname]);
                cmpTo = moment(cmpTo).format('YYYYMMDD');
                if (valType === 0 && cmpTo === chkDate) {
                    curItem.push(collection[i]);
                } else if (valType === 1 && cmpTo > chkDate) {
                    curItem.push(collection[i]);
                } else if (valType === -1 && cmpTo < chkDate) {
                    curItem.push(collection[i]);
                } else if (valType === 2 && cmpTo >= chkDate) {
                    curItem.push(collection[i]);
                } else if (valType === -2 && cmpTo <= chkDate) {
                    curItem.push(collection[i]);
                }
            }
            return curItem;
        };

        this.GetContainedItems = function (collection, keyname, matchvalue) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (!IsNullValue(collection[i][keyname]) && collection[i][keyname].toUpperCase().indexOf(matchvalue.toUpperCase()) > -1) {
                    curItem.push(collection[i]);
                }
            }

            return curItem;
        };

        this.GetArrayValues = function (collection, keyname) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (!IsNullValue(collection[i][keyname])) {
                    curItem.push(collection[i][keyname]);
                }
            }

            return curItem;
        };

        this.GetMultipleMatchedItems = function (collection, keyname, matchvalue) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (!IsNullValue(collection[i][keyname])) {
                    var _value = ';' + collection[i][keyname].toUpperCase() + ';';
                    if (matchvalue.toUpperCase().indexOf(_value.toUpperCase()) > -1) {
                        curItem.push(collection[i]);
                    }
                }
            }

            return curItem;
        };

        this.ExcludeContainedItems = function (collection, keyname, matchvalue) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (collection[i][keyname].toUpperCase().indexOf(matchvalue.toUpperCase()) === -1) {
                    curItem.push(collection[i]);
                }
            }

            return curItem;
        };

        this.GetMultipleValueItems = function (collection, keyname, matchvalue, sptchar) {

            var curItem = [];

            var keywords = matchvalue.split(sptchar);

            for (var i = 0; i < collection.length; i++) {

                var kItem = collection[i][keyname].toUpperCase();

                for (var k = 0; k < keywords.length; k++) {
                    if (kItem.indexOf(keywords[k].toUpperCase()) > -1) {
                        curItem.push(collection[i]);
                        break;
                    }
                }
            }

            return curItem;
        };

        this.GetSingleColumnValuesDefault = function (collection, keyname, firstItem) {
            var curItem = [];
            if (firstItem) curItem.push(firstItem);
            for (var i = 0; i < collection.length; i++) {
                curItem.push(collection[i][keyname]);
            }
            return curItem;
        };

        this.GetKeyValuePairsDefault = function (collection, idKey, valKey, defItem) {
            var curItem = [];
            var _item = {};
            if (defItem) {
                _item = { Id: 0, Name: defItem };
                curItem.push(_item);
            }
            for (var i = 0; i < collection.length; i++) {
                _item = { Id: collection[i][idKey], Name: collection[i][valKey] };
                if (!IsNullValue(_item.Name)) curItem.push(_item);
            }
            return curItem;
        };

        this.GetSingleColumnValues = function (collection, keyname) {
            var curItem = [];
            for (var i = 0; i < collection.length; i++) {
                curItem.push(collection[i][keyname]);
            }
            return curItem;
        };

        this.SetSelectedItem = function (collection, keyname, matchvalue, selectedKey, selectedVal) {
            var curItem = collection;
            for (var i = 0; i < curItem.length; i++) {
                if (curItem[i][keyname] === matchvalue) {
                    curItem[i][selectedKey] = selectedVal;
                }
            }
            return curItem;
        };

        this.ClearSelectedItem = function (collection, keyname, keyval) {
            var curItem = collection;

            angular.forEach(curItem, function (key) {
                key[keyname] = keyval;
            });

            return curItem;
        };



        this.ToNullValue = function (_val) {
            if (IsNullValue(_val))
                return '';
            return _val;
        };

        this.ExcludeItem = function (collection, keyname, matchvalue) {

            var curItem = [];

            for (var i = 0; i < collection.length; i++) {
                if (collection[i][keyname] !== matchvalue) {
                    curItem.push(collection[i]);
                }
            }

            return curItem;
        };

        this.ExcludeItemsCunt = function (collection, keyname, matchvalue) {

            var itemCnt = 0;

            for (var i = 0; i < collection.length; i++) {
                if (collection[i][keyname] !== matchvalue) {
                    itemCnt++;
                }
            }

            return itemCnt;
        };

        this.RadioButtonStatus = function (elmId, val) {
            var ctrl = angular.element('#' + elmId);
            if (ctrl) {
                ctrl[0].checked = val;
            }
        };

        this.SetValue = function (elmId, vals) {
            var ctrl = angular.element('#' + elmId);
            if (ctrl) {
                ctrl[0].value = vals;
            }
        };

        this.SetDisabled = function (elmId, bBool) {
            var ctrl = this.getElement(elmId);
            if (ctrl) {
                ctrl.prop("disabled", bBool);
            }
        };

        this.start = function () {
            var ProgressBar = angular.element('#loader_disable_bg');
            if (ProgressBar) {
                ProgressBar[0].style['display'] = 'block';
            }
        };

        this.stop = function () {
            setTimeout(function () {
                var ProgressBar = angular.element('#loader_disable_bg');
                if (ProgressBar) {
                    ProgressBar[0].style['display'] = 'none';
                }
            }, 1000);
        };

        this.startcontainer2 = function (containerid, zeroPos) {
            var elm = this.getElement(containerid);
            if (elm) {
                this.stopcontainer(containerid);

                var zIndex = 0;
                var zsIndex = elm.css('zIndex');

                if (!isNaN(zsIndex)) {
                    zIndex = parseInt(zsIndex) + 1;
                }

                var pos = this.getPosition(elm[0]);

                if (zeroPos) {
                    pos.x = 0;
                    pos.y = 0;
                }

                var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 133 152" style="enable-background:new 0 0 133 152" xml:space="preserve"><path class="loaderFI_transparent_outline" d="M106.682,120.633 c2.087,7.738,6.6,15.273,11.069,21.835l-0.607-0.09c-10.761-1.979-20.194-6.567-28.343-11.782h-0.044 	c-19.054-1.189-32.76-2.213-50.034-3.963l-0.061-0.007c-11.374-1.23-20.468-9.004-22.295-19.231L5.579,60.465 C5.238,58.767,5.066,57,5.066,55.188C4.24,45.005,11.234,35.083,21.643,30.716L80.365,6.881C84.04,5.537,87.664,5,90.694,5 	c0.807,0,1.435,0.002,2.203,0.084h0.148c12.462,0,22.563,10.211,22.563,22.676v74.26c0,7.083-3.274,13.683-8.376,18.093 L106.682,120.633z" /> <path class="loaderFI_transparent_outline1" fill="transparent" d="M106.682,120.633 c2.087,7.738,6.6,15.273,11.069,21.835l-0.607-0.09c-10.761-1.979-20.194-6.567-28.343-11.782h-0.044 	c-19.054-1.189-32.76-2.213-50.034-3.963l-0.061-0.007c-11.374-1.23-20.468-9.004-22.295-19.231L5.579,60.465 C5.238,58.767,5.066,57,5.066,55.188C4.24,45.005,11.234,35.083,21.643,30.716L80.365,6.881C84.04,5.537,87.664,5,90.694,5 	c0.807,0,1.435,0.002,2.203,0.084h0.148c12.462,0,22.563,10.211,22.563,22.676v74.26c0,7.083-3.274,13.683-8.376,18.093 L106.682,120.633z" /> <polygon fill="#279599" points="98.03,40.387 47.716,40.387 47.716,111.115 64.92,111.115 64.92,83.449 91.087,83.449 91.087,70.232 64.92,70.232 64.92,54.378 98.03,54.378 "/></svg>';

                var d = document.createElement('div');
                d.id = containerid + '_progressbar';
                $(d).addClass('tc_bg_panel');
                $(d).append("<div class='loaderContainer' style='display:block;'> <div class='loaderBlock'>" + svg + "</div></div>");
                $(d).css('left', pos.x);
                $(d).css('top', pos.y);
                $(d).width(elm.width());
                $(d).height(elm.height());

                if (zIndex > 0) {
                    $(d).css('zIndex', zIndex);
                }

                elm.append(d);
            }
        };
        this.startcontainer = function (containerid) {
            this.startcontainer2(containerid, false);
        };

        this.stopcontainer = function (containerid) {
            var barId = containerid + '_progressbar';
            var elm = this.getElement(barId);
            if (elm) {
                elm.remove();
            }
        };

        this.removeElement = function (elmId) {
            var elm = this.getElement(elmId);
            if (elm) {
                elm.remove();
            }
        };

        this.appendElement = function (elmId, appendElm) {
            var elm = this.getElement(elmId);
            if (elm) {
                elm.append(appendElm);
            }
        };

        this.removeElements = function (elmId) {
            var elm = this.getElement(elmId);
            if (elm) {
                while (elm[0].firstChild) {
                    elm[0].removeChild(elm[0].firstChild);
                }
            }
        };

        this.getPosition = function (el) {

            var xPos = 0;
            var yPos = 0;
            var elm = el;

            while (el) {
                if (el.tagName === "BODY") {
                    //// deal with browser quirks with body/window/document and page scroll
                    //var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                    //var yScroll = el.scrollTop || document.documentElement.scrollTop;

                    //xPos += (el.offsetLeft - xScroll + el.clientLeft);
                    //yPos += (el.offsetTop - yScroll + el.clientTop);
                } else {
                    // for all other non-BODY elements
                    xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                    yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                }

                el = el.offsetParent;
            }

            //if (yPos === 0) {
            //    if (elm.id.startsWith('pop')) {
            //        yPos = 60;
            //    }
            //}

            return {
                x: xPos,
                y: yPos
            };
        };

        function onscrollelm() {
            console.log('scrolling');
        }

        this.ChangeStyle = function (el, name, style) {
            var element = this.getElement(el);
            if (element) {
                element.css(name, style);
            }
        };

        this.ShowOrHide = function (el, bhide) {
            var element = this.getElement(el);
            if (element) {
                element[0].style['display'] = bhide ? 'none' : 'block';
            }
        };

        this.IsElmVisible = function (el) {
            var element = this.getElement(el);
            if (element) {
                return (element[0].style['display'] === 'block');
            }
            return false;
        };

        this.ShowOrHideProgess = function (elResult, elProgress, bCompleted) {

            this.Hide(elResult);
            this.Hide(elProgress);

            var showID = bCompleted ? elResult : elProgress;

            this.Show(showID);
        };

        this.Show = function (el) {
            var element = this.getElement(el);
            if (element) {
                element[0].style['display'] = 'block';
            }
        };

        this.ShowInline = function (el) {
            var element = this.getElement(el);
            if (element) {
                element[0].style['display'] = 'inline-block';
            }
        };

        this.Hide = function (el) {
            var element = this.getElement(el);
            if (element) {
                element[0].style['display'] = 'none';
            }
        };

        this.HideAll = function (el) {
            var eItems = angular.element(document.querySelector('#' + el));
            if (eItems.length > 0) {
                angular.forEach(eItems, function (element) {
                    element.style['display'] = 'none';
                });
            }
        };

        this.getWidth = function (el) {
            var element = this.getElement(el);
            if (element) {
                return element[0].clientWidth;
            }
            return 0;
        };
        this.getHeight = function (el) {
            var element = this.getElement(el);
            if (element && element.length > 0) {
                return element[0].clientHeight;
            }
            return 0;
        };

        this.ChangeClass = function (el, css) {
            var element = this.getElement(el);

            if (element && element.length > 0) {
                element[0].className = css;
            }
        };

        this.getElement = function (elm) {
            var eItem = angular.element(document.querySelector('#' + elm));

            if (eItem.length > 0)
                return eItem;

            return undefined;
        };

        this.getElementById = function (elm) {
            var eItem = document.getElementById(elm);
            if (eItem)
                return eItem;
            return undefined;
        };

        this.getByElement = function (elm) {

            var eItem = angular.element(document.querySelector(elm));

            if (eItem.length > 0)
                return eItem;

            return undefined;

        };

        this.IsNull = function (eVal) {

            if (eVal === undefined || eVal === '' || eVal === null) {
                return true;
            }

            return false;
        };

        this.NullToEmpty = function (eVal) {

            if (eVal === undefined || eVal === '' || eVal === null) {
                return '';
            }

            return eVal;
        };

        this.IsArrayEmpty = function (eVal) {
            if (eVal === undefined || eVal === '' || eVal === null || Object.keys(eVal).length === 0) {
                return true;
            }
            return false;
        };

        this.IsValueEmptyInArray = function (eArr, eCol) {
            var rtn = false;
            for (var i = 0; i < eArr.length; i++) {
                if (IsNullValue(eArr[i][eCol])) rtn = true;
            }
            return rtn;
        };

        this.ToUpperCase = function (eVal) {
            return ToUpperCaseFun(eVal);
        };

        function ToUpperCaseFun(eVal) {
            if (eVal !== undefined && eVal !== '' && eVal !== null) {
                if (!IsNumberF(eVal)) {
                    return eVal.toUpperCase();
                }
            }
            return eVal;
        }

        function IsNullValue(eVal) {

            if (eVal === undefined || eVal === '' || eVal === null) {
                return true;
            }

            return false;
        }

        this.IsNumber = function (eVal) {
            return IsNumberF(eVal);
        };

        this.ConvertInt = function (eVal, def) {
            if (parseInt(eVal) === 'NaN') return def;
            return parseInt(eVal);
        };

        function IsNumberF(eVal) {

            var vNum = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            for (var i = 0; i < eVal.length; i++) {
                var res = eVal.charAt(i);

                if (!vNum.indexOf(res)) {
                    return false;
                }
            }

            return true;
        }

        this.IsItemSelected = function (el, indx) {
            var element = this.getElement(el);

            if (element) {
                var vindx = element[0].selectedIndex;

                if (vindx > indx) {
                    return true;
                }
            }

            return false;
        };

        this.IsValidFile = function (eVal) {
            if (eVal && eVal.length > 0) {
                var extn = eVal.split(".").pop().toUpperCase();
                return (extn === "PDF");
            }

            return false;
        };

        this.TrimString = function (str) {
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        };

        this.TriggerDialog = function (dlgName, useDialog) {
            $("#eventTrigger").removeAttr('onclick');
            $("#eventTrigger").removeAttr('class');
            if (useDialog) {
                $("#eventTrigger").attr('onclick', 'pop(\'' + dlgName + '\')');
            }
            else {
                $("#eventTrigger").attr('class', dlgName);
            }
            $("#eventTrigger").click();
            $("#eventTrigger").removeAttr('class');
        };

        this.RemoveClass = function (el) {
            var element = this.getElement(el);

            if (element) {
                element.removeAttr('class');
            }
        };

        this.EnableSelect = function (el, bEnabled) {
            var element = this.getElement(el);

            if (element) {
                if (!bEnabled) {
                    element.addClass('watermarkCSS');
                } else {
                    element.removeClass('watermarkCSS');
                }
            }
        };

        this.TriggerCSSDialog = function (dlgName) {
            $("#eventTrigger").removeAttr('onclick');
            $("#eventTrigger").removeAttr('class');
            $("#eventTrigger").attr('class', dlgName);
            $("#eventTrigger").click();
        };

        this.GetNumberOnly = function (val) {
            var rtn = '';
            angular.forEach(val.split(''), function (chr) {
                if (!isNaN(chr)) {
                    rtn += chr;
                }
            });
            return rtn;
        };

        this.YearRange = function (yr, startV, endV) {
            var yre = yr.replace(/[\s]/g, '');
            if (yre.indexOf('-') > -1) {
                var strs = yre.split('-');

                var istart = this.GetNumberOnly(strs[0]);
                var iend = this.GetNumberOnly(strs[1]);

                //if (parseInt(istart) <= endV) {
                if (parseInt(istart) >= parseInt(startV) && parseInt(iend) < parseInt(endV)) {
                    return true;
                }
                //}
            }

            return false;
        };

        this.SplitItem = function (val, sptchar, indx) {
            if (IsNullValue(val) || val.indexOf(sptchar) < 0) return '';
            return val.split(sptchar)[indx];
        };

        this.AmountRange = function (amt, startV, endV, iext) {
            var amts = amt.replace(/[\s]/g, '');
            if (amts.indexOf('-') > -1) {
                var strs = amts.split('-');
                var istart = (this.GetNumberOnly(strs[0]) * iext) + 1;
                var iend = this.GetNumberOnly(strs[1]) * iext;

                if (parseInt(istart) >= parseInt(startV) && parseInt(iend) <= parseInt(endV)) {
                    return true;
                }

                //if (parseInt(startV) >= parseInt(istart) && parseInt(endV) <= parseInt(iend)) {
                //    return true;
                //}

            }
            return false;
        };

        this.GetItemsCount = function (collection, keyname, matchvalue) {

            var itemCnt = 0;

            for (var i = 0; i < collection.length; i++) {
                //if (collection[i][keyname]) {
                if (collection[i][keyname] === matchvalue) itemCnt++;
                //}
            }

            return itemCnt;
        };

        this.GetNonEmptyItemsCount = function (collection, keyname) {

            var itemCnt = 0;

            for (var i = 0; i < collection.length; i++) {
                if (!IsNullValue(collection[i][keyname])) itemCnt++;
            }

            return itemCnt;
        };

        this.AddEmptyRows = function (collection, len, keyname) {

            var cnt = 0;
            var cntt = len;

            if (!collection) {
                collection = [];
            }

            cnt = collection.length;
            var diff = len - cnt;

            for (var i = 0; i < diff; i++) {
                collection.push({ keyname: 0 });
            }

            return collection;
        };

        this.setInnerHtml = function (elm, _innerHtml) {

            var element = this.getElementById(elm);

            if (element) {
                element.innerHTML = _innerHtml;
            }
        };

        this.GetItemIndex = function (collection, keyname, matchvalue) {

            var itemCnt = -1;

            for (var i = 0; i < collection.length; i++) {
                if (collection[i][keyname] && collection[i][keyname] === matchvalue) {
                    itemCnt = i;
                }
            }

            return itemCnt;
        };
    }]);
});