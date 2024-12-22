(function (window) {
    window.__env = window.__env || {};


    var _host = window.location.hostname;
    var _port = window.location.port || 0;

    // API url
    window.__env.apiUrl = 'https://api.hiregate.in';

    // Media url
    window.__env.mediaUrl = 'https://media.videotok.com';

    if (_port > 0) {
        // API url
        window.__env.apiUrl = 'https://localhost:5000';

        // Media url
        window.__env.mediaUrl = 'https://' + _host + ':8443';
    }

    window.__env.apiUrl = 'http://localhost:5000';

    // Base url
    window.__env.baseUrl = 'src/';

    // file type
    window.__env.minUrl = '';
}(this));