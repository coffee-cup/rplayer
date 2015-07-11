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

  parseSubreddits: function(data) {
    data = JSON.parse(data.content);

    var posts = [];
    data.data.children.forEach(function(obj, i) {
      var p = obj.data;
      if (Meteor.call('isMusic', p.url)) {
        var post = {
          author: p.author,
          score: p.score,
          title: p.title,
          ups: p.ups,
          url: p.url,
          name: p.name
        }
        posts.push(post);
      }
    });

    return posts;
  },

  fetchSubreddit: function(sub_name) {
    var url = REDDIT + sub_name + '/.json';
    console.log('making request to ' + url);
    var result = Meteor.http.get(url, {timeout:30000});
    if (result.statusCode == 200) {
      console.log('fetchSubreddit success');
      return Meteor.call('parseSubreddits', result);
    } else {
      // console.log(result);
      console.log('error fetching subreddits');
      // throw new Meteor.Error(result.statusCode, 'error fetching subreddits');
    }
  }
});
