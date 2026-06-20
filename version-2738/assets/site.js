(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearchPage() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var lower = query.toLowerCase();
    $all('[data-search-term]').forEach(function (input) {
      input.value = query;
    });

    if (document.body.dataset.page !== 'search') {
      return;
    }

    var heading = $('[data-search-title]');
    var empty = $('[data-empty-state]');
    var cards = $all('[data-search-index]');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search-index') || '';
      var matched = !lower || haystack.indexOf(lower) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (heading && query) {
      heading.textContent = '“' + query + '”相关影片';
    }

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function setupPlayers() {
    $all('.movie-player').forEach(function (player) {
      var video = $('video', player);
      var overlay = $('.player-overlay', player);
      var message = $('.player-message', player);
      var source = player.getAttribute('data-video-url');
      var hls = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function prepare() {
        if (!video || !source || player.dataset.ready === 'true') {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              setMessage('播放暂时无法启动，请稍后再试');
            }
          });
        } else {
          video.src = source;
        }

        player.dataset.ready = 'true';
      }

      function play() {
        prepare();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove('is-playing');
            setMessage('点击播放器即可开始观看');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      player.addEventListener('click', function (event) {
        if (event.target === video || event.target === player) {
          play();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function setupSmoothAnchors() {
    $all('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = $(link.getAttribute('href'));
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchPage();
    setupPlayers();
    setupSmoothAnchors();
  });
})();
