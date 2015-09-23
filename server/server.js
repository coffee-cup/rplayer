var REDDIT = 'https://www.reddit.com'

Meteor.startup(function() {
  // code to run on server at startup
  Winston.info('starting meteor server');

  // cron job to get gifs for loading screen
  SyncedCron.add({
    name: 'get gifs',
    schedule: function(parser) {
      return parser.recur().every(1).hour();
    },
    job: function() {
      gifs = [];
      Meteor.call('getGifs');
    }
  });
  checkGifDB();
  SyncedCron.start();
  Meteor.call('getGifs');
});

Meteor.methods({
  getGifs: function() {
    // run the gif gettings async
    getGifSet(0, 0, null);
  },

  returnGifs: function() {
    Winston.info('sending back ' + gifs.length + ' gifs');
    return shuffle(gifs);
  },

  getListOfMessages: function() {
    return {
      success: true,
      messages: messages
    };
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

    try {
      data = JSON.parse(data.content);

      data.data.children.forEach(function(obj, i) {
        var p = obj.data;

        var youtubeId = Meteor.call('getYoutubeId', p.url);

        // var youtubeId = null;
        var soundcloudId = Meteor.call('getSoundcloudId', p.url);
        // var soundcloudId = null;

        var videoId = youtubeId;
        if (!youtubeId) videoId = soundcloudId;

        if (!youtubeId && !soundcloudId) {
          return true;
        }
        var sound_thumb = null;

        try {
          var images = p.preview.images;
          sound_thumb = images[0].source.url;
        } catch (err) {}

        var comment_string = p.num_comments + '';
        if (p.num_comments === 1) {
          comment_string += ' comment';
        } else {
          comment_string += ' comments';
        }
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
            comment_string: comment_string,
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
    } catch (err) {
      Winston.error(err);
    }


  },

  // returns url based on given user search input
  parseInput: function(input) {
    var query_pos = input.indexOf('?');
    if (query_pos != -1) {
      return REDDIT + input.substring(0, query_pos) + '.json' + input.substring(query_pos, input.length);
    }
    return REDDIT + input + '/.json?count=100';
  },

  fetchSubreddit: function(url, sid) {
    var url = Meteor.call('parseInput', url);
    Winston.info(sid + ' - making request to ' + url);

    try {
      var result = Meteor.http.get(url, {
        timeout: 100000
      });

      if (result.statusCode == 200) {
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
