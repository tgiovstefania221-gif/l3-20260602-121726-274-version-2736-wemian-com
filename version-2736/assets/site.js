(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function setupFilters() {
        var filterRoot = document.querySelector('[data-filter-root]');
        if (!filterRoot) {
            return;
        }
        var searchInput = filterRoot.querySelector('[data-filter-search]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var regionSelect = filterRoot.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
        var counter = document.querySelector('[data-result-counter]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (searchInput && q) {
            searchInput.value = q;
        }
        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }
        function matchSelect(cardValue, selectedValue) {
            if (!selectedValue) {
                return true;
            }
            return normalize(cardValue).indexOf(normalize(selectedValue)) !== -1;
        }
        function apply() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var selectedYear = yearSelect ? yearSelect.value : '';
            var selectedType = typeSelect ? typeSelect.value : '';
            var selectedRegion = regionSelect ? regionSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var matched = true;
                matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
                matched = matched && matchSelect(card.dataset.year, selectedYear);
                matched = matched && matchSelect(card.dataset.type, selectedType);
                matched = matched && matchSelect(card.dataset.region, selectedRegion);
                card.classList.toggle('hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (counter) {
                counter.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }
        [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.play-trigger'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var playerBox = button.closest('.player-box');
                var video = playerBox ? playerBox.querySelector('video') : null;
                var src = button.getAttribute('data-video-src');
                if (!video || !src) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                } else {
                    video.src = src;
                    video.play();
                }
                button.hidden = true;
            });
        });
    }

    ready(function () {
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
