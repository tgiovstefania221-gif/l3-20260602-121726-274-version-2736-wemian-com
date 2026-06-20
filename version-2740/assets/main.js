(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var value = parseInt(dot.getAttribute("data-hero-dot"), 10);
          show(value);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-filter-region]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var category = scope.querySelector("[data-filter-category]");
      var status = scope.querySelector("[data-filter-status]");

      function fill(select, attr) {
        if (!select) {
          return;
        }
        var values = [];
        cards.forEach(function (card) {
          var value = card.getAttribute(attr) || "";
          if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        values.sort(function (a, b) {
          return b.localeCompare(a, "zh-CN");
        });
        values.forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      fill(region, "data-region");
      fill(year, "data-year");
      fill(type, "data-type");

      function text(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-genre") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
      }

      function run() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var categoryValue = category ? category.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var ok = true;
          if (query && text(card).indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (status) {
          status.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      [input, region, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener(control.tagName === "INPUT" ? "input" : "change", run);
        }
      });

      run();
    });
  });
})();
