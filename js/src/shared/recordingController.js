
define(['faceitConsApp' + window.__env.minUrl, 'angular-sanitize',
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'factory/ngVideoTok' + window.__env.minUrl], function (app) {
        "use strict";
        app.controller("RecordingController",
            ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'storageFactory', '$timeout', 'user', 'ngVideoTok',
                function ($scope, $root, ajx, cmethods, sharedData, $timeout, userservice, ngVideoTok) {

                    var media_url = window.__env.mediaUrl;

                    var opts = {};

                    var bufferVideo = '';

                    var ButtonsList = {
                        Initial: 0, // Steady State
                        Record: 1, // Record State
                        RecordStart: 2, // Recording State
                        RecordCancel: 3, // Recording Cancel
                        RecordStop: 4, // Recording Stop
                        RecordPlay: 5, // Play Recorded Video
                        RecordSave: 6, // Save Recorded Video
                        RecordPlayStop: 7, // Stop playing recorded video
                        PlayVideo: 8, // Play Recorded video
                        DeleteVideo: 9, // Play Recorded video
                    };

                    var CONNECTION_CONNECTED = 1;
                    var CONNECTION_DISCONNECTED = 2;
                    var CONNECTION_ERROR = 3;
                    var REGISTRATION_ACCEPTED = 4;
                    var REGISTRATION_REJECTED = 5;
                    var RECORDING_ACCEPTED = 1;
                    var RECORDING_REJECTED = 2;

                    var RECORDING_START_ACCEPTED = 3;
                    var RECORDING_START_REJECTED = 4;
                    var RECORDING_STOP_ACCEPTED = 5;
                    var RECORDING_STOP_REJECTED = 6;

                    var PLAY_START_ACCEPTED = 1;
                    var PLAY_START_REJECTED = 2;
                    var PLAY_STOP_ACCEPTED = 3;
                    var PLAY_STOP_REJECTED = 4;

                    $scope.CurrentState = ButtonsList.Initial;

                    $scope.ErrorOccurs = false;
                    $scope.ErrorMessage = '';

                    var _RecordingExist = false;

                    var lastState = 0;

                    var initialState = 0;

                    var onCheckMandatory = function onCheckMandatory() {
                        cmethods.Hide('RecordingMandatory');

                        var usrType = userservice.GetInt('UserType', -1);

                        if (usrType === 0) {
                            cmethods.Hide('RecordingMandatory');
                        }
                        else {
                            cmethods.ShowInline('RecordingMandatory');
                        }
                    };

                    onCheckMandatory();

                    var sessionInfo = {};

                    var pub = null;
                    var session = null;
                    var IsRecording = false;
                    var IsRecordPlaying = false;

                    var recordingSaved = false;
                    var requiredToPlay = false;
                    $scope.IsDeleteRequired = true;

                    $scope.videoURL = '';
                    $scope.buttonState = 0;

                    $scope.$on("TriggerForLoadingRecording", function (evt, data) {

                        bufferVideo = '';

                        if (data.Record != undefined && !data.Record && cmethods.IsNull(data.VideoUrl)) {
                            cmethods.Hide('recordingcontainerpanel');
                            cmethods.Show('norecordingvideo');
                        }
                        else {

                            if (!cmethods.IsNull(data.Delete)) {
                                $scope.IsDeleteRequired = data.Delete;
                            }
                            if (data.PlayOnly) {
                                bufferVideo = data.VideoUrl;
                                UpdateButtonState(ButtonsList.RecordSave);
                            }
                            else {
                                UpdateButtonState(ButtonsList.Initial);
                            }
                        }
                    });

                    /* VideoTok implementations starts here */
                    $scope.onInitiateRecording = function () {

                        removeStatus();
                        startcontainer();

                        var _loginid = 'U' + userservice.Get('UserId');
                        var _loginname = userservice.Get('FullName');

                        opts = {
                            url: media_url,
                            LoginId: _loginid,
                            LoginName: _loginname,
                            ConferenceCall: false,
                            localVideo: cmethods.getElementById('videoInput')
                        };

                        vdoEvents();

                        if (ngVideoTok.validate(opts)) {
                            ngVideoTok.connect();
                        }
                        else {
                            stopcontainer('recordingcontainerpanel');
                        }

                    };

                    $scope.DoRecord = function () {
                        $scope.safeApply(function () {
                            IsRecording = true;
                            IsRecordPlaying = false;
                        });

                        $scope.onInitiateRecording();
                    };

                    $scope.cancelRecord = function () {
                        ngVideoTok.disconnect();
                    };

                    $scope.startRecord = function () {
                        $scope.safeApply(function () {
                            IsRecording = true;
                            IsRecordPlaying = false;
                        });

                        ngVideoTok.startrecord(false);
                    };

                    $scope.stopRecord = function () {
                        ngVideoTok.startrecord(true);
                    };

                    $scope.playrecording = function () {

                        $scope.safeApply(function () {
                            IsRecordPlaying = true;
                        });

                        $scope.onInitiateRecording();
                    };

                    $scope.stoprecplaying = function () {
                        startcontainer();
                        ngVideoTok.playrecord(true);
                    };

                    $scope.saveRecord = function () {

                        $root.safeApply(function () {
                            bufferVideo = ngVideoTok.getFileName();
                        });

                        var usrType = userservice.GetInt('UserType', -1);
                        var urHash = window.location.pathname;

                        if (urHash.endsWith('/intsignup')) {
                            usrType = -1;
                        }

                        if (parseInt(usrType) < 0) {
                            $scope.$emit("OnVideoChanged", { Url: bufferVideo });
                            $scope.safeApply(function () {
                                if (_RecordingExist) {
                                    $scope.CurrentState = ButtonStates.SaveRecord;
                                }
                                else {
                                    $scope.CurrentState = ButtonStates.StopRecord;
                                }
                            });

                            ngVideoTok.setFileName(bufferVideo);
                            ngVideoTok.disconnect();
                        }
                        else {
                            var data = {
                                Id: 0,
                                Name: bufferVideo
                            };
                            startcontainer();
                            ajx.UpdateVideoURL(data, videoSavedSuccss, videoSavedFailed);
                        }
                    };

                    var videoSavedSuccss = function videoSavedSuccss(resp) {

                        stopcontainer();

                        if (resp.status == 200) {
                            var results = resp.data;
                            if (results.status == 200) {
                                bufferVideo = results.Results.Text;
                                $scope.$emit("OnVideoModified", { Url: bufferVideo });
                                $scope.safeApply(function () {
                                    IsRecording = false;
                                    IsRecordPlaying = false;
                                    $scope.CurrentState = ButtonsList.RecordSave;
                                });
                                ngVideoTok.disconnect();
                            }
                            else {
                                addStatus('System fail to process. Please try again.');
                            }
                        }
                        else {
                            addStatus('System fail to process. Please try again.');
                        }
                    };

                    var videoSavedFailed = function videoSavedFailed(resp) {
                        stopcontainer();
                        addStatus('System fail to process. Please try again.');
                    };

                    $scope.DoPlay = function () {
                        $scope.safeApply(function () {
                            IsRecording = false;
                            IsRecordPlaying = false;
                        });

                        $scope.onInitiateRecording();
                    };

                    $scope.stopvdoplaying = function () {
                        ngVideoTok.playrecord(true);
                    };

                    $scope.deleteVideo = function () {
                        UpdateButtonState(ButtonsList.DeleteVideo);
                    };

                    $scope.noDelete = function () {
                        UpdateButtonState(ButtonsList.RecordSave);
                    };

                    $scope.yesDelete = function () {

                        var usrType = userservice.GetInt('UserType', -1);
                        var urHash = window.location.pathname;

                        if (urHash.endsWith('/intsignup')) {
                            usrType = -1;
                        }

                        if (parseInt(usrType) < 0) {
                            bufferVideo = '';
                            $scope.$emit("OnVideoChanged", { Url: bufferVideo });
                            stopcontainer();
                            UpdateButtonState(ButtonsList.Initial);
                        }
                        else {
                            startcontainer();
                            ajx.DeleteVideoURL(videoDeletedSuccss, videoDeletedFailed);
                        }
                    };

                    var videoDeletedSuccss = function videoDeletedSuccss(resp) {

                        stopcontainer();

                        if (resp.status == 200) {
                            var results = resp.data;
                            if (results.status == 200) {
                                bufferVideo = '';
                                $scope.$emit("OnVideoModified", { Url: bufferVideo });
                                UpdateButtonState(ButtonsList.Initial);
                            }
                            else {
                                addStatus('System fail to process. Please try again.');
                            }
                        }
                        else {
                            addStatus('System fail to process. Please try again.');
                        }

                    };

                    var videoDeletedFailed = function videoDeletedFailed(resp) {
                        stopcontainer();
                        addStatus('System fail to process. Please try again.');
                    };

                    var errorDisplay = function errorDisplay(msg) {
                        $scope.ErrorMessage = msg;
                        $scope.ErrorOccurs = !cmethods.IsNull(msg);
                    };



                    /* VideoTok implementations ends here */

                    /* Video object starts here */
                    function vdoEvents() {

                        ngVideoTok.on('connection', function (data) {

                            updateStatus(data);

                            switch (data.Status) {
                                case CONNECTION_CONNECTED: // 1 
                                    if (IsRecording) {
                                        if (IsRecordPlaying) {
                                            ngVideoTok.register(false);
                                        }
                                        else
                                            ngVideoTok.register(true);
                                    }
                                    else
                                        ngVideoTok.register(false);
                                    break;
                                case CONNECTION_DISCONNECTED: // 2
                                case CONNECTION_ERROR: // 3
                                case REGISTRATION_REJECTED: // 5
                                    $root.safeApply(function () {
                                        stopcontainer();
                                        clearSource();
                                        if (IsRecording) {
                                            UpdateButtonState(ButtonsList.Initial);
                                        }
                                        else {
                                            UpdateButtonState(ButtonsList.RecordSave);
                                        }
                                    });
                                    break;
                                case REGISTRATION_ACCEPTED: // 4 
                                    bufferVideo = 'https://s3-ap-southeast-1.amazonaws.com/fiswas3/Sessions/FI00464.webm';
                                    if (IsRecording) {
                                        if (IsRecordPlaying) {
                                            ngVideoTok.setFileName(bufferVideo);
                                            ngVideoTok.playrecord(false);
                                        }
                                    }
                                    else {
                                        ngVideoTok.setFileName(bufferVideo);
                                        ngVideoTok.playrecord(false);
                                    }
                                    break;
                            }
                        });

                        ngVideoTok.on('recording', function (data) {

                            updateStatus(data);

                            switch (data.Status) {
                                case RECORDING_ACCEPTED: // 1
                                    $root.safeApply(function () {
                                        if (IsRecording) {
                                            UpdateButtonState(ButtonsList.Record);
                                        }
                                        else {
                                            UpdateButtonState(ButtonsList.PlayVideo);
                                        }
                                        stopcontainer();
                                    });
                                    break;
                                case RECORDING_REJECTED: //  2;
                                    stopcontainer();
                                    break;
                                case RECORDING_START_ACCEPTED: //  3;
                                    $root.safeApply(function () {
                                        $scope.CurrentState = ButtonsList.RecordStart;
                                        stopcontainer();
                                    });
                                    break;
                                case RECORDING_START_REJECTED: //  4;
                                    stopcontainer();
                                    break;
                                case RECORDING_STOP_ACCEPTED: //  5;
                                    $root.safeApply(function () {
                                        bufferVideo = ngVideoTok.getFileName();
                                        $scope.CurrentState = ButtonsList.RecordStop;
                                        stopcontainer();
                                    });
                                    break;
                                case RECORDING_STOP_REJECTED: //  6;
                                    stopcontainer();
                                    break;
                            }
                        });

                        ngVideoTok.on('playing', function (data) {
                            updateStatus(data);

                            switch (data.Status) {
                                case PLAY_START_ACCEPTED: // 1;
                                    stopcontainer();
                                    if (IsRecording) {
                                        if (IsRecordPlaying) {
                                            UpdateButtonState(ButtonsList.RecordPlay);
                                        }
                                    }
                                    else {
                                        UpdateButtonState(ButtonsList.PlayVideo);
                                    }
                                    break;
                                case PLAY_STOP_ACCEPTED: // 3;
                                    if (IsRecording) {
                                        if (IsRecordPlaying) {
                                            UpdateButtonState(ButtonsList.RecordStop);
                                        }
                                    }
                                    else {
                                        UpdateButtonState(ButtonsList.RecordSave);
                                    }
                                    stopcontainer();
                                    break;
                                case PLAY_START_REJECTED: // 2;
                                case PLAY_STOP_REJECTED: // 4;
                                    break;
                            }

                        });

                        ngVideoTok.on('onstatus', function (data) {
                            updateStatus(data);
                        });

                        function updateStatus(evt) {
                            $scope.safeApply(function () {
                                addStatus(evt.Reason);
                            });
                        };
                    };
                    /* Video object ends here */

                    function startcontainer() {

                        cmethods.Hide('videoInput');

                        var elm = cmethods.getElement('recordingcontainerpanel');

                        if (elm) {

                            var zIndex = 0;
                            var zsIndex = elm.css('zIndex');

                            if (!isNaN(zsIndex)) {
                                zIndex = parseInt(zsIndex) + 1;
                            }

                            var pos = cmethods.getPosition(elm[0]);

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

                    function stopcontainer() {
                        cmethods.stopcontainer('recordingcontainerpanel');

                        var elm = cmethods.getElement('recordingcontainerpanel_progressbar');
                        while (elm) {
                            cmethods.removeElement('recordingcontainerpanel_progressbar');
                            elm = cmethods.getElement('recordingcontainerpanel_progressbar');
                        }

                        cmethods.Show('videoInput');
                    }

                    function addStatus(err) {
                        cmethods.setInnerHtml('videoError', err);
                        cmethods.Show('videoError');
                    };

                    function removeStatus() {
                        cmethods.Hide('videoError');
                    };

                    function clearSource() {
                        cmethods.getElement('videoInput').attr('poster', '/content/img/webrtc_small.gif');
                    };

                    function UpdateButtonState(_state) {
                        $scope.safeApply(function () {
                            $scope.CurrentState = _state;
                        });
                    };

                }]);
    });