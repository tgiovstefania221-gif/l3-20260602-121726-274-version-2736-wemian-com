(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (next) {
            slides[current].classList.remove('active');
            if (dots[current]) {
                dots[current].classList.remove('active');
            }
            current = next;
            slides[current].classList.add('active');
            if (dots[current]) {
                dots[current].classList.add('active');
            }
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide((current + 1) % slides.length);
        }, 5200);
    }

    var searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot) {
        var input = searchRoot.querySelector('[data-search-input]');
        var yearSelect = searchRoot.querySelector('[data-filter-year]');
        var typeSelect = searchRoot.querySelector('[data-filter-type]');
        var regionSelect = searchRoot.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-title]'));
        var empty = searchRoot.querySelector('[data-empty-state]');
        var filter = function () {
            var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && card.dataset.year !== year) {
                    matched = false;
                }
                if (type && card.dataset.type.indexOf(type) === -1) {
                    matched = false;
                }
                if (region && card.dataset.region.indexOf(region) === -1) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };
        [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
        filter();
    }
})();
