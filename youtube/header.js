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

