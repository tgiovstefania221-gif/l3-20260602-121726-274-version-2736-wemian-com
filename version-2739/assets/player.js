import { H as Hls } from './hls-vendor.js';

const videos = Array.from(document.querySelectorAll('video[data-video-url]'));

videos.forEach(function (video) {
  const source = video.getAttribute('data-video-url');
  const status = document.querySelector('[data-player-status]');

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  if (!source) {
    setStatus('当前影片暂未绑定播放源');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setStatus('播放已就绪');
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('播放已就绪');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus('视频加载失败，请刷新页面重试');
      }
    });

    window.addEventListener('beforeunload', function () {
      hls.destroy();
    });
  } else {
    setStatus('当前浏览器需要支持 HLS 播放');
  }
});
