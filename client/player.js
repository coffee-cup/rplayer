// videos will only start to load when these are both true
var loadedPosts = false;
var loadedYoutube = false;

var players = [];
var playing_index = -1; // -1 for nothing loaded yet
var loaded_index = -1;

var play_when_loaded =false;

// if we are currently scrolling because of animatescroll
var scrolling = false;

// keep track of last time we animated scrolled
var lastAnimateScroll = null;

// var ct = new ColorThief();

// the posts from the server
// a seperate copy from the one in Session
var posts = [];

Router.route('/:subreddit', function() {
  this.render('player');

  var subreddit = this.params.subreddit;
  var subreddit_link = '/r/' + subreddit;

  Session.set('multiuser', '');

  var re = /(\w+)-(\w+)/;
  var m;
  if ((m = re.exec(subreddit)) !== null) {
    if (m.index === re.lastIndex) {
        re.lastIndex++;
    }

    if (m.length == 3) {
      var username = m[1];
      var multiname = m[2];
      subreddit_link = '/user/' + username + '/m/' + multiname;
      subreddit = multiname;

      Session.set('multiuser', username);
    }
  }

  console.log('fetching from ' + subreddit_link);

  Session.set('subreddit', subreddit);
  Session.set('subreddit_link', subreddit_link);

  Session.set('canPrev', false);
  Session.set('canNext', false);
  Session.set('canPlay', false);
  Session.set('canPause', false);
  Session.set('canEye', false);

  // set posts to empty at start
  Session.set('posts', []);

  // set playing to false
  Session.set('playing', false);

  // get subreddit data from server
  Meteor.call('fetchSubreddit', subreddit_link, function(err, data) {

    if (!data.success) {
      Session.set('displayMessage', 'There was an error calling reddit');
      Session.set('pageError', true);
      return;
    }

    posts = data.posts;

    if (posts.length <= 0) {
      Session.set('displayMessage', 'Could not find media to play at')
      Session.set('displayLink', 'https://www.reddit.com' + subreddit_link);
      Session.set('pageError', true);
      return;
    }

    Session.set('posts', posts);

    for (var i=0;i<posts.length;i++) {
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

    if (!posts) {
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
    if (loadedYoutube) {
      loadPlayers();
    }
  });
});

Template.controls.helpers({
  playing: function() {
    return Session.get('playing');
  },

  canPlay: function() {
    return Session.get('canPlay');
  },

  canPrev: function() {
    return Session.get('canPrev');
  },

  canNext: function() {
    return Session.get('canNext');
  },

  canPause: function() {
    return Session.get('canPause');
  },

  canEye: function() {
    return Session.get('canEye');
  }
});

Template.player.helpers({
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
  }
});

Template.player.rendered = function() {
}

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
    scrollToCurrent();
    Session.set('canEye', true);
  }
});

$(window).scroll(function() {
  var n = (new Date()).getTime();
  if (!scrolling && lastAnimateScroll && (n - lastAnimateScroll) / 1000 > 0.2) {
    Session.set('canEye', false);
  }
});

