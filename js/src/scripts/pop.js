//POP Up Screen
$(function () {
    var mHeight = $(window).height();
    var popHeight = $(window).height();
    var mWidth = $(window).width();
    var popWidth = $(window).width();
    var tc_bg = $(document.createElement('div')).addClass('tc_bg'), closeFn;

    function removeElement(_tcbg) {
        var elm = document.getElementsByClassName(_tcbg);
        if (elm && elm.length > 0) {
            $("." + _tcbg).remove();
        }
    };

    function AddTcBg(_tcbg) {

        var _tcbgs = ['tc_bg', 'tc_bg1'];

        for (var i = 0; i < _tcbgs.length; i++) {
            removeElement(_tcbgs[i]);
        }

        tc_bg = $(document.createElement('div')).addClass(_tcbg);
        $("body").append(tc_bg);
        tc_bg.click(closeFn);
    }

    $(document).on("click", ".signin_show2", function () {
        if (mHeight < popHeight) {
            $(".signin_pop").css({ position: "absolute", "margin-top": "0" });
            $(".signin_pop").animate({ top: '0' }, "slow");
        } else {
            $(".signin_pop").animate({ top: '70px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".signin_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    $(document).on("click", ".demo_show2", function () {
        if (mHeight < popHeight) {
            $(".demo_pop").css({ position: "absolute", "margin-top": "0" });
            $(".demo_pop").animate({ top: '0' }, "slow");
        } else {
            $(".demo_pop").animate({ top: '70px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".demo_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //Upload Photo Pop
    $(document).on("click", ".photo_show", function () {
        if (mHeight < popHeight) {
            $(".photo_pop").css({ position: "absolute", "margin-top": "0" });
            $(".photo_pop").animate({ top: '0' }, "slow");
        } else {
            $(".photo_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".photo_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    $(document).on("click", ".photo_hide", closeFn = function (e) {
        if (e.target !== this) return;
        var popHeight2 = popHeight + 500;
        $(".photo_pop").animate({ top: "-" + popHeight2 }, "100", function () { $(".tc_bg, .tc_bg1").remove(); });
    });

    //Change Password
    $(document).on("click", ".pswd_show2", function () {
        if (mHeight < popHeight) {
            $(".pswd_pop").css({ position: "absolute", "margin-top": "0" });
            $(".pswd_pop").animate({ top: '0' }, "slow");
        } else {
            $(".pswd_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".pswd_pop").css({ left: "0", "margin-left": "0" });
        }

        AddTcBg('tc_bg');
    });

    //OTP
    $(document).on("click", ".otp_show", function () {
        if (mHeight < popHeight) {
            $(".otp_pop").css({ position: "absolute", "margin-top": "0" });
            $(".otp_pop").animate({ top: '0' }, "slow");
        } else {
            $(".otp_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".otp_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //System Health
    $(document).on("click", ".health_show", function () {
        if (mHeight < popHeight) {
            $(".health_pop").css({ position: "absolute", "margin-top": "0" });
            $(".health_pop").animate({ top: '0' }, "slow");
        } else {
            $(".health_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".health_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //Notifications
    $(document).on("click", ".alert_show", function () {
        if (mHeight < popHeight) {
            $(".alert_pop").css({ position: "absolute", "margin-top": "0" });
            $(".alert_pop").animate({ top: '0' }, "slow");
        } else {
            $(".alert_pop").animate({ top: '70px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".alert_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });
    
    //JD & Can Profile
    $(document).on("click", ".JD_show", function () {
        if (mHeight < popHeight) {
            $(".JD_pop").css({ position: "absolute", "margin-top": "0" });
            $(".JD_pop").animate({ top: '0' }, "slow");
        } else {
            $(".JD_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".JD_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //JD Can Profile
    $(document).on("click", ".JD_can_show", function () {
        if (mHeight < popHeight) {
            $(".JD_Can_pop").css({ position: "absolute", "margin-top": "0" });
            $(".JD_Can_pop").animate({ top: '0' }, "slow");
        } else {
            $(".JD_Can_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".JD_Can_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //Employee Profile
    $(document).on("click", ".employee_show", function () {
        if (mHeight < popHeight) {
            $(".employee_pop").css({ position: "absolute", "margin-top": "0" });
            $(".employee_pop").animate({ top: '0' }, "slow");
        } else {
            $(".employee_pop").animate({ top: '90px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".employee_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    //Member Rating FI
    $(document).on("click", ".rateFI_show", function () {
        if (mHeight < popHeight) {
            $(".rateFI_pop").css({ position: "absolute", "margin-top": "0" });
            $(".rateFI_pop").animate({ top: '0' }, "slow");
        } else {
            $(".rateFI_pop").animate({ top: '70px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".rateFI_pop").css({ left: "0", "margin-left": "0" });
        }
        AddTcBg('tc_bg');
    });

    $(document).on("click", ".videointerview_show", function () {
        $('body').css('overflow-y', 'hidden');
        if (mHeight < popHeight) {
            $(".videointerview_pop").css({ position: "absolute", "margin-top": "0" });
            $(".videointerview_pop").animate({ top: '0' }, "slow");
        } else {
            $(".videointerview_pop").animate({ top: '0px' }, "slow");
        }
        if (mWidth < popWidth) {
            $(".videointerview_pop").css({ left: "0", "margin-left": "0" });
        }
    });

    $(document).on("click", ".pop_closeBtn, .pop_closeBtn_alert, .pop_closeBtn_w700, .pop_closeBtn_w700_left20, .pop_closeBtn_rightTop, .pop_closeBtn_rTop, .pop_closeBtn_generic", closeFn = function (e) {
        if (e.target !== this) return;
        var popHeight2 = popHeight + 500;
        $(".signin_pop,.photo_pop,.pswd_pop,.otp_pop,.health_pop,.alert_pop,.JD_pop,.JD_Can_pop,.employee_pop,.rateFI_pop,.demo_pop").animate({ top: "-" + popHeight2 }, "100", function () { $(".tc_bg, .tc_bg1").remove(); });
    });
    $(document).on("click", ".pop_closeBtn_vi", function (event) {
        var popHeight2 = popHeight + 500;
        $(".videointerview_pop").animate({ top: "-" + popHeight2 }, "100", function () { $(".tc_bg").remove(); });
        $('body').css('overflow-y', 'auto');
    });
});


/*Popup for multiple selection*/
function pop(div) {
    if (document.getElementById(div))
        document.getElementById(div).style.display = 'block';
}
function hide(div) {
    if (document.getElementById(div))
        document.getElementById(div).style.display = 'none';
}

//To detect escape button
document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode === 27) {
        hide('popRandomManualDiv'), hide('popSystemCheckDiv');
    }
};