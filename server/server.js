var REDDIT = 'https://www.reddit.com'

// new RegExp('^https?://soundcloud.com/')

var MATCH_URLS = [
  new RegExp('^https?://www.youtube.com/'),
  new RegExp('^https?://youtu.be/')
]

var music_subs = [];
var popular_subs = [{
  subreddit: 'ListenToThis',
  link: '/r/ListenToThis'
}, {
  subreddit: 'futurebeats',
  link: '/r/futurebeats'
}, {
  subreddit: 'chillmusic',
  link: '/r/chillmusic'
}, {
  subreddit: 'MusicForConcentration',
  link: '/r/MusicForConcentration'
}, {
  subreddit: 'videos',
  link: '/r/videos'
}];

var multis = [{
    subreddit: 'True Music',
    link: '/user/evilnight/m/truemusic'
  }, {
    subreddit: 'The Firehose',
    link: '/user/evilnight/m/thefirehose'
  }, {
    subreddit: 'Electronic Music',
    link: '/user/evilnight/m/electronic'
  }, {
    subreddit: 'Rock',
    link: '/user/evilnight/m/rock'
  }, {
    subreddit: 'The Drip',
    link: '/user/evilnight/m/thedrip'
  }

]

Meteor.startup(function() {
  // code to run on server at startup
  Winston.info('starting meteor server');
  var data = JSON.parse(Assets.getText('music_subs.json')).music_subs;
  data.forEach(function(obj) {
    music_subs.push({
      subreddit: obj,
      link: '/r/' + obj
    });
  });
});

Meteor.methods({
  getPopularSubs: function() {
    return popular_subs;
  },

  getRandomSubs: function() {
    var random = [];
    var success_counted = 0;
    var nums = [];
    while (success_counted < 5) {
      var n = Math.floor(Math.random() * music_subs.length);
      if (nums.indexOf(n) == -1) {
        success_counted += 1;
        nums.push(n);
        random.push(music_subs[n]);
      }
    }

    return random;
  },

  getMultis: function() {
    return multis;
  },

  isMusic: function(url) {
    for (var i = 0; i < MATCH_URLS.length; i++) {
      if (url.match(MATCH_URLS[i])) {
        return true;
      }
    }
    return false;
  },

  getSoundcloudId: function(url) {
    var regexp = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/;
    return url.match(regexp) && url.match(regexp)[2]
  },

  getYoutubeId: function(url) {
    // var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
      return match[7];
    } else {
      return null;
    }
  },

  parseSubreddits: function(data, sid) {
    var posts = [];
    data = JSON.parse(data.content);

    data.data.children.forEach(function(obj, i) {
      var p = obj.data;

      var youtubeId = Meteor.call('getYoutubeId', p.url);
      // var youtubeId = null;
      var soundcloudId = Meteor.call('getSoundcloudId', p.url);
      // var soundcloudId = null;

      var videoId = youtubeId;
      if (!youtubeId) videoId = soundcloudId;

      var sound_thumb = null;

      try {
        var images = p.preview.images;
        sound_thumb = images[0].source.url;
      } catch (err) {}

      if (videoId) {
        var post = {
          author: p.author,
          score: p.score,
          title: p.title,
          ups: p.ups,
          url: p.url,
          post_subreddit: p.subreddit,
          post_sub_link: Meteor.absoluteUrl() + 'r/' + p.subreddit,
          num_comments: p.num_comments,
          name: p.name,
          videoId: videoId,
          isYoutube: (youtubeId != null),
          sound_thumb: sound_thumb,
          user_name: 'u/' + p.author,
          user_link: 'https://reddit.com/u/' + p.author,
          comment_link: 'https://reddit.com' + p.permalink,
          thumbnail: 'https://i.ytimg.com/vi/' + youtubeId + '/maxresdefault.jpg',
          thumb_small: 'https://i.ytimg.com/vi/' + youtubeId + '/sddefault.jpg',
          alt_image: 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
        }
        posts.push(post);
      }
    });

    return {
      posts: posts,
      success: true,
      sid: sid
    };
  },


  // returns url based on given user search input
  parseInput: function(input) {
    var query_pos = input.indexOf('?');
    if (query_pos != -1) {
      return REDDIT + input.substring(0, query_pos) + '.json' + input.substring(query_pos, input.length);
    }
    return REDDIT + input + '/.json?limit=100';
  },

  fetchSubreddit: function(url, sid) {
    var url = Meteor.call('parseInput', url);
    Winston.info(sid + ' - making request to ' + url);

    try {
      var result = Meteor.http.get(url, {
        timeout: 100000
      });
      console.log(result);
      if (result.statusCode == 200) {
        Winston.info(sid + ' - fetchSubreddit success');
        return Meteor.call('parseSubreddits', result, sid);
      } else {
        Winston.error('error fetching subreddits');
        return {
          success: false,
          message: 'Error fetching subreddits',
          sid: sid
        };
        // throw new Meteor.Error(result.statusCode, 'error fetching subreddits');
      }
    } catch (err) {
      Winston.error(err);
    }
  },

  checkImage: function(post) {
    if (post.isYoutube) {
      try {
        var result = Meteor.http.get(post.thumbnail, {
          timeout: 2000
        });
        if (result.statusCode != 200) {
          return [false, post];
        }
      } catch (err) {
        return [false, post];
      }
      return [true, post];
    }
    return [true, post];
  }
});
