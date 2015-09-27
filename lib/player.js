// videos will only start to load when these are both true
var loadedPosts = false;
var loadedYoutube = false;

var players = [];
var playing_index = -1; // -1 for nothing loaded yet
var loaded_index = -1;

var play_when_loaded = false;

// if we are currently scrolling because of animatescroll
var scrolling = false;

// keep track of last time we animated scrolled
var lastAnimateScroll = null;

// the posts from the server
// a seperate copy from the one in Session
var posts = [];

// the jquery object of the currently active song
var active_song = null;

// the position we were at when canEye sets true
var last_eye_pos = null;

// About page route
Router.route('/about', function() {
  this.render('about');
}, {
  fastRender: true,
  progressSpinner: false
});

/**
 * Catch all route
 */
Router.route('/(.*)', function() {
  this.render('player');
  var isMobile = utils.isMobile();
  // if (isMobile) {
  //   var f_height = '12em';
  //   var i_height = '8em';
  //   $('#player-controls').css('height', f_height);
  //   $("<style>")
  //     .prop("type", "text/css")
  //     .html("\
  //     #player-controls img {\
  //       height: " + i_height + ";\
  //       margin-top: 2em;\
  //       margin-right: 1.5em;\
  //       margin-left: 1.5em;\
  //     }")
  //     .appendTo("head");
  // }

  var path = Router.current().location.get().path;
  GAnalytics.pageview(path);

  Session.set('path', path);

  if (sort.parseUrl) {
    sort.parseUrl();
  }

  // var subreddit = this.params.subreddit;
  var subreddit_link = path;

  Session.set('multiuser', '');
  Session.set('isMulti', false);
  Session.set('isMultiTrue', false);
  Session.set('canControl', true);

  Session.set('query', this.params.query);

  /**
   * Start parsing url
   */
  var r;

  // check if multireddit
  r = utils.isMulti(path);
  if (r && r.username && r.multiname) {
    Session.set('subreddit', r.multiname);
    Session.set('multiuser', r.username);
    Session.set('isMulti', true);
    Session.set('isMultiTrue', true);
  } else {
    // check if subreddit / reddit link
    r = utils.isLink(path);
    if (r && r.subreddit) {
      var sub = utils.subFromLink(path);
      Session.set('subreddit', sub);
      if (r.subreddit.indexOf('+') != -1) {
        Session.set('isMulti', true);
      }
    } else {
      Session.set('subreddit', 'unknown subreddit');
    }
  }

  var base_reddit = '';
  // is legit reddit multireddit
  if (Session.get('multiuser')) {
    var multiuser = Session.get('multiuser');
    var multireddit = Session.get('subreddit');
    base_reddit = '/user/' + multiuser + '/m/' + multireddit;
  } else {
    var subreddit = Session.get('subreddit');
    base_reddit = '/r/' + subreddit;
  }
  Session.set('base_reddit', base_reddit);
  var old_link = Session.get('subreddit_link');

  // this request has already been made, dont need to make again
  if (old_link && old_link === subreddit_link) {
    return;
  }

  Session.set('subreddit_link', subreddit_link);
  Session.set('canPrev', false);
  Session.set('canNext', false);
  Session.set('canPlay', false);
  Session.set('canPause', false);
  Session.set('canEye', false);
  Session.set('loading', false);
  Session.set('pageError', false);

  // set posts to empty at start
  Session.set('posts', []);

  /**
   * init session values
   */
  Session.set('playing', false);
  Session.set('loading', true);

  changePageTitle(Session.get('subreddit') + ' - boomz');

  // get subreddit data from server
  var sid = utils.randomId();
  Session.set('latestSID', sid);
  Meteor.call('fetchSubreddit', subreddit_link, sid, function(err, data) {
    // error with fetching from reddit
    if (!data || !data.success) {
      Session.set('displayMessage', 'There was a problem calling the following url');
      Session.set('displayLink', 'https://www.reddit.com' + subreddit_link);
      Session.set('pageError', true);
      Session.set('loading', false);
      return;
    }

    // make sure the request is the latest one
    var sid = Session.get('latestSID');
    if (sid && sid != data.sid) {
      return;
    }

    posts = data.posts;

    if (posts.length <= 0) {
      Session.set('displayMessage', 'Could not find media to play at')
      Session.set('displayLink', 'https://www.reddit.com' + subreddit_link);
      Session.set('pageError', true);
      Session.set('loading', false);
      return;
    }

    playing_index = 0;
    for (var i = 0; i < posts.length; i++) {
      var varTitle = $('<textarea />').html(posts[i].title).text();
      posts[i].title = varTitle;

      Meteor.call('checkImage', posts[i], function(err, results) {
        if (results) {
          var isSuccess = results[0];
          var post = results[1];
          if (!isSuccess) {
            $('#thumbnail-' + post.name).attr('src', post.alt_image);
          }
        }
      });
    }

    Session.set('posts', posts);

    if (!posts) {
      Session.set('loading', false);
      return;
    }

    if (posts.length >= 1) {
      Session.set('canPlay', true);
      Session.set('canPause', true);
    }

    if (posts.length >= 2) {
      Session.set('canNext', true);
    }

    loadedPosts = true;

    // comment to search for: setloading
    Session.set('loading', false);
  });
}, {
  fastRender: true,
  progressSpinner: false
});

