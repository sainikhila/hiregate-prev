
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/filePhotoChange' + window.__env.minUrl
    , window.__env.baseUrl + 'factory/ng-img-crop' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("photoController",
        ['$scope', '$rootScope', 'sharedService', 'sharedMethod', 'user', '$sce',
            function ($scope, $root, $ajx, $support, $user, $sce) {

                $scope.WebCam = true;
                var canPhoto = false;
                var _actPhoto = $user.Get('Photo');
                var noPhoto = 'photo_n.jpeg';
                var keyId = 0;

                var _Candidate = false;
                var _Company = false;
                var _Contact = false;
                var _photo = '';

                if (_actPhoto.endsWith(noPhoto)) {
                    $scope.AddPhoto = true;
                }

                $root.$on("OpenPhotoForEdit", function (evt, data) {
                    $support.Hide('btnUploadPhoto');
                    $scope.WebCam = false;

                    _Candidate = data.Candidate || false;
                    _Company = data.Company || false;
                    _Contact = data.Contact || false;
                    keyId = data.KeyId || 0;
                    _photo = data.Photo || '';

                    if (_Contact)
                        _photo = $user.Get('Photo');

                    if (!$support.IsNull(_photo)) {
                        AttachExistingPhoto(_photo);
                    }

                    if (_Candidate) {
                        $support.setInnerHtml('lblText', 'Browse and select a new candidate pic.');
                        $support.setInnerHtml('photoHeader', 'Upload Candidate Pic');
                    }
                    else if (_Company) {
                        $support.setInnerHtml('lblText', 'Browse and select a new company logo.');
                        $support.setInnerHtml('photoHeader', 'Upload Company Logo');
                    }
                    else {
                        $scope.WebCam = true;
                        $support.setInnerHtml('photoHeader', 'Upload Profile Pic');
                        $support.setInnerHtml('lblText', 'Browse and select a new profile pic <br>or use your webcam to capture.');
                    }

                    $support.TriggerDialog('photo_show', false);
                });

                var video = null;
                var streamObj = null;
                var streaming = false;

                $scope.PhotoImage = '';
                $scope.CroppedImg = '';
                $scope.FromCam = false;
                $scope.FromImage = false;
                $scope.AddPhoto = false;
                $scope.filePhoto = '';

                $scope.fileNameChanged = function (evt) {
                    $scope.PhotoImage = '';
                    $scope.FromCam = false;
                    $scope.FromImage = false;

                    var file = evt.files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        $scope.$apply(function ($scope) {
                            $scope.PhotoImage = evt.target.result;// + '?v=' + $support.GetRandomNumber(11111, 99999);
                            $scope.FromImage = true;
                            $scope.AddPhoto = true;
                            $support.Show('btnUploadPhoto');
                        });
                    };
                    reader.readAsDataURL(file);
                };

                $scope.ResetValues = function (bClosing) {

                    $root.safeApply(function () {
                        $scope.PhotoImage = '';
                        $scope.CroppedImg = '';
                        $scope.FromCam = false;
                        $scope.FromImage = false;
                        $scope.filePhoto = '';
                        UnLoadCamera();
                        if (bClosing) {
                            $support.Hide('uploadStatus');
                            $support.Hide('btnUploadPhoto');
                        } else {
                            AttachExistingPhoto();
                        }
                        $support.TriggerDialog('photo_hide', false);
                    });
                };

                $scope.GetFromWebCam = function () {
                    $scope.PhotoImage = '';
                    $scope.CroppedImg = '';
                    $scope.FromCam = true;
                    $scope.FromImage = false;
                    $scope.AddPhoto = true;
                    startWebcam();
                };

                $scope.CaptureCamera = function () {

                    var width = video.videoWidth;
                    var height = video.videoHeight;

                    var canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    var context = canvas.getContext("2d");

                    context.drawImage(video, 0, 0, width, height);

                    $scope.ResetValues();

                    $scope.PhotoImage = canvas.toDataURL('image/png');
                    $scope.FromImage = true;

                    $support.Show('btnUploadPhoto');
                };

                function UnLoadCamera() {
                    onDestroy();
                    streamObj = null;
                }

                function AttachExistingPhoto(_photo) {
                    $scope.CroppedImg = _photo + '?v=' + $support.GetRandomNumber(11111, 99999);
                }

                var startWebcam = function startWebcam() {

                    var isStreaming = false;

                    navigator.getWebcam = (
                        navigator.getUserMedia || navigator.webKitGetUserMedia ||
                        navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

                    if (!navigator.mediaDevices.getUserMedia && !navigator.getUserMedia) {
                        console.log('Webcam is not supported');
                    } else {
                        var mediaConstraint = { video: true, audio: false };

                        if (navigator.mediaDevices.getUserMedia) {
                            navigator.mediaDevices.getUserMedia(mediaConstraint)
                                .then(function (stream) {
                                    streamObj = stream;
                                    video = document.getElementById('videoElement');
                                    video.srcObject = stream;
                                    video.play();
                                })
                                .catch(function (e) { console.log('The following error occured: ', e); });
                        }
                        else {
                            navigator.getWebcam(mediaConstraint,
                                function (stream) {
                                    streamObj = stream;
                                    video = document.getElementById('videoElement');
                                    video.srcObject = stream;
                                    video.play();
                                },
                                function () { console.log('The following error occured: ', e); });
                        }
                    }
                };

                function onSuccess(stream) {
                    streamObj = stream;
                    video = document.getElementById('videoElement');
                    video.srcObject = stream;
                    video.play();
                }

                var onFailure = function onFailure(err) {
                    console.log('The following error occured: ', err);
                };

                var onDestroy = function onDestroy() {
                    if (streamObj) {
                        var checker = typeof streamObj.getVideoTracks === 'function';
                        if (streamObj.getVideoTracks && checker) {
                            var tracks = streamObj.getVideoTracks();
                            if (tracks && tracks[0] && tracks[0].stop) {
                                tracks[0].stop();
                            }
                        } else if (streamObj.stop) {
                            streamObj.stop();
                        }
                    }
                    if (video) {
                        delete video.src;
                    }
                };

                var stopWebcam = function stopWebcam() {
                    onDestroy();
                };

                $scope.PhotoSubmit = function () {
                    $support.Show('uploadStatus');
                    var fd = new FormData();
                    fd.append("TypeOfDoc", 'Photos');
                    fd.append("Company", _Company);
                    fd.append("Contact", _Contact);
                    fd.append("Candidate", _Candidate);
                    fd.append("UserId", keyId);
                    fd.append("PhotoCrop", $scope.CroppedImg);
                    $ajx.UploadContents(fd, photoSubmitSuccess, photoSubmiFailed);
                };

                var photoSubmitSuccess = function photoSubmitSuccess(resp) {
                    $scope.ResetValues();

                    var rslt = resp.data.Results;
                    if (_Candidate) {
                        $root.$broadcast('CanPhotoUpdated', {
                            KeyId: keyId, Photo: rslt
                        });
                    }
                    else if (_Company) {
                        $root.$broadcast('CorporatePhotoUpdated', {
                            Photo: rslt
                        });
                    }
                    else if (_Contact) {
                        $user.Set('Photo', rslt);
                        $support.broadCastPhoto($root);
                    }

                    $support.TriggerDialog('photo_hide', false);
                };

                var photoSubmiFailed = function photoSubmiFailed(resp) {
                    alert("Error some thing goes wrong");
                };
            }]);
});
