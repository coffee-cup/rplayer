Router.route('/', function() {
  Session.set('errorMessage', '');

  this.render('index');
});

var example_string = 'https://www.reddit.com/r/listentothis';

Template.subredditSearch.helpers({
  errorMessage: function() {
    return Session.get('errorMessage');
  }
});

var setRandomSubs = function() {
  Meteor.call('getRandomSubs', function(err, data) {
    if (data) {
      Session.set('randomSubs', data);
    }
  });
}

Template.index.rendered = function() {
  Meteor.call('getPopularSubs', function(err, data) {
    if (data) {
      Session.set('popularSubs', data);
      console.log(data);
    }
  });

  if (!Session.get('randomSubs')) {
    setRandomSubs();
  }
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

    r = utils.isLink(input);
    if (r && r.subreddit) {
      Router.go('/r/' + r.subreddit);
      return;
    }

    console.log('invalid input');
    Session.set('errorMessage', 'Invaid input');
    // Router.go('/' + sub_name);
  },

  'click #random-button': function(event) {
    setRandomSubs();
  }
});
