// videos will only start to load when these are both true
var loadedPosts = false;
var loadedYoutube = false;

var players = [];
var playing_index = -1; // -1 for nothing loaded yet
var loaded_index = -1;

var play_when_loaded = false;

// var ct = new ColorThief();

// the posts from the server
// a seperate copy from the one in Session
var posts = [];

Router.route('/:subreddit', function() {
  var subreddit = this.params.subreddit;
  var subreddit_link = 'https://reddit.com/r/' + subreddit;
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
  Meteor.call('fetchSubreddit', subreddit, function(err, data) {
    Session.set('posts', data);
    posts = data;

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
      Session.set('canEye', true);
    }

    if (posts.length >= 2) {
      Session.set('canNext', true);
    }

    loadedPosts = true;
    if (loadedYoutube) {
      loadPlayers();
    }
  });

  this.render('player');
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
  subreddit_title: function() {
    return 'r/' + Session.get('subreddit');
  },

  subreddit: function() {
    return Session.get('subreddit');
  },

  subreddit_link: function() {
    return Session.get('subreddit_link');
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

  'click #eye-button': function(event) {
    var post = currentPost();
    $('#song-' + post.name).animatescroll({
      easing: 'easeInOutQuart'
    });
  }
});

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

    Session.set('playing', true);
  } else if (event.data == YT.PlayerState.ENDED) {
    // console.log('stopped playing ' + post.name);

    // stop playing current video
    if (post.player) {
      post.player.stopVideo();
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
