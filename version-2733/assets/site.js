document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  var localFilter = document.querySelector("[data-local-filter]");
  var filterGrid = document.querySelector("[data-filter-grid]");
  var emptyState = document.querySelector("[data-empty-state]");

  if (localFilter && filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-filter-card]"));

    localFilter.addEventListener("input", function () {
      var query = localFilter.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? "none" : "block";
      }
    });
  }

  var globalSearch = document.querySelector("[data-global-search]");
  var searchResults = document.querySelector("[data-search-results]");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[character];
    });
  }

  if (globalSearch && searchResults && Array.isArray(window.MOVIE_INDEX)) {
    globalSearch.addEventListener("input", function () {
      var query = globalSearch.value.trim().toLowerCase();
      searchResults.innerHTML = "";

      if (!query) {
        return;
      }

      var matches = window.MOVIE_INDEX.filter(function (movie) {
        return movie.search.indexOf(query) !== -1;
      }).slice(0, 24);

      if (!matches.length) {
        searchResults.innerHTML = '<p class="empty-state" style="display:block;grid-column:1/-1;">没有找到相关影片</p>';
        return;
      }

      var html = matches.map(function (movie) {
        var title = escapeHtml(movie.title);
        var category = escapeHtml(movie.category);
        var desc = escapeHtml(movie.desc);
        var meta = escapeHtml(movie.meta);
        var url = escapeHtml(movie.url);
        var cover = escapeHtml(movie.cover);

        return [
          '<a class="movie-card movie-card-compact" href="' + url + '">',
          '  <span class="poster-wrap">',
          '    <img src="' + cover + '" alt="' + title + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="poster-badge">' + category + '</span>',
          '  </span>',
          '  <span class="movie-card-body">',
          '    <strong>' + title + '</strong>',
          '    <span class="movie-card-desc">' + desc + '</span>',
          '    <span class="movie-card-meta">' + meta + '</span>',
          '  </span>',
          '</a>'
        ].join("");
      }).join("");

      searchResults.innerHTML = html;
    });
  }
});