var scrollToCurrent = function(p) {
  var post = p || currentPost();
  console.log(post.title);
  $('#song-' + post.name).animatescroll({
    easing: 'easeInOutQuart',
    onScrollStart: function() {
      scrolling = true;
    },

    onScrollEnd: function() {
      scrolling = false;
      lastAnimateScroll = (new Date()).getTime();
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
  for (var i=0;i<posts.length;i++) {
    if (posts[i].name == post_name) {
      return posts[i];
    }
  }
  return null;
}

var getPostIndexForName = function(post_name) {
  for(var i=0;i<posts.length;i++) {
    if (posts[i].name == post_name) {
      return i;
    }
  }
  return -1;
}

var playVideo = function() {
  // console.log('playing video');

  var cp = currentPost();
  if (cp && cp.player) {
    cp.player.playVideo();
  } else {
    if (!cp.player) {
      $('#' + 'thumbnail-' + cp.name).hide();
      play_when_loaded = true;
      Session.set('playing', true);
      cp.player = initPlayer(cp);
      $('#wrapper').fitVids();
    } else {
      cp.player.playVideo();
    }
  }
}

var pauseVideo = function() {
  // console.log('pausing video');

  var cp = currentPost();
  if (cp && cp.player) {
    cp.player.pauseVideo();
  }
}

var nextVideo = function() {
  if (playing_index + 1 < posts.length && playing_index != -1) {
    var cp = currentPost();
    if (cp && cp.player) {
      cp.player.pauseVideo();
    }
    playing_index++;
    playVideo();
    Session.set('canPrev', true);
    if (playing_index >= posts.length - 1) {
      Session.set('canNext', false);
    }
  }
}

var prevVideo = function() {
  if (playing_index - 1 >= 0 && playing_index != -1) {
    var cp = currentPost();
    if (cp && cp.player) {
      cp.player.pauseVideo();
    }
    playing_index--;
    playVideo();
    Session.set('canNext', true);
    if (playing_index <= 0) {
      Session.set('canPrev', false);
    }
  }
}

var stateChange = function(event, post_name) {
  var post_index = getPostIndexForName(post_name);
  if (post_index < 0) {
    return;
  }

  var post = posts[post_index];

  if (event.data == YT.PlayerState.PLAYING) {
    // console.log('started playing ' + post.name);

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

    Session.set('playing', true);
  } else if (event.data == YT.PlayerState.ENDED) {
    // console.log('stopped playing ' + post.name);

    // stop playing current video
    if (post.player) {
      // set current time of video back to 0
      // so it can be played again
      post.player.seekTo(0);
      post.player.stopVideo();
      post.player.clearVideo();
    }

    // if there is a next video to play
    if (post_index + 1 < posts.length) {
      post_index++;
      post = posts[post_index];

      // if we have already created the youtube player
      if (post.player) {
        post.player.playVideo();
      } else {
        loadVideoForIndex(post_index);
      }

      Session.set('canPrev', true);
      if (playing_index >= posts.length) {
        Session.set('canNext', false);
      }
    } else {
      Session.set('playing', false);
    }
  } else if (event.data == YT.PlayerState.PAUSED) {
    // console.log('paused ' + post.name);

    Session.set('playing', false);
  } else if (event.data == YT.PlayerState.UNSTARTED) {
  }
}

var onReady = function(event, post_name) {
  // event.target.playVideo();
  // console.log('video ' + post_name + ' is ready')

  if (play_when_loaded && currentPost() && currentPost().player) {
    currentPost().player.playVideo();
    play_when_loaded = false;
  }
}

var loadVideoForIndex = function(index) {

  if (index >= 0 && index < posts.length) {
    var p = posts[index];

    // hide thumbnail after video has been loaded
    $('#' + 'thumbnail-' + p.name).hide();

    if (!p.player) {
      p.player = new YT.Player('video-' + p.name, {
        videoId: p.videoId,
        playerVars: {'autoplay': 1},

        events: {
          onReady: function(event) {
            onReady(event, p.name);
          },

          onStateChange: function(event) {
            stateChange(event, p.name);
          }
        }
      });
      $('#wrapper').fitVids();
    }
  }
}

var initPlayer = function(post) {
  return new YT.Player('video-' + post.name, {
    videoId: post.videoId,
    events: {
      onReady: function(event) {
        onReady(event, post.name);
      },

      onStateChange: function(event) {
        stateChange(event, post.name);
      }
    }
  });
}

// called when posts are loaded and youtube player ready
var loadPlayers = function() {

}

onYouTubeIframeAPIReady = function() {
  // console.log('loaded youtube iframe');

  loadedYoutube = true;
  if (loadedPosts) {
    loadPlayers();
  }

  // player = new YT.Player('player', {
  //   videoId: "LdH1hSWGFGU",

  //   events: {
  //     onReady: onReady
  //   }
  // });
}

YT.load();
