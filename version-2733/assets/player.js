document.addEventListener("DOMContentLoaded", function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame[data-video-src]"));

  frames.forEach(function (frame) {
    var video = frame.querySelector("video");
    var overlay = frame.querySelector(".player-overlay");
    var source = frame.getAttribute("data-video-src");
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = source;
      attached = true;
    }

    function beginPlayback() {
      attachSource();
      frame.classList.add("is-started");

      if (overlay) {
        overlay.setAttribute("hidden", "hidden");
      }

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          frame.classList.remove("is-started");
          if (overlay) {
            overlay.removeAttribute("hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener("play", function () {
      frame.classList.add("is-started");
      if (overlay) {
        overlay.setAttribute("hidden", "hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
});
