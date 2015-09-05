Router.route('/', function() {
  Session.set('errorMessage', '');

  GAnalytics.pageview();

  loadSubs();
  this.render('index');
});

var loadSubs = function() {
  if (!Session.get('randomSubs')) {
    Meteor.call('getRandomSubs', function(err, data) {
      if (data) {
        Session.set('randomSubs', data);
      }
    });
  }

  Meteor.call('getPopularSubs', function(err, data) {
    if (data) {
      Session.set('popularSubs', data);
    }
  });
}

var example_string = 'https://www.reddit.com/r/listentothis';

Template.subredditSearch.helpers({
  errorMessage: function() {
    return Session.get('errorMessage');
  }
});

Template.index.rendered = function() {
  // animations.logo_animation();
}

Template.catBar.rendered = function() {
  loadSubs();
}

Template.catBar.helpers({
  popularSubs: function() {
    return Session.get('popularSubs');
  },

  randomSubs: function() {
    return Session.get('randomSubs');
  }
});

Template.index.events({
  'submit #search-form': function(event) {
    event.preventDefault();

    var input = event.target.sub_name.value.trim();

    var r;
    r = utils.isLink(input);
    if (r && r.link) {
      Router.go('/r/' + r.link);
      return;
    }

    r = utils.isSubreddit(input);
    if (r && r.subreddit) {
      Router.go('/r/' + r.subreddit);
      return;
    }

    r = utils.isMulti(input);
    if (r && r.username && r.multiname) {
      Router.go('/user/' + r.username + '/m/' + r.multiname);
      return;
    }

    console.log('invalid input');
    Session.set('errorMessage', 'Invaid input');
    Router.go('/' + sub_name);
  }
});

Template.catBar.events({
  'click #random-button': function(event) {
    Meteor.call('getRandomSubs', function(err, data) {
      if (data) {
        Session.set('randomSubs', data);
      }
    });
  }
});
