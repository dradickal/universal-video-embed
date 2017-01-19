// JavaScript source code
(function (global, document, log, xhr) {
    'use strict';

    /*********************
     * YouTubeReadyList:
     * Saves list of calls to newYTEmbed when injecting YT api onto page.
     * Using Array allows for multiple EmbedVideos to be created on a page
     *********************/
    var YouTubeReadyList = [];

    function EmbedVideo() {
        this.type = "";
        this.wrapperId = "videoWrapper";
        this.playerId = "player";
        this.embedURL = "";
        this.player = {};
        this.vimeoData = {};
    };

    EmbedVideo.prototype = {
        /*********************
         * urlReg:
         * RegEx will match the following URL structures:
         *  https://vimeo.com/76979871
         *  https://youtu.be/xOOWk5yCMMs
         *********************/
        urlReg: /(http:\/\/|https:\/\/)(vimeo\.com|youtu\.be)\/([\w\/]+)([\?].*)?$/i,
        idReg: /(-\d+)$/i,

        init: function (url, id) {
            if (!this.urlReg.test(url)) {
                return false;
            }

            this.wrapperId = id || this.wrapperId;
            this.embedURL = url || this.embedURL;

            if (this.idReg.test(this.wrapperId)) {
                var wrapReg = this.idReg.exec(this.wrapperId);
                this.playerId += wrapReg[1];
            }

            if (url.includes('youtu')) {
                this.type = "YouTube";
                if (global.YT) {
                    global.YT.ready(this.newYTEmbed.bind(this));
                } else {
                    if (YouTubeReadyList.length === 0) {
                        this.addYouTubeAPI();
                    }
                    YouTubeReadyList.push(this.newYTEmbed.bind(this));
                }
            }

            if (url.includes('vimeo')) {
                this.type = "Vimeo";
                this.loadVimeoData()
                    .then(this.newVimeoEmbed.bind(this));
            }
        },

        addYouTubeAPI: function () {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        },

        newYTEmbed: function () {
            this.player = new global.YT.Player(this.playerId, {
                height: '390',
                width: '640',
                videoId: this.getYTVideoId(),
                events: {
                    //'onReady': ,
                    //'onStateChange':
                }
            });
        },

        getYTVideoId: function () {
            if (!this.type === "YouTube") {
                return false;
            }

            var urlArr = this.urlReg.exec(this.embedURL);
            return urlArr[3];
        },

        loadVimeoData: function () {
            var self = this;
            //TODO: replace with xhr script
            return $.ajax({
                dataType: "jsonp",
                url: "https://www.vimeo.com/api/oembed.json",
                data: { url: this.embedURL, byline: false, portrait: false, title: false }
            })
                .then(function (returnData) {
                    self.vimeoData = returnData;
                });
        },

        newVimeoEmbed: function () {
            var html = this.vimeoData.html;
            var target = document.getElementById(this.wrapperId);
            target.innerHTML = html;
            target.firstChild.setAttribute('id', this.playerId);
        }
    };

    var LRE = global.LRE = {};
    LRE.EmbedVideo = EmbedVideo;
    LRE.YouTubeReadyList = YouTubeReadyList;

    global.onYouTubeIframeAPIReady = function () {
        var len = LRE.YouTubeReadyList.length;
        for (var i = 0; i < len; i++) {
            try {
                LRE.YouTubeReadyList[i]();
            } catch (e) { }
        }
    }
} (window, window.document, require('./utils/log'), require('./utils/xhr')));