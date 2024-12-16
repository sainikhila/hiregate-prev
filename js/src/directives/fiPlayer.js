
var app = angular.module('FIPlayer', []);

app.directive('fiPlayer', ['$rootScope', '$routeParams', 'ngVideoTok', 'sharedMethod',
    function ($root, $routeParams, ngVideoTok, cmethod) {
        return {
            restrict: 'E',
            scope: {
                "userObject": '='
            },
            template: '<videolayout  id="recordingcontainerpanel"><div class="webcamera_control">' +
            '<video id="videoInput" autoplay style="width:100%;height:100%" ' +
            'poster="/content/img/webrtc_small.gif"></video>' +
            '</div></videolayout><button_video_label>' +
            '<input type="button" ng-click="doPlayerPlay()" id="btnPlayerPlay" class="button_video" value="Play" />' +
            '<input type="button" ng-click="doPlayerStop()" style="display:none;" id="btnPlayerStop" class="button_video" value="Stop" />' +
            '<span id="playerStatus"></span>' +
            '</button_video_label>',
            link: function (scope, elm, attrs) {

                cmethod.Show('btnPlayerPlay');
                cmethod.Hide('btnPlayerStop');

                var videoUrl = '';
                var media_url = window.__env.mediaUrl;

                var opts = {};

                opts = {
                    url: media_url,
                    LoginId: scope.userObject.Id,
                    LoginName: scope.userObject.Name,
                    ConferenceCall: false,
                    localVideo: document.getElementById('videoInput')
                };

                videoUrl = scope.userObject.VideoUrl;

                scope.doPlayerPlay = function () {
                    cmethod.Hide('btnPlayerPlay');
                    cmethod.Hide('btnPlayerStop');
                    vdoEvents();

                    scope.startcontainer();

                    if (ngVideoTok.validate(opts)) {
                        ngVideoTok.connect();
                    }
                    else {
                        scope.stopcontainer();
                        scope.addStatus('Error establishing connection.');
                        cmethod.Show('btnPlayerPlay');
                    }
                };

                scope.doPlayerStop = function () {
                    scope.startcontainer();
                    ngVideoTok.playrecord(true);
                };

                var CONNECTION_CONNECTED = 1;
                var CONNECTION_DISCONNECTED = 2;
                var CONNECTION_ERROR = 3;
                var REGISTRATION_ACCEPTED = 4;
                var REGISTRATION_REJECTED = 5;
                var PLAY_START_ACCEPTED = 1;
                var PLAY_START_REJECTED = 2;
                var PLAY_STOP_ACCEPTED = 3;
                var PLAY_STOP_REJECTED = 4;

                /* Video object starts here */
                function vdoEvents() {

                    ngVideoTok.on('connection', function (data) {

                        updateStatus(data);

                        switch (data.Status) {
                            case CONNECTION_CONNECTED: // 1 
                                ngVideoTok.register(false);
                                break;
                            case CONNECTION_DISCONNECTED: // 2
                            case CONNECTION_ERROR: // 3
                            case REGISTRATION_REJECTED: // 5
                                scope.stopcontainer();
                                cmethod.Show('btnPlayerPlay');
                                break;
                            case REGISTRATION_ACCEPTED: // 4 
                                ngVideoTok.setFileName(videoUrl);
                                ngVideoTok.playrecord(false);
                                break;
                        }
                    });

                    ngVideoTok.on('playing', function (data) {
                        updateStatus(data);

                        switch (data.Status) {
                            case PLAY_START_ACCEPTED: // 1;
                                $root.safeApply(function () {
                                    cmethod.Hide('btnPlayerPlay');
                                    cmethod.Show('btnPlayerStop');
                                });
                                scope.stopcontainer();
                                break;
                            case PLAY_STOP_ACCEPTED: // 3;
                                $root.safeApply(function () {
                                    cmethod.Show('btnPlayerPlay');
                                    cmethod.Hide('btnPlayerStop');
                                });
                                scope.stopcontainer();
                                break;
                            case PLAY_START_REJECTED: // 2;
                            case PLAY_STOP_REJECTED: // 4;
                                $root.safeApply(function () {
                                    cmethod.Show('btnPlayerPlay');
                                    cmethod.Hide('btnPlayerStop');
                                });
                                scope.stopcontainer();
                                break;
                        }

                    });

                    ngVideoTok.on('onstatus', function (data) {
                        updateStatus(data);
                    });

                    function updateStatus(evt) {
                        $root.safeApply(function () {
                            scope.addStatus(evt.Reason);
                        });
                    };

                    scope.addStatus = function(msg) {
                        $root.safeApply(function () {
                            cmethod.SetText('playerStatus', msg);
                        });
                    };

                    scope.removeStatus = function() {
                        cmethod.Hide('videoError');
                    };

                    scope.startcontainer = function () {
                    };

                    scope.startcontainer2 = function() {
                        
                        cmethod.Hide('videoInput');

                        var elm = cmethod.getElement('recordingcontainerpanel');

                        if (elm) {

                            var zIndex = 0;
                            var zsIndex = elm.css('zIndex');

                            if (!isNaN(zsIndex)) {
                                zIndex = parseInt(zsIndex) + 1;
                            }

                            var pos = cmethod.getPosition(elm[0]);

                            var svg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 133 152" style="enable-background:new 0 0 133 152" xml:space="preserve"><path class="loaderFI_transparent_outline" d="M106.682,120.633 c2.087,7.738,6.6,15.273,11.069,21.835l-0.607-0.09c-10.761-1.979-20.194-6.567-28.343-11.782h-0.044 	c-19.054-1.189-32.76-2.213-50.034-3.963l-0.061-0.007c-11.374-1.23-20.468-9.004-22.295-19.231L5.579,60.465 C5.238,58.767,5.066,57,5.066,55.188C4.24,45.005,11.234,35.083,21.643,30.716L80.365,6.881C84.04,5.537,87.664,5,90.694,5 	c0.807,0,1.435,0.002,2.203,0.084h0.148c12.462,0,22.563,10.211,22.563,22.676v74.26c0,7.083-3.274,13.683-8.376,18.093 L106.682,120.633z" /> <path class="loaderFI_transparent_outline1" fill="transparent" d="M106.682,120.633 c2.087,7.738,6.6,15.273,11.069,21.835l-0.607-0.09c-10.761-1.979-20.194-6.567-28.343-11.782h-0.044 	c-19.054-1.189-32.76-2.213-50.034-3.963l-0.061-0.007c-11.374-1.23-20.468-9.004-22.295-19.231L5.579,60.465 C5.238,58.767,5.066,57,5.066,55.188C4.24,45.005,11.234,35.083,21.643,30.716L80.365,6.881C84.04,5.537,87.664,5,90.694,5 	c0.807,0,1.435,0.002,2.203,0.084h0.148c12.462,0,22.563,10.211,22.563,22.676v74.26c0,7.083-3.274,13.683-8.376,18.093 L106.682,120.633z" /> <polygon fill="#279599" points="98.03,40.387 47.716,40.387 47.716,111.115 64.92,111.115 64.92,83.449 91.087,83.449 91.087,70.232 64.92,70.232 64.92,54.378 98.03,54.378 "/></svg>';

                            var d = document.createElement('div');
                            d.id = 'recordingcontainerpanel_progressbar';
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

                    scope.stopcontainer = function () {
                    };

                    scope.stopcontainer2 = function() {
                        cmethod.stopcontainer('recordingcontainerpanel');
                        var elm = cmethod.getElement('recordingcontainerpanel_progressbar');
                        while (elm) {
                            cmethod.removeElement('recordingcontainerpanel_progressbar');
                            elm = cmethod.getElement('recordingcontainerpanel_progressbar');
                        }
                        cmethod.Show('videoInput');
                    }
                };
                /* Video object ends here */
            }
        };
    }]);
