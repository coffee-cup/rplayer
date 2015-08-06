var REDDIT = 'https://www.reddit.com/r/'

// new RegExp('^https?://soundcloud.com/')

var MATCH_URLS = [
new RegExp('^https?://www.youtube.com/'),
new RegExp('^https?://youtu.be/')
]

Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
  isMusic: function(url) {
    for (var i=0;i<MATCH_URLS.length;i++) {
      if (url.match(MATCH_URLS[i])) {
        return true;
      }
    }
    return false;
  },

  getYoutubeId: function(url) {
    // var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[7].length==11){
      return match[7];
    } else {
      return null;
    }
  },

  parseSubreddits: function(data) {
    data = JSON.parse(data.content);

    var posts = [];
    data.data.children.forEach(function(obj, i) {
      var p = obj.data;

      var youtubeId = Meteor.call('getYoutubeId', p.url);
      if (youtubeId) {
        var post = {
          author: p.author,
          score: p.score,
          title: p.title,
          ups: p.ups,
          url: p.url,
          name: p.name,
          videoId: youtubeId,
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

    return posts;
  },


  // returns url based on given user search input
  parseInput: function(input) {
    var url = REDDIT + input + '/.json?limit=100';
    return url;
  },

  fetchSubreddit: function(url) {
    var url = Meteor.call('parseInput', url);
    console.log('making request to ' + url);
    var result = Meteor.http.get(url, {timeout:30000});
    if (result.statusCode == 200) {
      console.log('fetchSubreddit success');
      return Meteor.call('parseSubreddits', result);
    } else {
      console.log('error fetching subreddits');
      return 'error fetching subreddits';
      // throw new Meteor.Error(result.statusCode, 'error fetching subreddits');
    }
  },

  checkImage: function(post) {
    try {
      var result = Meteor.http.get(post.thumbnail, {timeout: 2000});
      if (result.statusCode != 200) {
        return [false, post];
      }
    } catch(err) {
      return [false, post];
    }

    return [true, post];
  }
});
