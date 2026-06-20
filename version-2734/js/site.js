(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var navToggle = qs('[data-nav-toggle]');
    var nav = qs('[data-site-nav]');
    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    qsa('[data-dropdown-button]').forEach(function (button) {
        var panel = button.parentElement.querySelector('[data-dropdown-panel]');
        if (panel) {
            button.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }
    });

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;
        var show = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        var list = panel.parentElement.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var category = panel.querySelector('[data-filter-category]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var sortMode = params.get('sort') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        var items = qsa('.movie-card', list);
        if (sortMode === 'year') {
            items.sort(function (a, b) {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }).forEach(function (item) {
                list.appendChild(item);
            });
        }
        var run = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var categoryValue = category ? category.value : '';
            items.forEach(function (item) {
                var haystack = [
                    item.dataset.title,
                    item.dataset.category,
                    item.dataset.region,
                    item.dataset.type,
                    item.dataset.year,
                    item.dataset.tags
                ].join(' ').toLowerCase();
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !yearValue || item.dataset.year === yearValue;
                var matchedCategory = !categoryValue || item.dataset.category === categoryValue;
                item.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedCategory));
            });
        };
        [input, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', run);
                control.addEventListener('change', run);
            }
        });
        run();
    });
})();

function setupMoviePlayer(videoId, url) {
    var video = document.getElementById(videoId);
    var button = document.querySelector('[data-player-start="' + videoId + '"]');
    var ready = false;
    if (!video) {
        return;
    }
    var attach = function () {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    };
    var start = function () {
        attach();
        if (button) {
            button.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    };
    if (button) {
        button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (!ready) {
            start();
        }
    });
}
