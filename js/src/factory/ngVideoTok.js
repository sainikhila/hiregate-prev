//var sckApp = angular.module('faceitApp');
var sckApp = angular.module('ngVideoTokBox', []);
sckApp.service('ngVideoTok', ['$rootScope', function ($rootScope) {

    var self = this;

    var socket;
    var _fileName = '';

    var options = {
        MeetingId: '',
        LoginName: '',
        LoginId: '',
        LognType: -1,
        LoginPassword: '',
        url: '',
        scope: null
    };

    var localVideoElm, remoteVideoElm, webRtcPeer;
    var requiredWebRTC = true;

    function reset() {
        localVideoElm = remoteVideoElm = webRtcPeer = null; requiredWebRTC = true; _fileName = '';
    }

    function $safeApply(fn) {
        var phase = $rootScope.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            $rootScope.$apply(fn);
        }
    };

    function Logger(msg) {
        console.log(msg);
    };

    function logCustom(evt, msg, status) {
        setTimeout(function () {
            $rootScope.$emit(evt, { Status: status, Reason: msg, Scope: options.scope });
        }, 500);
    };

    function logStatus(msg) {
        setTimeout(function () {
            $rootScope.$emit('onstatus', { Reason: msg, Scope: options.scope });
        }, 500);
    };

    /* STATUS EVENTS STARTS */

    var CONNECTION_CONNECTED = 1;
    var CONNECTION_DISCONNECTED = 2;
    var CONNECTION_FORCE_DISCONNECTED = 22;
    var CONNECTION_ERROR = 3;
    var REGISTRATION_ACCEPTED = 4;
    var REGISTRATION_REJECTED = 5;
    var CALL_WAITING_ACCEPTED = 6;
    var CALL_STATE_STARTED = 7;
    var CALL_STATE_DROPPED = 8;

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

    var peerWasDisconnected = false;

    /* STATUS EVENTS ENDS */


    function getUniqueNumber() {

        var dt = new Date();

        var unqNumber = dt.getFullYear() +
            paddingZeros(dt.getMonth() + 1) +
            paddingZeros(dt.getDate()) +
            paddingZeros(dt.getHours()) +
            paddingZeros(dt.getMinutes()) +
            paddingZeros(dt.getSeconds());

        return unqNumber;

        function paddingZeros(v) {
            return v.toLocaleString().length === 1 ? '0' + v : v;
        }
    };

    function ValidateProperties(opts) {

        reset();

        logStatus('Please wait...establishing the connection.');

        if (!opts || opts.length === 0) {
            logStatus('Required data is empty.');
            return false;
        }

        if (opts.ConferenceCall === 'false' || !opts.ConferenceCall) {
            opts.MeetingId = getUniqueNumber();
            opts.LognType = -1;
        }

        if (!opts.url || opts.url === '') {
            logStatus('No service url found.');
            return false;
        }

        if (!opts.MeetingId || opts.MeetingId === '') {
            logStatus('Enter a valid PIN');
            return false;
        }

        if (!opts.LoginName || opts.LoginName === '') {
            logStatus('Enter your Name');
            return false;
        }

        options = opts;

        localVideoElm = options.localVideo;
        remoteVideoElm = options.remoteVideo;

        if (!localVideoElm && !remoteVideoElm) {
            logStatus('No video containers are defined.');
            return false;
        }

        return true;
    };

    function SendRequest(type, data) {
        if (socket.connected) {
            socket.emit(type, JSON.stringify(data));
        }
    };

    /* SOCKET EVENTS END */

    function ProcessResponse(res) {
        switch (res.Type) {
            case 'Registered':
                ResponseForRegister(res);
                break;
            case 'Answered':
                AcceptOfferAnswer(res.Answer);
                break;
            case 'Record':
                ResponseForRecord(res);
                break;
            case 'StartRecord':
                ResponseForStartRecord(res);
                break;
            case 'StopRecord':
                ResponseForStopRecord(res);
                break;
            case 'StartPlay':
                ResponseForStartPlay(res);
                break;
            case 'StopPlay':
                ResponseForStopPlay(res);
                break;
            case 'CallStatus':
                ResponseForCall(res);
                break;

            case 'OnIceCandidate':
                webRtcPeer.addIceCandidate(res.Candidate);
                break;

            case 'ForceDisconnect':
                logCustom('connection', null, CONNECTION_FORCE_DISCONNECTED);
                break;


            case 'PONG':
                setTimeout(function () {
                    SendRequest({ Type: 'PING' });
                }, 800);
                break;
        };
    };

    function CloseWebCam() {
        if (webRtcPeer) {
            webRtcPeer.dispose();
            webRtcPeer = null;
        }
    };

    function Register() {

        logStatus('Initializing...');

        var req = {
            MeetingId: options.MeetingId,
            UserId: options.LoginId,
            Name: options.LoginName,
            Type: options.LognType,
            ConferenceCall: options.ConferenceCall
        };

        SendRequest('register', req);
    };

    function ResponseForRegister(res) {
        if (res.Status === 'Accepted') {
            logCustom('connection', 'Registration accepted by the server.', REGISTRATION_ACCEPTED);
            if (requiredWebRTC) {
                setTimeout(function () {
                    InitWebRTC();
                }, 100);
            }
        } else {
            CloseWebCam();
            if (socket) {
                socket.disconnect();
            }
            logCustom('connection', 'Registration rejected by the server.', REGISTRATION_REJECTED);
        }
    };

    function InitWebRTC() {

        if (!socket || !socket.connected) {
            return logCustom('connection', 'You are disconnected from the server.', CONNECTION_DISCONNECTED);
        }

        logStatus('Initializing...');

        var rtcOpts = {
            localVideo: localVideoElm,
            remoteVideo: remoteVideoElm
        };

        if (options.ConferenceCall === 'false' || !options.ConferenceCall) {
            rtcOpts = {
                localVideo: localVideoElm
            };
        }

        webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(rtcOpts,
            function (error) {
                if (error) {
                    CloseWebCam();
                    return Logger(error);
                }

                this.generateOffer(function (error, offer) {
                    if (error) {
                        CloseWebCam();
                        return Logger(error);
                    }

                    webRtcPeer.on('icecandidate', function (candidate) {
                        SendRequest('icecandidate', { Candidate: candidate });
                    });

                    if (peerWasDisconnected) {
                        peerWasDisconnected = false;
                        SendRequest('call', {
                            Status: 'RESTART',
                            SdpOffer: offer
                        });
                    }
                    else {
                        SendRequest('openwebtrc', { sdpOffer: offer });
                    }

                });
            });
    };

    function InitPlayWebRTC() {

        if (!socket || !socket.connected) {
            return logCustom('connection', 'You are disconnected from the server.', CONNECTION_DISCONNECTED);
        }

        logStatus('Initializing...');

        var rtcOpts = {
            remoteVideo: localVideoElm
        };

        webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(rtcOpts,
            function (error) {
                if (error) {
                    CloseWebCam();
                    return Logger(error);
                }

                this.generateOffer(function (error, offer) {
                    if (error) {
                        CloseWebCam();
                        return Logger(error);
                    }

                    webRtcPeer.on('icecandidate', function (candidate) {
                        SendRequest('icecandidate', { Candidate: candidate });
                    });

                    SendRequest('play', { sdpOffer: offer, Status: 'START', filename: _fileName });
                });
            });
    };

    function AcceptOfferAnswer(answer) {

        webRtcPeer.processAnswer(answer, function (error) {
            if (error) {
                CloseWebCam();
                return Logger(error);
            }
        });
    };

    function ResponseForRecord(res) {
        if (res.Status === 'Accepted') {
            logCustom('recording', 'Ready to start recording.', RECORDING_ACCEPTED);
        } else {
            CloseWebCam();
            logCustom('recording', 'Recording rejected by the server.', RECORDING_REJECTED);
        }
    };

    function ResponseForStartRecord(res) {
        if (res.Status === 'Accepted') {
            _fileName = res.FileName;
            logCustom('recording', 'Recording...', RECORDING_START_ACCEPTED);
        } else {
            CloseWebCam();
            logCustom('recording', 'Recording rejected by the server.', RECORDING_START_REJECTED);
        }
    };

    function ResponseForStopRecord(res) {
        CloseWebCam();
        if (socket) {
            socket.disconnect();
        }
        if (res.Status === 'Accepted') {
            _fileName = res.FileName;
            logCustom('recording', 'Recording stopped...', RECORDING_STOP_ACCEPTED);
        } else {
            logCustom('recording', 'Recording rejected by the server.', RECORDING_STOP_REJECTED);
        }
    };

    function ResponseForStartPlay(res) {
        if (res.Status === 'Accepted') {
            logCustom('playing', 'Playing...', PLAY_START_ACCEPTED);
            _fileName = res.FileName;
            SendRequest('startplay', {});
        } else {
            CloseWebCam();
            logCustom('playing', 'Playing rejected by the server.', PLAY_START_REJECTED);
        }
    };

    function ResponseForStopPlay(res) {

        CloseWebCam();

        if (socket) {
            socket.disconnect();
        }

        if (res.Status === 'Accepted') {
            logCustom('playing', 'Playing stopped...', PLAY_STOP_ACCEPTED);
        } else {
            logCustom('playing', 'Playing rejected by the server.', PLAY_STOP_REJECTED);
        }
    };

    function ResponseForCall(res) {
        if (res.Status === 'Waiting') {
            logCustom('call', res.Reason + '...', CALL_WAITING_ACCEPTED);
        }
        else if (res.Status === 'IncomingCall') {
            logCustom('call', res.Reason + '...', CALL_WAITING_ACCEPTED);

            if (peerWasDisconnected) {
                setTimeout(function () {
                    InitWebRTC();
                }, 100);
            }
            else {
                SendRequest('call', {
                    Status: 'START'
                });
            }
        }
        else if (res.Status === 'CallAccepted') {
            logCustom('call', res.Reason + '...', CALL_STATE_STARTED);
        }
        else if (res.Status === 'CallDropped') {
            remoteVideoElm.src = "#";
            peerWasDisconnected = true;
            logCustom('call', res.Reason + '...', CALL_STATE_DROPPED);
        }
    };

    function logCustom(evt, msg, status) {
        setTimeout(function () {
            var callback = callBackEvents[evt];
            if (callback) {
                $safeApply(function () {
                    callback({ Status: status, Reason: msg });
                });
            }
        }, 500);
    };

    var callBackEvents = {};

    //var exports = {
    self.validate = function (inputs) {
        return ValidateProperties(inputs);
    };
    self.connect = function () {
        peerWasDisconnected = false;
        socket = io.connect(options.url);
        if (socket) {
            socket.on('connect', function () {
                logCustom('connection', 'You are connected to the server.', CONNECTION_CONNECTED);
            });
            socket.on('disconnect', function () {
                CloseWebCam();
                logCustom('connection', 'You are disconnected from the server.', CONNECTION_DISCONNECTED);
            });
            socket.on('connect_error', function () {
                CloseWebCam();
                socket.disconnect();
                logCustom('connection', 'Error in connection establishment.', CONNECTION_ERROR);
            });
            socket.on('messages', function (args) {
                ProcessResponse(JSON.parse(args));
            });
        }
    };
    self.disconnect = function (data) {
        if (socket) {
            if (socket.disconnected)
                socket.emit('disconnect');
            else {
                var ival = 0;
                if (data && data.typeOfDisconnect) {
                    SendRequest('forcedisconnect', { Reason: data.typeOfDisconnect });
                    ival = 100;
                }
                setTimeout(function () {
                    socket.disconnect();
                }, ival);
            }
        }
    };
    self.setFileName = function (_name) {
        _fileName = _name;
    };
    self.getFileName = function () {
        return _fileName;
    };
    self.audiotogglelicked = function (_status) {
        if (webRtcPeer) {
            webRtcPeer.audioEnabled = _status;
        }
    };
    self.videotoggleclicked = function (_status) {
        if (webRtcPeer) {
            webRtcPeer.videoEnabled = _status;
        }
    };
    self.playrecord = function (bStop) {
        if (bStop) {
            logStatus('Please wait stopping the play...');
            SendRequest('play', { Status: 'STOP' });
        }
        else {
            logStatus('Please wait starting the play...');
            InitPlayWebRTC();
        }
    };
    self.startrecord = function (bStop) {
        var req = {
            Status: 'START'
        };

        if (bStop) {
            logStatus('Please wait stopping the recording...');
            req = {
                Status: 'STOP'
            };
        }
        else {
            logStatus('Please wait starting the recording...');
        }

        SendRequest('record', req);
    };
    self.register = function (_required) {
        requiredWebRTC = _required;
        Register();
    };
    self.on = function (eventName, callback) {
        if (callBackEvents[eventName]) {
            delete callBackEvents[eventName];
        }

        callBackEvents[eventName] = callback;
    };
    self.emit = function (eventName, data, callback) {
        var args = arguments;
        if (socket) {
            socket.emit(eventName, data, function () {
                $safeApply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
        else {
            $safeApply(function () {
                callback.apply(socket, args);
            });
        }
    };
    //};

    //this.exports;
}]);
