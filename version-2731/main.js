(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        function onScroll() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 16);
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                document.body.classList.toggle("menu-open");
                panel.classList.toggle("is-open");
            });
        }
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }

        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(idx);
                start();
            });
        });

        show(0);
        start();
    }

    function initFiltering() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.closest("main") || document;
            var input = panel.querySelector("[data-search-box]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var activeValue = "";

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }

            function matches(card, query, value) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var okText = !query || haystack.indexOf(query) !== -1;
                var okValue = !value || haystack.indexOf(normalize(value)) !== -1;
                return okText && okValue;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    card.hidden = !matches(card, query, activeValue);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeValue = chip.getAttribute("data-filter-value") || "";
                    apply();
                });
            });

            apply();
        });
    }

    window.initializePlayer = function (src) {
        var video = document.getElementById("moviePlayer");
        var layer = document.querySelector("[data-play-layer]");
        if (!video || !src) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var started = video.play();
            if (started && typeof started.catch === "function") {
                started.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initHeader();
        initHero();
        initFiltering();
    });
})();
