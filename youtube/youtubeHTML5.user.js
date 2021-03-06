// ==UserScript==
// @name        Download Videos from YouTube
// @description  Adds links to download flv, mp4 and webm from YouTube
// @include      http://www.youtube.com/watch?v=*
// @include      https://www.youtube.com/watch?v=*
// @version      2.10
// @license      GPLv3
// @author       LiuLang
// @email        gsushzhsosgsu@gmail.com
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var uw = unsafeWindow,
    log = uw.console.log,
    error = uw.console.error;


var singleFile = {
  // videos is an object containing video info.
  //
  // @title, string, video title
  // @formats, string list, format name of each video
  // @links, string list, video link
  // @msg, string 
  // @ok, bool, is ok is false, @msg will be displayed on playlist-panel
  videos: null,

  run: function(videos) {
    log('run() -- ');
    this.videos = videos;
    this.createPanel();
    this.createPlaylist();
  },

  createPanel: function() {
    log('createPanel() --');
    var panel = uw.document.createElement('div'),
        playlist = uw.document.createElement('div'),
        playlistToggle = uw.document.createElement('div');

    this.addStyle([
      '.monkey-videos-panel {',
        'position: fixed;',
        'right: 10px;',
        'bottom: 0px;',
        'z-index: 99999;',
        'border: 2px solid #ccc;',
        'border-top-left-radius: 14px;',
        'margin: 10px 0px 0px 0px;',
        'padding: 10px 10px 0px 10px;',
        'background-color: #fff;',
        'overflow-y: hidden;',
        'max-height: 90%;',
        'min-width: 100px;',
      '}',
      '.monkey-videos-panel:hover {',
        'overflow-y: auto;',
      '}',
      '.monkey-videos-panel label {',
        'margin-right: 10px;',
      '}',
      '.monkey-videos-panel .playlist-item {',
        'display: block;',
      '}',
      '.monkey-videos-panel #playlist-toggle {',
        'height: 10px;',
        'width: 100%;',
        'margin-top: 10px;',
      '}',
      '.monkey-videos-panel #playlist-toggle:hover {',
        'cursor: pointer;',
      '}',
      '.monkey-videos-panel .playlist-show {',
        'background-color: #8b82a2;',
        //'border-radius: 0px 0px 5px 5px;',
      '}',
      '.monkey-videos-panel .playlist-hide {',
        'background-color: #462093;',
        //'border-radius: 5px 5px 0px 0px;',
      '}',
    ].join(''));

    panel.className = 'monkey-videos-panel';
    uw.document.body.appendChild(panel);

    playlist= uw.document.createElement('div');
    playlist.className = 'playlist-wrap';
    panel.appendChild(playlist);

    playlistToggle = uw.document.createElement('div');
    playlistToggle.id = 'playlist-toggle';
    playlistToggle.title = '隐藏';
    playlistToggle.className = 'playlist-show';
    panel.appendChild(playlistToggle);
    playlistToggle.addEventListener('click', function(event) {
      var wrap = uw.document.querySelector(
            '.monkey-videos-panel .playlist-wrap');

      if (wrap.style.display === 'none') {
        wrap.style.display = 'block';
        event.target.className = 'playlist-show';
        event.target.title = '隐藏';
        GM_setValue('hidePlaylist', false);
      } else {
        wrap.style.display = 'none';
        event.target.title = '显示';
        event.target.className = 'playlist-hide';
        GM_setValue('hidePlaylist', true);
      }
    }, false);

    if (GM_getValue('hidePlaylist', false)) {
      playlistToggle.click();
    }
  },

  createPlaylist: function() {
    log('createPlayList() -- ');
    var playlist = uw.document.querySelector(
          '.monkey-videos-panel .playlist-wrap'),
        a,
        i;

    if (!this.videos.ok) {
      error(this.videos.msg);
      a = uw.document.createElement('span');
      a.title = this.videos.msg;
      a.innerHTML = this.videos.msg;
      playlist.appendChild(a);
      return;
    }

    for (i = 0; i < this.videos.links.length; i += 1) {
      a = uw.document.createElement('a');
      a.className = 'playlist-item';
      a.innerHTML = this.videos.title + '(' + this.videos.formats[i] + ')';
      a.title = a.innerHTML;
      a.href = this.videos.links[i];
      playlist.appendChild(a);
    }
  },

  /**
   * Create a new <style> tag with str as its content.
   * @param string styleText
   *   - The <style> tag content.
   */
  addStyle: function(styleText) {
    log('addStyle() --');
    var style = uw.document.createElement('style');
    if (uw.document.head) {
      uw.document.head.appendChild(style);
      style.innerHTML = styleText;
    }
  },
};


