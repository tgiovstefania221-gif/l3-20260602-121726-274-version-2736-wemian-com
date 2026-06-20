(function () {
    var hlsPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function attachSource(video, source) {
        if (video.dataset.ready === '1') {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = '1';
            return Promise.resolve();
        }
        return loadHlsScript().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.dataset.ready = '1';
                return;
            }
            video.src = source;
            video.dataset.ready = '1';
        });
    }

    function setupPlayer(frame) {
        var video = frame.querySelector('video[data-source]');
        var button = frame.querySelector('[data-play-button]');
        if (!video) {
            return;
        }
        var start = function () {
            var source = video.dataset.source;
            if (!source) {
                return;
            }
            attachSource(video, source).then(function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            });
        };
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-frame]')).forEach(setupPlayer);
    });
})();
