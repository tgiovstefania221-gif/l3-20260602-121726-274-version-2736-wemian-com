(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupLocalFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var list = document.querySelector("[data-filter-list]");
      if (!input || !list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.hidden = keyword && haystack.indexOf(keyword) === -1;
        });
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.siteCatalog) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");

    if (input) {
      input.value = query;
    }

    function render(list, keyword) {
      if (title) {
        title.textContent = keyword ? "搜索：" + keyword : "推荐内容";
      }
      results.innerHTML = list.slice(0, 120).map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
          '    <figure class="poster-wrap">',
          '      <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '      <figcaption>',
          '        <span>' + escapeHtml(movie.category) + '</span>',
          '        <small>' + escapeHtml(movie.year) + '</small>',
          '      </figcaption>',
          '    </figure>',
          '    <div class="card-content">',
          '      <h2>' + escapeHtml(movie.title) + '</h2>',
          '      <p>' + escapeHtml(movie.oneLine) + '</p>',
          '      <div class="card-meta">',
          '        <span>' + escapeHtml(movie.region) + '</span>',
          '        <span>' + escapeHtml(movie.genre) + '</span>',
          '      </div>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join("");
      }).join("");
    }

    function runSearch(keyword) {
      var cleanKeyword = normalize(keyword);
      if (!cleanKeyword) {
        render(window.siteCatalog.slice(0, 36), "");
        return;
      }
      var filtered = window.siteCatalog.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.genre,
          movie.tags,
          movie.year,
          movie.category,
          movie.oneLine
        ].join(" "));
        return haystack.indexOf(cleanKeyword) !== -1;
      });
      render(filtered, keyword);
    }

    runSearch(query);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-stream-url]"));
    videos.forEach(function (video) {
      var trigger = document.querySelector('[data-video-trigger="' + video.id + '"]');
      var loaded = false;
      var hlsInstance = null;

      function startVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function loadAndPlay() {
        var streamUrl = video.getAttribute("data-stream-url");
        if (!streamUrl) {
          return;
        }

        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startVideo);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", startVideo, { once: true });
            video.load();
          } else {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", startVideo, { once: true });
            video.load();
          }
          loaded = true;
        } else {
          startVideo();
        }

        if (trigger) {
          trigger.classList.add("hidden");
        }
      }

      if (trigger) {
        trigger.addEventListener("click", loadAndPlay);
      }

      video.addEventListener("click", function () {
        if (!loaded) {
          loadAndPlay();
          return;
        }
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener("play", function () {
        if (trigger) {
          trigger.classList.add("hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
