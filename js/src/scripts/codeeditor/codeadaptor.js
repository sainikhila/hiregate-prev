var editor = null;

function reloadCodeMirror(modetype) {

    setTimeout(function () {
        AttachCodeMirror();

        editor = CodeMirror.fromTextArea(document.getElementById("codeeditor"), {
            lineNumbers: true,
            mode: modetype
        });

        function getSelectedRange() {

            var selectedText = editor.getSelection();
            var textSelected = false;

            if (selectedText && selectedText !== '') {
                textSelected = true;
            }

            var from = editor.getCursor(true);
            var to = editor.getCursor(false);

            var caret = {
                selected: textSelected,
                from: {
                    ch: from.ch,
                    line: from.line,
                },
                to: {
                    ch: to.ch,
                    line: to.line,
                }
            };

            return caret;
        };

        editor.on('mousedown', function (editor, event) {
            console.log(event);
            sendKeyStrokes(event);
        });

        editor.on('keydown', function (editor, event) {
            sendKeyStrokes(event);
        });

        editor.on('dblclick', function (editor, event) {
            sendKeyStrokes(event);
        });

        editor.on('keyup', function (editor, event) {
            sendKeyStrokes(event);
        });

        function sendKeyStrokes(event) {

            var keycode = event.keyCode || event.type;
            var caret = {
                key: event.key,
                keyCode: keycode,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                range: getSelectedRange()
            };

            console.log(caret);
        };

    }, 1000);

}

function setInputValue(targetId, inputId, inputVal) {
    var scope = angular.element($("#" + inputId)).scope();
    scope.$apply(function () {
        scope[targetId] = inputVal;
    });
}

function ShowSelectionInsideTextarea() {
    //var selectedText = editor.getSelection();
    //alert("You selected: " + selectedText);
}

function setCodeEditorValue(content) {
    if (editor) {
        if (content) {
            editor.setValue(content);
        }
        else {
            editor.setValue(" ");
        }
    }
};
