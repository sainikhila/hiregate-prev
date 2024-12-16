define(['angularAMD', 'angular-route', 'angular-sanitize', 'angular-loading', 'angular-animate', 'loading-bar'], function (angularAMD) {

    "use strict";

    var app = angular.module('faceitConsApp' + window.__env.minUrl, ['ngRoute', 'ngSanitize', 'angular-loading-bar', 'ngAnimate']);

    var dynamicRoute = '';

    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.useApplyAsync(true);
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.withCredentials = true;
    }]);

    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);

    app.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }]);

    app.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix('');
    }]);

    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when("/", angularAMD.route({
                templateUrl: function (rp) {
                    return 'js/views' + dynamicRoute.TemplateUrl + '.html';
                },
                resolve: {

                    load: ['$q', '$rootScope', '$location', 'approutes',
                        function ($q, $rootScope, $location, approutes) {
                            dynamicRoute = approutes.getRoutes('/');
                            var loadController = window.__env.baseUrl + 'controllers' + dynamicRoute.Controller + window.__env.minUrl;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }]
                }
            }))
            .when("/:section", angularAMD.route({

                templateUrl: function (rp) {
                    return 'js/views' + dynamicRoute.TemplateUrl + '.html';
                },
                resolve: {

                    load: ['$q', '$rootScope', '$location', 'approutes', 'user',
                        function ($q, $rootScope, $location, approutes, user) {

                            var path = $location.path();
                            var parsePath = path.split("/");
                            var parentPath = parsePath[1];
                            var controllerName = parsePath[2];

                            dynamicRoute = approutes.getRoutes(parentPath);

                            var deferred = $q.defer();

                            if (dynamicRoute.AuthRequired) {
                                var fullName = user.Get('FullName');
                                if (!fullName || fullName === '') {
                                    $location.path('/');
                                    return deferred.promise;
                                }
                            }

                            var loadController = window.__env.baseUrl + 'controllers' + dynamicRoute.Controller + window.__env.minUrl;
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }]
                }

            }))
            .when("/:section/:Id", angularAMD.route({
                templateUrl: function (rp) {
                    return 'js/views' + dynamicRoute.TemplateUrl + '.html';
                },
                resolve: {

                    load: ['$q', '$rootScope', '$location', 'approutes', 'user',
                        function ($q, $rootScope, $location, approutes, user) {

                            var path = $location.path();
                            var parsePath = path.split("/");
                            var parentPath = parsePath[1];
                            var controllerName = parsePath[2];
                            var loc = window.location.href;

                            var deferred = $q.defer();

                            if (parentPath === "ext") {
                                if (loc.indexOf('#') > -1) {
                                    loc = loc.substring(0, loc.indexOf('#'));
                                    window.location.href = loc;
                                    return deferred.promise;
                                }
                            }

                            dynamicRoute = approutes.getRoutes(parentPath);

                            if (dynamicRoute.AuthRequired) {
                                var fullName = user.Get('FullName');
                                if (!fullName || fullName === '') {
                                    $location.path('/');
                                    return deferred.promise;
                                }
                            }

                            var loadController = window.__env.baseUrl + 'controllers' + dynamicRoute.Controller + window.__env.minUrl;

                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });

                            return deferred.promise;
                        }]
                }

            }))
            .otherwise({ redirectTo: '/' })
            ;
    }]);

    app.factory("approutes", ['$http', function ($http) {
        return {
            getRoutes: function (key) {

                var routes = [
                    {
                        name: 'error',
                        TemplateUrl: '/Error/ErrorPage',
                        Controller: '/errors/ErrorController',
                        CSSUrl: [
                            'secondary.css']
                    },
                    {
                        name: '/',
                        Controller: "/home/HomeController",
                        TemplateUrl: '/home/home',
                        CSSUrl: [
                            'home.css']
                    },
                    {
                        name: 'rg',
                        Controller: "/common/registerController",
                        TemplateUrl: '/common/registration',
                        CSSUrl: [
                            'signup.css','autocomplete.css']
                    },
                    {
                        name: 'db',
                        Controller: "/dashboard/dashboardController",
                        TemplateUrl: '/dashboard/dashboard',
                        AuthRequired: true,
                        CSSUrl: [
                            'dashboard.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'cn',
                        Controller: "/candidate/candidateController",
                        TemplateUrl: '/candidate/candidate',
                        AuthRequired: true,
                        CSSUrl: [
                            'can_results.css',
                            'pop-content.css']
                    },
                    {
                        name: 'cnp',
                        Controller: "/candidate/candidateProfileController",
                        TemplateUrl: '/candidate/candidatep',
                        AuthRequired: true,
                        CSSUrl: [
                            'can_profile.css',
                            'pop-content.css']
                    },
                    {
                        name: 'in',
                        Controller: "/interviewer/interviewerController",
                        TemplateUrl: '/interviewer/interviewer',
                        AuthRequired: true,
                        CSSUrl: [
                            'interviewer.css',
                            'pop-content.css']
                    },
                    {
                        name: 'cs',
                        Controller: "/session/sessionController",
                        TemplateUrl: '/session/session',
                        AuthRequired: true,
                        CSSUrl: [
                            'session.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'is',
                        Controller: "/session/isessionController",
                        TemplateUrl: '/session/isession',
                        AuthRequired: false,
                        CSSUrl: [
                            'process.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'ac',
                        Controller: "/account/accountController",
                        TemplateUrl: '/account/account',
                        AuthRequired: true,
                        CSSUrl: [
                            'account.css',
                            'pop-content.css']
                    },
                    {
                        name: 'au',
                        Controller: "/account/acctUserController",
                        TemplateUrl: '/account/acctUser',
                        AuthRequired: true,
                        CSSUrl: [
                            'account.css',
                            'pop-content.css']
                    },
                    {
                        name: 'acd',
                        Controller: "/account/accountController",
                        TemplateUrl: '/account/accountdet',
                        AuthRequired: true,
                        CSSUrl: [
                            'account.css',
                            'pop-content.css']
                    },
                    {
                        name: 'privacy',
                        TemplateUrl: '/common/Privacy',
                        Controller: '/common/tabController',
                        PhotoRequired: true,
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'terms',
                        TemplateUrl: '/common/Terms',
                        Controller: '/common/tabController',
                        PhotoRequired: true,
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'pp',
                        TemplateUrl: '/account/profileupdate',
                        Controller: '/account/profileController',
                        AuthRequired: true,
                        CSSUrl: [
                            'pop-content.css','profile.css']
                    },
                    {
                        name: 'pricing',
                        TemplateUrl: '/common/pricing',
                        Controller: '/common/unusedController',
                        CSSUrl: [
                            'pop-content.css','pricing.css']
                    },
                    {
                        name: 'features',
                        TemplateUrl: '/common/feature',
                        Controller: '/common/tabController',
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'about',
                        TemplateUrl: '/common/About',
                        Controller: '/common/tabController',
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'agreement',
                        TemplateUrl: '/common/Agreement',
                        Controller: '/common/tabController',
                        PhotoRequired: true,
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'faq',
                        TemplateUrl: '/common/Faq',
                        Controller: '/common/tabController',
                        PhotoRequired: true,
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'disclaimer',
                        TemplateUrl: '/common/Disclaimer',
                        Controller: '/common/tabController',
                        PhotoRequired: true,
                        CSSUrl: [
                            'pop-content.css','secondary.css']
                    },
                    {
                        name: 'ce',
                        Controller: "/common/unusedController",
                        TemplateUrl: '/common/emailconfirmed',
                        CSSUrl: [
                            'secondary.css',
                            'pop-content.css']
                    },
                    {
                        name: 'fb',
                        Controller: "/common/feedbackController",
                        TemplateUrl: '/common/feedback',
                        AuthRequired: true,
                        CSSUrl: [
                            'canEvaluationForm.css']
                    },
                    {
                        name: 'tq',
                        Controller: "/common/unusedController",
                        TemplateUrl: '/common/thank',
                        CSSUrl: [
                            'secondary.css',
                            'pop-content.css']
                    },
                    {
                        name: 'fpb',
                        Controller: "/common/publicController",
                        TemplateUrl: '/common/canfeedback',
                        AuthRequired: true,
                        CSSUrl: [
                            'canEvaluationPublic.css',
                            'pop-content.css']
                    },
                    {
                        name: 'fpp',
                        Controller: "/common/pinAccessController",
                        TemplateUrl: '/common/pinAccess',
                        CSSUrl: ['pinAccess.css']
                    },
                    {
                        name: 'pdc',
                        Controller: "/common/docAccessController",
                        TemplateUrl: '/common/doclist',
                        AuthRequired: true,
                        CSSUrl: [
                            'msg.css',
                            'pop-content.css']
                    },
                    {
                        name: 'fap',
                        Controller: "/common/accessController",
                        TemplateUrl: '/common/accessList',
                        CSSUrl: [
                            'secondary.css',
                            'pop-content.css']
                    },
                    {
                        name: 'jb',
                        Controller: "/job/jobListController",
                        TemplateUrl: '/job/joblist',
                        AuthRequired: true,
                        CSSUrl: [
                            'job.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'jbc',
                        Controller: "/job/jobCreateController",
                        TemplateUrl: '/job/jobCreate',
                        AuthRequired: false,
                        CSSUrl: [
                            'job.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'jbe',
                        Controller: "/job/jobEditController",
                        TemplateUrl: '/job/jobEdit',
                        AuthRequired: true,
                        CSSUrl: [
                            'job.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'jbd',
                        Controller: "/job/jobDetailController",
                        TemplateUrl: '/job/jobDetail',
                        AuthRequired: true,
                        CSSUrl: [
                            'jobDetails.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'psl',
                        Controller: "/pretest/pretestListController",
                        TemplateUrl: '/pretest/testList',
                        AuthRequired: true,
                        CSSUrl: [
                            'testcreate.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    },
                    {
                        name: 'ps',
                        Controller: "/pretest/pretestController",
                        TemplateUrl: '/pretest/createTest',
                        AuthRequired: true,
                        CSSUrl: [
                            'testcreate.css',
                            'pop-content.css',
                            'calendar_pickday.css']
                    }
                ];

                if (key === undefined || key === '') key = '/';

                var foundroute = '';

                for (var i = 0; i < routes.length; i++) {
                    var route = routes[i];
                    if (route.name === key) {
                        foundroute = route;
                        break;
                    }
                }

                return foundroute;
            }
        };
    }]);

    app.directive('head', ['$rootScope', '$compile', 'approutes',
        function ($rootScope, $compile, approutes) {
            return {
                restrict: 'E',
                link: function (scope, elem) {
                    var html = '<link rel="stylesheet" ng-repeat="(routeCtrl, cssUrl) in routeStyles" ng-href="/content/css/{{cssUrl}}" />';
                    elem.append($compile(html)(scope));
                    scope.routeStyles = {};

                    $rootScope.$on('$routeChangeStart', function (e, next, current) {
                        if (current && current.$$route && current.$$route.css) {
                            if (!angular.isArray(current.$$route.css)) {
                                current.$$route.css = [current.$$route.css];
                            }
                            angular.forEach(current.$$route.css, function (sheet) {
                                delete scope.routeStyles[sheet];
                            });
                        }
                        if (next && next.$$route && next.$$route.css) {
                            if (!angular.isArray(next.$$route.css)) {
                                next.$$route.css = [next.$$route.css];
                            }
                            angular.forEach(next.$$route.css, function (sheet) {
                                scope.routeStyles[sheet] = sheet;
                            });
                        }
                        else if (next && next.$$route && !next.$$route.css) {
                            var routeCss = approutes.getRoutes(next.params.section).CSSUrl;
                            if (!angular.isArray(routeCss)) {
                                routeCss = [routeCss];
                            }
                            angular.forEach(routeCss, function (sheet) {
                                scope.routeStyles[sheet] = sheet;
                            });
                        }
                    });
                }
            };
        }
    ]);

    app.factory("user", function () {

        var fun = {};

        fun.setModal = function (modal) {
            sessionStorage.setItem('user', angular.toJson(modal));
        };

        fun.GetInt = function (name, def) {
            var rslt = fun.Get(name);
            if (rslt === undefined || rslt === null || rslt === '') {
                return def;
            }
            var rtn = parseInt(rslt);
            if (isNaN(rtn)) {
                rtn = def;
            }
            return rtn;
        };

        fun.GetBool = function (name, def) {
            var rslt = fun.Get(name);

            if (rslt === undefined || rslt === null || rslt === '') {
                return def;
            }

            if (rslt.toString().toUpperCase() === 'TRUE')
                return true;

            return false;

        };

        fun.Get = function (name) {

            var objVal = angular.fromJson(sessionStorage.getItem('user'));

            if (objVal === null || objVal === undefined || objVal === '') {
                return '';
            }

            return objVal[name];
        };

        fun.Set = function (name, val) {

            var objVal = angular.fromJson(sessionStorage.getItem('user'));

            if (objVal === null || objVal === undefined || objVal === '') {
                return;
            }
            objVal[name] = val;

            fun.setModal(objVal);
        };

        fun.Init = function () {

            var modal = sessionStorage.getItem('user');

            if (modal === undefined || modal === null) {
                modal = {
                    UserId: 0,
                    Company: '',
                    FullName: '',
                    Photo: ''
                };

                fun.setModal(modal);
            }
        };

        return fun;

    });

    app.factory("storageFactory", function () {

        var fun = {};

        fun.getValue = function (key, val) {

            var objVal = sessionStorage.getItem(key);

            if (objVal === null || objVal === undefined || objVal === '') {
                return val;
            }

            var obj = angular.fromJson(sessionStorage.getItem(key));

            if (obj !== undefined && obj !== null) {
                return obj;
            }

            return val;
        };

        fun.setValue = function (key, val) {
            sessionStorage.setItem(key, angular.toJson(val));
        };

        fun.clearValue = function (key) {
            sessionStorage.setItem(key, '');
        };

        return fun;

    });

    app.config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);

    app.config(['$httpProvider', function ($httpProvider) {
        var interceptor = function ($rootScope, $q, $location, storage) {
            return {
                request: function (config) {
                    if (config.url.indexOf('/token') > -1) {
                        storage.clearValue('Identity');
                    }
                    var identity = storage.getValue('Identity');
                    if (identity && identity !== '') {
                        config.headers['Authorization'] = identity.token_type + ' ' + identity.access_token;
                    }
                    return config;
                },
                response: function (resp) {
                    if (resp.data.status === 100) {
                        storage.clearValue('Identity');
                        $rootScope.$broadcast('SessionExpired', {});
                    }
                    else if (resp.data.status === 900) {
                        storage.clearValue('Identity');
                        $rootScope.$broadcast('SessionExpired', {});
                    }
                    return resp;
                },
                responseError: function (rej) {
                    var msg = '';
                    if (parseInt(rej.status) !== 200) {
                        if (rej.config && rej.config.url.indexOf('/token') > -1) {
                            storage.clearValue('Identity');
                            if (!rej.data) {
                                var tdata = {
                                    error: 'Errr',
                                    error_description: 'Server connection error',
                                    status: rej.status
                                };
                                rej.data = tdata;
                            }

                            var data = {
                                code: rej.data.error,
                                msg: rej.data.error_description,
                                status: rej.status
                            };

                            if (parseInt(rej.status) === 500) {
                                data.code = 500;
                                data.msg = rej.statusText;
                            }

                            $rootScope.$broadcast('BadRequest', data);
                            return $q.reject(rej);
                        }
                        else {
                            $rootScope.NavigateToRoute('error');
                            return $q.reject(rej);
                        }
                    }
                }
            };
        };

        var params = ['$rootScope', '$q', '$location', 'storageFactory'];
        interceptor.$inject = params;

        $httpProvider.interceptors.push(interceptor);

    }]);

    app.filter('trusted', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);

    app.directive('script', function () {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, elem, attr) {
                if (attr.type === 'text/javascript-lazy') {
                    var code = elem.text();
                    var f = new Function(code);
                    f();
                }
            }
        };
    });

    app.directive('ngBlur', ['$http', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                onBlurEvent: '&'
            },
            link: function (scope, elm, attrs, ngModel) {
                elm.on('blur', function () {
                    scope.onBlurEvent();
                });
            }
        };
    }]);

    app.run(['$rootScope', '$location', '$anchorScroll', '$routeParams', 'user', '$filter', '$sce', '$http', '$window',
        function ($root, $location, $anchorScroll, $routeParams, user, $filter, $sce, $http, $window) {

            user.Init();

            $root.IsAnchorClickable = function (evt) {
                var disabled = evt.currentTarget.getAttribute('disabled');
                if (disabled && disabled === 'disabled') {
                    return false;
                }
                return true;
            };

            $root.NavigateToRoute = function (lnk) {

                $window.scrollTo(0, 0);

                var items = ['loader_disable_bg', 'tc_bg', 'tc_bg1'];

                angular.forEach(items, function (item) {
                    var eItem = angular.element(document.querySelector('#' + item));
                    if (eItem.length > 0)
                        eItem[0].style['display'] = 'none';

                    eItem = angular.element(document.querySelector('.' + item));
                    if (eItem.length > 0)
                        eItem[0].style['display'] = 'none';

                });

                var eItem2 = angular.element(document.querySelector('.pop_closeBtn_rTop'));
                if (eItem2.length > 0) {
                    $(".pop_closeBtn_rTop").click();
                }

                $location.path('/' + lnk);
            };

            $root.trustAsResourceUrl = function (url) {
                return $sce.trustAsResourceUrl('/js/build/scripts/' + url);
            };

            $root.$on('$routeChangeStart', function (e, curr, prev) {
                if (curr.$$route && curr.$$route.resolve) {
                    $root.loadingView = false;
                }
            });

            $root.$on('$routeChangeSuccess', function (e, curr, prev) {
                CheckForInnerFooter();
                $root.loadingView = true;
            });

            function CheckForInnerFooter() {
                var _path = document.location.pathname;
                if (_path === '/') {
                    $('#footer-in').css({ display: "none" });
                } else {
                    $('#footer-in').css({ display: "block" });
                }
            }

            $root.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $root.CloseVideo = function CloseVideo() {
                $('#youtube_player').each(function () {
                    this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*')
                });
            };
        }]);

    return angularAMD.bootstrap(app);

});