var monkey = {
  videoId: '',
  videoInfoUrl: '',
  videoTitle: '',
  stream: '',
  urlInfo: false,

  run: function() {
    log('run() --');
    this.getURLInfo();
    this.hideAlert();
    this.showThumb();
    this.getVideo();
  },

  /**
   * parse location.href
   */
  getURLInfo: function() {
    this.urlInfo = this.parseURI(uw.location.href);
  },

  /**
   * Show image thumb of videos.
   */
  showThumb: function() {
    log('showThumb() --');
    var imgs = uw.document.querySelectorAll('img'),
        watchMore = uw.document.querySelector('#watch-more-related'),
        img,
        i;

    if (watchMore) {
      watchMore.style.display = 'block';
    }
    for (i = 0; img = imgs[i]; i += 1) {
      if (img.hasAttribute('data-thumb')) {
        img.src = img.getAttribute('data-thumb');
      }
    } 
  }, 

  /**
   * Hide the alert info.
   */
  hideAlert: function() {
    var alerts = uw.document.querySelectorAll('.yt-alert'),
        oo = uw.document.querySelector('#oo'),
        alert,
        i;
    for (i = 0; alert = alerts[i]; i += 1) {
      alert.style.display = 'none';
    }
    if (oo) {
      oo.style.display = 'none';
    }
  },

  /**
   * Get video url info:
   */
  getVideo: function () {
    log('getVideo()--');
    var that = this;

    if (!this.urlInfo.params['v']) {
      return;
    }

    this.videoId = this.urlInfo.params['v'];
    this.videoInfoUrl = '/get_video_info?video_id=' + this.videoId;
    this.videoTitle = uw.document.title.substr(0, uw.document.title.length - 10);

    GM_xmlhttpRequest({
      method: 'GET',
      url: this.videoInfoUrl,
      onload: function(response) {
        log('xhr response: ', response);
        that.parseStream(response.responseText);
      },
    });
  },

  /**
   * Parse stream info from xhr text:
   */
  parseStream: function(rawVideoInfo) {
    log('parseStream() ---');
    var that = this;

    /**
     * Parse the stream text to Object
     */
    function _parseStream(rawStream){
      var a = decodeURIComponent(rawStream).split(',');
      return a.map(that.urlHashToObject);
    }

    this.videoInfo = this.urlHashToObject(rawVideoInfo);
    this.stream = _parseStream(this.videoInfo.url_encoded_fmt_stream_map);
    this.createUI();
  },

  /**
   * Create download list:
   */
  createUI: function() {
    log('createUI() -- ');
    log('this: ', this);
    var types = {
          'webm': 'webm',
          'mp4%': 'mp4',
          'x-fl': 'flv',
          '3gpp': '3gp',
        },
        videos = {
          title: this.videoTitle,
          formats: [],
          links: [],
          ok: true,
          msg: '',
        },
        video,
        i;

    if (this.stream.length === 0) {
      videos.ok = false;
      videos.msg = 'This video does not allowed to download';
    } else {
      for (i = 0; i < this.stream.length; i += 1) {
        video = this.stream[i];
        videos.formats.push(
            video.quality + '-' + types[video.type.substr(8, 4)]);
        videos.links.push(
          decodeURIComponent(video.url) + '&signature=' + video.sig);
      }
    }

    singleFile.run(videos);
  },

  /**
   * Parse URL hash and convert to Object.
   */
  urlHashToObject: function(hashText) {
    var list = hashText.split('&'),
        output = {},
        len = list.length,
        i = 0,
        tmp = '';

    for (i = 0; i < len; i += 1) {
      tmp = list[i].split('=')
      output[tmp[0]] = tmp[1];
    }
    return output;
  },

  /**
   * FROM: http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
   * This function creates a new anchor element and uses location
   * properties (inherent) to get the desired URL data. Some String
   * operations are used (to normalize results across browsers).
   */
  parseURI: function(url) {
    var a =  uw.document.createElement('a');
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':',''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function(){
        var ret = {},
            seg = a.search.replace(/^\?/,'').split('&'),
            len = seg.length,
            i = 0,
            s;

        for (i = 0; i< len; i += 1) {
          if (seg[i]) {
            s = seg[i].split('=');
            ret[s[0]] = s[1];
          }
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#',''),
      path: a.pathname.replace(/^([^\/])/,'/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//,'').split('/')
    };
  },
};

monkey.run();

