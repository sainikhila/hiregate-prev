//form floating label
$(function () {
    var onClass = "on";
    var showClass = "show";

    $("input, select")
        .bind("checkval", function () {
            var label = $(this).prev("labelreg");

            if (this.value !== "")
                label.addClass(showClass);

            else
                label.removeClass(showClass);
        })
        .on("keyup", function () {
            $(this).trigger("checkval");
        })
        .on("focus", function () {
            $(this).prev("labelreg").addClass(onClass);
        })
        .on("blur", function () {
            $(this).prev("labelreg").removeClass(onClass);
        })
        .trigger("checkval");

    $("select")
        .on("change", function () {
            var $this = $(this);

            if ($this.val() === "")
                $this.addClass("watermark");
            else if ($this.val() === "Status")
                $this.addClass("watermark");
            else if (parseInt($this.val()) === 0)
                $this.addClass("watermark");
            else
                $this.removeClass("watermark");

            $this.trigger("checkval");
        })
        .change();
});

/* show hide forgot password*/
function HideDiv(d) { document.getElementById(d).style.display = "none"; }
function ShowDiv(d) { document.getElementById(d).style.display = "block"; }
function ShowHideDiv(d, _display) {
    var style = _display ? 'block' : 'none';
    document.getElementById(d).style.display = style;
}

/*Drop Menu Navigation*/
$(document).ready(function () {
    $(document).on("click", ".menuname, #dropmenu_name, #dropmenu_arrow", function (event) {
        event.stopPropagation();
        $('.touchmenu').slideToggle(1000);
    });

});
$(document).on('click', function () {
    $('.touchmenu').hide(1000);
});

//My Session Toggle Block
function showOneBlock(thechosenone) {
    var toggleBlock = document.getElementsByTagName("div");
    for (var x = 0; x < toggleBlock.length; x++) {
        name = toggleBlock[x].getAttribute("class");
        if (name == 'childBlock') {
            if (toggleBlock[x].id == thechosenone) {
                if (toggleBlock[x].style.display == 'block') {
                    toggleBlock[x].style.display = 'none';
                }
                else {
                    toggleBlock[x].style.display = 'block';
                }
            } else {
                toggleBlock[x].style.display = 'none';
            }
        }
    }
}

//tooltip hint
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            oldonload();
            func();
        }
    }
}

function prepareInputsForHints() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        // test to see if the hint span exists first
        if (inputs[i].parentNode.getElementsByTagName("span")[0]) {
            // the span exists!  on focus, show the hint
            inputs[i].onfocus = function () {
                this.parentNode.getElementsByTagName("span")[0].style.display = "inline";
            }
            // when the cursor moves away from the field, hide the hint
            inputs[i].onblur = function () {
                this.parentNode.getElementsByTagName("span")[0].style.display = "none";
            }
        }
    }
    // repeat the same tests as above for selects
    var selects = document.getElementsByTagName("select");
    for (var k = 0; k < selects.length; k++) {
        if (selects[k].parentNode.getElementsByTagName("span")[0]) {
            selects[k].onfocus = function () {
                this.parentNode.getElementsByTagName("span")[0].style.display = "inline";
            }
            selects[k].onblur = function () {
                this.parentNode.getElementsByTagName("span")[0].style.display = "none";
            }
        }
    }
}
addLoadEvent(prepareInputsForHints);

function gotoElement(eID) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for (var i = startY; i < stopY; i += step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        } return;
    }
    for (var i = startY; i > stopY; i -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }
};

function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
};

function elmYPosition(eID) {
    var elm = document.getElementById(eID);

    if (!elm) return 0;

    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent !== document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    }
    return y;
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}