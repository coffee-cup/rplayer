var REDDIT = 'https://www.reddit.com/r/'

Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
  parseSubreddits: function(data) {
    data = JSON.parse(data.content);

    var posts = [];
    data.data.children.forEach(function(obj, i) {
      var p = obj.data;
      var post = {
        author: p.author,
        score: p.score,
        title: p.title,
        ups: p.ups,
        url: p.url
      }
      posts.push(post);
    });

    return posts;
  },

  fetchSubreddit: function(sub_name) {
    var url = REDDIT += sub_name + '/.json';
    console.log('making request to ' + url);
    var result = Meteor.http.get(url, {timeout:30000});
    if (result.statusCode == 200) {
      return Meteor.call('parseSubreddits', result);
    } else {
      console.log('error fetching subreddits');
      throw new Meteor.Error(result.statusCode, 'error fetching subreddits');
    }
  }
});
