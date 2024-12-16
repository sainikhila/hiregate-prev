$(function () {

    var languageId = 0;
    var languageItem = '';
    var LanguagesPack = [];
    var codeCanSubmit = false;
    var challengeId = 0;
    var httpUrl = 'https://18.138.148.146:8086';
    httpUrl = 'https://localhost:8086';

    function SetSelectedLanguage(id) {
        languageItem = '';
        languageId = id;

        var item = GetPackItem(LanguagesPack, languageId);
        if (item) {
            languageItem = item;
            SetText('languageText', item.Name);
        }

        InitCodeEditor();
    }

    function GetPackItem(arrItems, keyId) {
        var vItem = undefined;
        $.each(arrItems, function (key, value) {
            if (value.Id === keyId) {
                vItem = value;
            }
        });
        return vItem;
    }

    function AjaxGetJsonFile(jsonfile, successFunction, errorFunction) {
        setTimeout(function () {
            $.get(jsonfile).then(function (response) {
                if (successFunction)
                    successFunction(response);
            }), function (response) {
                if (errorFunction)
                    errorFunction(response);
            };
        }, 1000);
    }


    function LoadCodingDetails() {
        ShowDiv('btnCodeSubmit');
        start();
        var keyId = getUrlVars('id');
        var url = httpUrl + '/api/common/GetCodeChallenge?id=' + keyId;

        $.get(url).then(function (res) {

            if (parseInt(res.status) === 200) {
                var rslts = res.Results;
                challengeId = keyId;
                SetText('companyText', rslts.Item1);
                SetText('questionText', rslts.Item3);
                GetCodingLanguages(parseInt(rslts.Item2));
            } else {
                HideDiv('btnCodeSubmit');
                stop();
            }
        }), function (res) {
            stop();
            console.log(res);
        };
    }

    function getUrlVars(idName) {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars[idName];
    }

    function GetCodingLanguages(keyId) {
        LanguagesPack = [];
        AjaxGetJsonFile('js/data/languages.json',
            function (res) {
                LanguagesPack = res;
                SetSelectedLanguage(keyId);
            }, function (err) {
                //ConnectionError(msg_error_language_pack);
                stop();
            });
    }

    function IsNull(eVal) {
        if (eVal === undefined || eVal === '' || eVal === null) {
            return true;
        }
        return false;
    }

    function loadScript(url, type, charset) {
        if (type === undefined) type = 'text/javascript';
        if (url) {
            var script = document.querySelector("script[src*='" + url + "']");
            if (!script) {
                var heads = document.getElementsByTagName("head");
                if (heads && heads.length) {
                    var head = heads[0];
                    if (head) {
                        script = document.createElement('script');
                        script.setAttribute('src', url);
                        script.setAttribute('type', type);
                        if (charset) script.setAttribute('charset', charset);
                        head.appendChild(script);
                    }
                }
            }
            return script;
        }
    }

    var lastScripts = [];

    function InitCodeEditor() {
        if (!IsNull(languageItem)) {

            loadCodeScripts(languageItem, function () {
                ReloadCodeEditor();
            });
        }
    }

    function loadCodeScripts(items, callback) {
        $.each(lastScripts, function (key, value) {
            $("script[src='" + value + "']").remove();
        });

        $.each(items.Scripts, function (key, value) {
            var src = '/js/src/scripts/codeeditor/modes/' + value;
            lastScripts.push(src);
            loadScript(src, 'text/javascript', 'utf-8');
        });
        setTimeout(function () {
            callback();
        }, 500);
    }

    function ReloadCodeEditor() {
        RemoveElements();
        if (!IsNull(languageItem)) {
            ReloadScopeCodeMirror(languageItem.Mode);
        }
    }

    function RemoveElements() {
        var elm = document.getElementsByClassName('CodeMirror');
        if (elm && elm.length > 0) {
            $('CodeMirror').remove();
        }
    }

    var editor = null;
    function ReloadScopeCodeMirror(modetype) {

        for (var n = 0; n < 2; n++) {
            setTimeout(function () {
                AttachCodeMirror();
            }, 1000);
        }

        setTimeout(function () {
            editor = CodeMirror.fromTextArea(document.getElementById("codeeditor"), {
                lineNumbers: true,
                mode: modetype,
                indentUnit: 0
            });
            codeCanSubmit = true;
            stop();
            //SetDisabled('btnSubmit', false);
        }, 1000);
    }

    function SetText(inputId, val) {
        var bgWait = document.getElementById(inputId);
        if (bgWait) {
            bgWait.textContent = val;
        }
    }

    function SetDisabled(elmId, bBool) {
        if (bBool) {
            $('#' + elmId).attr('disabled', 'disabled');
        }
        else {
            $('#' + elmId).removeAttr('class');
        }
    }

    function HideDiv(d) { document.getElementById(d).style.display = "none"; }
    function ShowDiv(d) { document.getElementById(d).style.display = "block"; }

    $(document).on("click", "#btnCodeSubmit", function (event) {
        if (codeCanSubmit) {
            ShowDiv('popConfirmEndTest');
        }
    });

    $(document).on("click", "#btnSubmitCode", function (event) {

        var codeText = '';

        if (editor) {
            codeText = editor.doc.getValue();
			codeText = JSON.stringify(codeText);
        }
        var data = {
            Id: challengeId,
            Text: codeText
        };

        var url = httpUrl + '/api/common/SetCodeChallenge';

        $.post(url, data).then(function (res) {
            HideDiv('popConfirmEndTest');
            window.location.href = 'thankyou.html';
        }), function (res) {
            HideDiv('popConfirmEndTest');
            LoadCodingDetails();
        };

    });

    $(document).on("click", "#btnSubmitCancel", function (event) {
        HideDiv('popConfirmEndTest');
    });

    function start() {
        var ProgressBar = document.getElementById('loader_disable_bg');
        if (ProgressBar) {
            ProgressBar.style['display'] = 'block';
        }
    }

    function stop() {
        setTimeout(function () {
            var ProgressBar = document.getElementById('loader_disable_bg');
            if (ProgressBar) {
                ProgressBar.style['display'] = 'none';
            }
        }, 1000);
    }

    codeCanSubmit = false;
    //SetDisabled('btnSubmit', true);

    LoadCodingDetails();
});