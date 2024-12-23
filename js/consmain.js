﻿require.config({

    baseurl: 'js',
    waitSeconds: 200,
    urlArgs: "v=" + new Date().getTime(),
    paths: {
        'angular': '/Scripts/angular' + window.__env.minUrl,
        'angular-route': '/Scripts/angular-route' + window.__env.minUrl,
        'angular-sanitize': '/Scripts/angular-sanitize' + window.__env.minUrl,
        'angular-loading': '/Scripts/angular-loader' + window.__env.minUrl,
        'angular-animate': '/Scripts/angular-animate' + window.__env.minUrl,
        'loading-bar': '/Scripts/loading-bar' + window.__env.minUrl,
        'angularAMD': '/Scripts/angularAMD' + window.__env.minUrl,
        'ngCookies': '/Scripts/angular-cookies' + window.__env.minUrl
    },

    shim: {
        'angular-route': ['angular'],
        'angular-sanitize': ['angular'],
        'angularAMD': ['angular'],
        'angular-loading': ['angular'],
        'angular-animate': ['angular'],
        'loading-bar': ['angular'],
        'ngCookies': ['angular']
    },

    deps: ['faceitConsApp' + window.__env.minUrl]
});
