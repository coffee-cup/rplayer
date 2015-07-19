// videos will only start to load when these are both true
var loadedPosts = false;
var loadedYoutube = false;

var players = [];
var playing_index = -1; // -1 for nothing loaded yet
var loaded_index = -1;
var playing = false; // if we are playing or not
var current_player = null; // the youtube player that user is currently using

// the posts from the server
// a seperate copy from the one in Session
var posts = [];

Router.route('/:subreddit', function() {
  var subreddit = this.params.subreddit;
  var subreddit_link = 'https://reddit.com/r/' + subreddit;
  Session.set('subreddit', subreddit);
  Session.set('subreddit_link', subreddit_link);

  Meteor.call('fetchSubreddit', subreddit, function(err, data) {
    Session.set('posts', data);
    posts = data;

    loadedPosts = true;
    if (loadedYoutube) {
      loadPlayers();
    }
  });

  this.render('player');
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
  },
});

Template.player.events({
  'click .thumbnail': function(event) {
    var id = event.currentTarget.id;
    var post_name = id.substring(6);
    var post_index = getPostIndexForName(post_name);

    loadVideoForIndex(post_index);
  }
});

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

var stateChange = function(event, post_name) {
  var post_index = getPostIndexForName(post_name);
  if (post_index < 0) {
    return;
  }

  var post = posts[post_index];

  if (event.data == YT.PlayerState.PLAYING) {
    console.log('started playing ' + post.name);

    // stop other video playing
    if (playing_index >= 0 && playing_index != post_index && posts[playing_index].player) {
      // players[playing_index].stopVideo();
      posts[playing_index].player.stopVideo();
    }
    playing_index = post_index;
    var player = players[playing_index];
  } else if (event.data == YT.PlayerState.ENDED) {
    console.log('stopped playing ' + post.name);

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
    }
  } else if (event.data == YT.PlayerState.PAUSED) {
    console.log('paused ' + post.name);
  } else if (event.data == YT.PlayerState.UNSTARTED) {
  }
}

var onReady = function(event, post_name) {
  // event.target.playVideo();
  console.log('video ' + post_name + ' is ready')

  // hide thumbnail after video has been loaded
  $('#' + 'thumbnail-' + post_name).hide();
}

var loadVideoForIndex = function(index) {

  if (index >= 0 && index < posts.length) {
    var p = posts[index];
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

var loadNextVideo = function() {
  loaded_index++;
  var p = posts[loaded_index];

  console.log('loaded index: ' + loaded_index);
  console.log('loading video from post: ' + p.name);

  // hide thumbnail
  var player = new YT.Player('video-' + p.name, {
    videoId: p.videoId,

    // for events, call custom event with event object and post name
    events: {
      onReady: function(event) {
        onReady(event, p.name);
      },

      onStateChange: function(event) {
        stateChange(event, p.name);
      }
    }
  });

  // players.push(player);
  // p.player = player;
}

// called when posts are loaded and youtube player ready
var loadPlayers = function() {

}

onYouTubeIframeAPIReady = function() {
  console.log('loaded youtube iframe');

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
