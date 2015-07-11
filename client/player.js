
Router.route('/:subreddit', function() {
  subreddit = this.params.subreddit;
  Session.set('subreddit', subreddit);
  this.render('player');
});

Template.player.helpers({
  subreddit: function() {
    return Session.get('subreddit');
  },

  posts: function() {
    return Session.get('posts');
  }
});

Template.player.rendered = function() {
  var subreddit = Session.get('subreddit');

  // get the subreddit posts from server
  Meteor.call('fetchSubreddit', subreddit, function(err, data) {
    Session.set('posts', data);
  });
}
