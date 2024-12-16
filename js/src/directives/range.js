var app = angular.module('Range', []);
app.filter('range', function () {

    function addLeadingZeros(n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = '' + num;
        while (num.length < len) {
            num = '0' + num;
        }
        return num;
    };

    return function (input, options) {
        
        var useMonth = options.month || false;
        var useFullMonth = options.fullmonth || false;
        var chars = options.chars || '';
        var reverse = options.reverse || false;
        var twodigit = options.twodigit || false;
        var min = parseInt(options.min);

        var dDate = new Date();

        var max = parseInt(options.max);

        if (max === 0) {
            max = new Date().getFullYear();
        }

        if (useFullMonth) useMonth = false;

        var ShortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        var LongMonths = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        for (var i = min; i <= max; i++) {

            var vText = i + chars;
            if (twodigit) {
                vText = addLeadingZeros(i,2) + chars;
            }

            if (useMonth) {
                vText = ShortMonths[i - 1];
            }

            if (useFullMonth) {
                vText = LongMonths[i - 1];
            }

            var item = {
                Value: i,
                Text: vText
            };
            input.push(item);
        }

        var reverses = [];

        if (reverse) {
            for (var k = input.length - 1; k > -1; k--) {
                reverses.push(input[k]);
            }

            input = reverses;
        }

        return input;
    };
});
