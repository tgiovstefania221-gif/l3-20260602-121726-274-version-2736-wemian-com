(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll(".player-frame").forEach(function (frame) {
      var video = frame.querySelector("video.movie-player");
      var overlay = frame.querySelector("[data-player-trigger]");
      var loading = frame.querySelector("[data-player-loading]");
      var error = frame.querySelector("[data-player-error]");
      var loaded = false;
      var hls = null;

      if (!video) {
        return;
      }

      function showLoading(value) {
        if (loading) {
          loading.hidden = !value;
        }
      }

      function showError(value) {
        if (error) {
          error.hidden = !value;
        }
      }

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (overlay) {
              overlay.hidden = false;
            }
          });
        }
      }

      function attach() {
        var source = video.getAttribute("data-video");
        if (!source) {
          showError(true);
          return;
        }

        if (loaded) {
          playVideo();
          return;
        }

        loaded = true;
        showError(false);
        showLoading(true);

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            showLoading(false);
            playVideo();
          }, { once: true });
          video.addEventListener("error", function () {
            showLoading(false);
            showError(true);
          }, { once: true });
          video.load();
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
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            showLoading(false);
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showLoading(false);
              showError(true);
            }
          });
          window.addEventListener("beforeunload", function () {
            if (hls) {
              hls.destroy();
            }
          }, { once: true });
          return;
        }

        showLoading(false);
        showError(true);
      }

      if (overlay) {
        overlay.addEventListener("click", function () {
          overlay.hidden = true;
          attach();
        });
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });

      video.addEventListener("click", function () {
        if (!loaded) {
          attach();
        }
      });
    });
  });
})();
