(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindImageFallback() {
    selectAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      });
    });
  }

  function bindMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function bindCatalogFilter() {
    var input = document.querySelector("[data-filter-input]");
    var sort = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");

    if (!grid) {
      return;
    }

    var cards = selectAll("[data-filter-card]", grid);

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visibleCards = [];

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;

        if (matched) {
          visibleCards.push(card);
        }
      });

      var mode = sort ? sort.value : "hot";
      visibleCards.sort(function (a, b) {
        if (mode === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }

        if (mode === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }

        if (mode === "title") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }

        return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
      });

      visibleCards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (sort) {
      sort.addEventListener("change", applyFilter);
    }

    applyFilter();
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + safeText(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster\" href=\"" + safeText(item.link) + "\" aria-label=\"" + safeText(item.title) + "\">",
      "<img src=\"" + safeText(item.cover) + "\" alt=\"" + safeText(item.title) + "\" loading=\"lazy\">",
      "<span class=\"play-chip\">播放</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"meta-row\"><span>" + safeText(item.year) + "</span><span>" + safeText(item.region) + "</span><span>" + safeText(item.type) + "</span></div>",
      "<h2><a href=\"" + safeText(item.link) + "\">" + safeText(item.title) + "</a></h2>",
      "<p>" + safeText(item.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function bindSearchPage() {
    if (!document.body || !document.body.hasAttribute("data-search-page")) {
      return;
    }

    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var summary = document.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var allMovies = window.SEARCH_MOVIES || [];

    if (input) {
      input.value = query;
    }

    if (!results) {
      return;
    }

    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      results.innerHTML = allMovies.slice(0, 24).map(createSearchCard).join("");
      if (title) {
        title.textContent = "推荐影片";
      }
      if (summary) {
        summary.textContent = "可以通过上方搜索框继续查找片名、地区、年份、类型或标签。";
      }
      bindImageFallback();
      return;
    }

    var matches = allMovies.filter(function (item) {
      var haystack = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" ").toLowerCase();
      return haystack.indexOf(normalized) !== -1;
    });

    if (title) {
      title.textContent = "“" + query + "”的搜索结果";
    }

    if (summary) {
      summary.textContent = matches.length ? "已找到相关影片，点击卡片进入详情页。" : "没有找到匹配影片，可以尝试更换关键词。";
    }

    results.innerHTML = matches.slice(0, 120).map(createSearchCard).join("");
    bindImageFallback();
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }

      var existing = document.querySelector("script[data-hls-loader]");

      if (existing) {
        existing.addEventListener("load", resolve);
        existing.addEventListener("error", reject);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-loader", "true");
      script.addEventListener("load", resolve);
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  }

  function initMoviePage(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var starter = document.querySelector("[data-player-start]");
    var attached = false;

    if (!video || !starter || !videoUrl) {
      return;
    }

    function attachAndPlay() {
      starter.classList.add("is-hidden");
      video.setAttribute("controls", "controls");

      if (!attached) {
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else {
          loadHlsLibrary().then(function () {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hls.loadSource(videoUrl);
              hls.attachMedia(video);
            } else {
              video.src = videoUrl;
            }
          }).then(function () {
            video.play().catch(function () {});
          }).catch(function () {
            video.src = videoUrl;
            video.play().catch(function () {});
          });
          return;
        }
      }

      video.play().catch(function () {});
    }

    starter.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
  }

  window.initMoviePage = initMoviePage;

  document.addEventListener("DOMContentLoaded", function () {
    bindMobileNav();
    bindHero();
    bindCatalogFilter();
    bindSearchPage();
    bindImageFallback();
  });
})();