/**
 * Changes page title if on client to title
 */
changePageTitle = function(title) {
  if (Meteor.isClient) {
    document.title = title;
  }
}

if (Meteor.isClient) {

  Template.player.onRendered(function() {
    // animations.logo_animation();
  });

  Template.player.helpers({
    test: function() {
      return Gifs.find({});
    },

    multied: function() {
      return Session.get('isMultiTrue') ? "multied" : "";
    },

    pageError: function() {
      return Session.get('pageError');
    },

    displayMessage: function() {
      return Session.get('displayMessage');
    },

    displayLink: function() {
      return Session.get('displayLink');
    },

    subreddit_title: function() {
      var multiuser = Session.get('multiuser');
      if (multiuser && multiuser != '') {
        return 'm/' + Session.get('subreddit');
      }
      return 'r/' + Session.get('subreddit');
    },

    subreddit: function() {
      return Session.get('subreddit');
    },

    mutliuser: function() {
      var mutliuser = Session.get('multiuser');
      if (mutliuser && mutliuser != '')
        return 'multireddit by u/' + Session.get('multiuser');
      return '';
    },

    mutliuserLink: function() {
      return 'https://www.reddit.com/u/' + Session.get('multiuser');
    },

    subreddit_link: function() {
      return 'https://www.reddit.com' + Session.get('subreddit_link');
    },

    posts: function() {
      return Session.get('posts');
    },

    loading: function() {
      return Session.get('loading');
    }
  });

  Template.player.rendered = function() {}

  Template.logo.helpers({
    siteUrl: function() {
      return Meteor.absoluteUrl();
    }
  });

  Template.player.events({
    'click .thumbnail': function(event) {
      var id = event.currentTarget.id;
      var post_name = id.substring(10);
      var post_index = getPostIndexForName(post_name);

      loadVideoForIndex(post_index);
    },

    'click #play-button': function(event) {
      playVideo();
    },

    'click #pause-button': function(event) {
      pauseVideo();
    },

    'click #next-button': function(event) {
      nextVideo();
    },

    'click #prev-button': function(event) {
      prevVideo();
    },

    'click #eye-button-cant': function(event) {
      if (posts.length <= 0) {
        return;
      }

      scrollToCurrent();
    }
  });

  // called when the window is scrolled
  $(window).scroll(function() {
    if (!scrolling && Session.get('canEye')) {
      var scroll_pos = $('body').scrollTop();

      // if the scroll position is 50px away from where the eye was set at
      if (Math.abs(scroll_pos - last_eye_pos) >= 50) {
        var n = (new Date()).getTime();
        if (!scrolling && lastAnimateScroll && (n - lastAnimateScroll) / 1000 > 0.2) {
          Session.set('canEye', false);
        }
      }
    }
  });

  // called when window is resize
  $(window).resize(function() {
    if (Session.get('canEye')) {
      scrollToCurrent();
    }
  });

  // scrolls to the current playing media
  // and sets appropriate flags
  var scrollToCurrent = function(p) {
    var post = p || currentPost();
    $('#song-' + post.name).animatescroll({
      easing: 'easeOutCirc',
      onScrollStart: function() {
        scrolling = true;
      },

      onScrollEnd: function() {
        scrolling = false;
        lastAnimateScroll = (new Date()).getTime();
        last_eye_pos = $('body').scrollTop();
        Session.set('canEye', true);
      }
    });
    Session.set('canEye', true);
  }

  var currentPost = function() {
    if (playing_index < 0) {
      playing_index = 0;
    }
    return posts[playing_index];
  }

  var getPostForName = function(post_name) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].name == post_name) {
        return posts[i];
      }
    }
    return null;
  }

  var getPostIndexForName = function(post_name) {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].name == post_name) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Play the currently selected media
   */
  var playVideo = function() {
    var cp = currentPost();
    if (cp) {
      if (cp.player) {
        cp.player.playVideo();
      } else {
        $('#' + 'thumbnail-' + cp.name).hide();
        cp.player = initPlayer(cp);
        $('#wrapper').fitVids();
      }
    }
  }

  /**
   * Pause the currently selected media
   */
  var pauseVideo = function() {
    var cp = currentPost();
    if (cp && cp.player) {
      cp.player.pauseVideo();
    }
  }

  /**
   * Function needed to delay setting the playing flag to true,
   * if a youtube videos take a sec to pause playing, and soundcloud
   * plays instantly.
   *
   * This function will set the 'delay' flag in the Session to true
   * after 500ms
   * @return {[type]} [description]
   */
  var delayPlaying = function() {
    setTimeout(function() {
      Session.set('playing', true);
    }, 500);
  }

  /**
   * Will start playing the next media if there is some to play
   */
  var nextVideo = function() {
    if (playing_index + 1 < posts.length && playing_index != -1) {
      pauseVideo();
      playing_index++;

      if (Session.get('canEye')) {
        scrollToCurrent();
      }

      playVideo();
      delayPlaying();
      Session.set('canPrev', true);
      if (playing_index >= posts.length - 1) {
        Session.set('canNext', false);
      }
    } else {
      Session.set('playing', false);
    }
  }

  /**
   * Will play the previous media if available
   */
  var prevVideo = function() {
    if (playing_index - 1 >= 0 && playing_index != -1) {
      pauseVideo();
      playing_index--;

      if (Session.get('canEye')) {
        scrollToCurrent();
      }

      playVideo();
      delayPlaying();
      Session.set('canNext', true);
      if (playing_index <= 0) {
        Session.set('canPrev', false);
      }
    }
  }

  /**
   * Youtube on error event
   */
  var onError = function(event, post_name) {
    var post_index = getPostIndexForName(post_name);
    if (post_index < 0) {
      return;
    }
    var post = posts[post_index];

    if (post_index == playing_index) {
      nextVideo();
    }
  }

  /**
   * State event for when media starts playing
   */
  var statePlaying = function(event, post_name) {
    // get post index and post object from post name
    var post_index = getPostIndexForName(post_name);
    if (post_index < 0) {
      return;
    }
    var post = posts[post_index];

    // stop other video playing
    if (playing_index >= 0 && playing_index != post_index && posts[playing_index].player) {
      // players[playing_index].stopVideo();
      posts[playing_index].player.stopVideo();
    }
    playing_index = post_index;
    var player = players[playing_index];

    if (playing_index <= 0) {
      Session.set('canPrev', false);
    } else {
      Session.set('canPrev', true);
    }

    if (playing_index >= posts.length - 1) {
      Session.set('canNext', false);
    } else {
      Session.set('canNext', true);
    }

    // if the canEye is true
    // scroll to new video
    if (Session.get('canEye')) {
      scrollToCurrent();
    }

    if (active_song) {
      active_song.removeClass('active-song');
    }
    active_song = $('#info-' + post.name);
    active_song.addClass('active-song');

    Session.set('playing', true);

    setTimeout(function() {
      if (playing_index <= 0) playing_index = 0;
      loadVideoForIndex(playing_index + 1, true);
    }, 1000);
  }

  /**
   * State event for when media is paused
   */
  var statePause = function(event, post_name) {
    Session.set('playing', false);
  }

  /*
   * State event for when media is ended
   */
  var stateEnded = function(event, post_name) {
    // get post index and post object from post name
    var post_index = getPostIndexForName(post_name);
    if (post_index < 0) {
      return;
    }
    var post = posts[post_index];

    if (post.player) {
      // set current time of video back to 0
      // so it can be played again
      post.player.pauseVideo();
      post.player.seekTo(0);
    }

    // if there is not another video to player
    if (post_index + 1 >= posts.length) {
      Session.set('playing', false);
    }

    nextVideo();
  }

  /**
   * State change event for youtube videos
   */
  var stateChange = function(event, post_name) {
    if (event.data == YT.PlayerState.PLAYING) {
      statePlaying(event, post_name);
    } else if (event.data == YT.PlayerState.ENDED) {
      stateEnded(event, post_name);
    } else if (event.data == YT.PlayerState.PAUSED) {
      statePause(event, post_name);
    }
  }

  /**
   * State event for when youtube video is ready
   */
  var onReady = function(event, post_name) {
    if (currentPost() && currentPost().player && play_when_loaded) {
      play_when_loaded = false;
      currentPost().player.playVideo();
    }
  }

  var loadVideoForIndex = function(index, on_load) {
    if (!on_load) on_load = false;
    if (index >= 0 && index < posts.length) {
      var p = posts[index];

      // hide thumbnail after video has been loaded
      $('#' + 'thumbnail-' + p.name).hide();

      if (!p.player) {
        p.player = initPlayer(p, on_load);
        $('#wrapper').fitVids();
      }
    }
  }

  /**
   * Inits a posts player object, (either soundcloud or youtube)
   * @param  {post object}
   * @return {either youtube player or soundcloud player}
   */
  var initPlayer = function(post, load_up) {
    if (post.player) return;

    load_up = typeof load_up !== 'undefined' ? load_up : false; // default value of true
    var autoplay = !load_up;

    // object to control playing both youtube and soundcloud songs
    var player = {
      y_obj: null,
      s_obj: null,

      playVideo: function() {
        // youtube media
        if (this.y_obj) {
          this.y_obj.playVideo();
        } else if (this.s_obj) { // soundcloud song
          this.s_obj.play();
        }
      },

      stopVideo: function() {
        if (this.y_obj) {
          this.y_obj.stopVideo();
        } else if (this.s_obj) {
          this.s_obj.pause();
        }
      },

      pauseVideo: function() {
        if (this.y_obj) {
          this.y_obj.pauseVideo();
        } else if (this.s_obj) {
          this.s_obj.pause();
        }
      },

      seekTo: function(value) {
        if (this.y_obj) {
          this.y_obj.seekTo(value);
        } else if (this.s_obj) {
          this.s_obj.seekTo(value);
        }
      }
    }

    // youtube or soundcloud song
    if (post.isYoutube) {
      var y_player = new YT.Player('video-' + post.name, {
        videoId: post.videoId,
        playerVars: {
          'autoplay': autoplay
        },
        events: {
          onReady: function(event) {
            onReady(event, post.name);
          },

          onStateChange: function(event) {
            stateChange(event, post.name);
          },

          onError: function(event) {
            onError(event, post.name);
          }
        }
      });
      player.y_obj = y_player;
      return player;
    } else {
      // options for soundcloud widget
      var params = {
        auto_play: autoplay,
        hide_related: true,
        show_comments: true,
        show_user: true,
        show_reposts: false,
        visual: true,
        show_artwork: true,
        url: post.url
      };

      // create url for iframe
      var src = "https://w.soundcloud.com/player/?";
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          src += key + "=" + params[key] + "&";
        }
      }

      // create iframe for soundcloud song
      var sid = "soundcloud" + post.name;
      var iframe = $('<iframe>', {
        scrolling: "no",
        frameborder: "no",
        src: src,
        id: sid,
        class: 'soundcloud-iframe'
      });
      var v = $('#video-' + post.name);
      iframe.appendTo(v);

      // get the soundcloud widget object
      // we will use this to bind events
      var s_obj = SC.Widget(sid);

      // bind the needed events for the newly loaded song
      s_obj.bind(SC.Widget.Events.PLAY, function(event) {
        statePlaying(event, post.name);
      });

      s_obj.bind(SC.Widget.Events.READY, function(event) {
        onReady(event, post.name);
      });

      s_obj.bind(SC.Widget.Events.PAUSE, function(event) {
        statePause(event, post.name);
      });

      s_obj.bind(SC.Widget.Events.FINISH, function(event) {
        stateEnded(event, post.name);
      });

      s_obj.bind(SC.Widget.Events.ERROR, function(event) {
        onError(event, post.name);
      })

      player.s_obj = s_obj;
      return player;
    }
  }

  /**
   * Called when youtube iframe api is ready
   * @return {[type]}
   */
  onYouTubeIframeAPIReady = function() {
    // console.log('loaded youtube iframe');

    loadedYoutube = true;
  }

  YT.load();

  // Keybindings
  Mousetrap.bind(['space', 'up'], function() {
    if (!Session.get('loading')) {
      var pl = Session.get('playing');
      if (pl) {
        pauseVideo();
      } else {
        playVideo();
      }
    }
  });

  Mousetrap.bind(['n', 'right'], function() {
    if (!Session.get('loading')) {
      nextVideo();
    } else {
      nextGif();
    }
  });

  Mousetrap.bind(['p', 'left'], function() {
    if (!Session.get('loading')) {
      prevVideo();
    }
  });

  Mousetrap.bind(['e', 'down'], function() {
    if (posts.length <= 0) {
      return;
    }

    if (!Session.get('loading')) {
      scrollToCurrent();
      Session.set('canEye', true);
    }
  });

  // prevent scroll on space
  window.onkeydown = function(e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  };

}
