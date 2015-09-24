Router.route('/', function() {
  Session.set('errorMessage', '');

  GAnalytics.pageview();

  loadSubs();
  this.render('index');
}, {
  fastRender: true,
  progressSpinner: false
});

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
}];

if (Meteor.isClient) {
  var loadSubs = function() {
    if (!Session.get('randomSubs')) {
      var rs = getRandomSubs();
      Session.set('randomSubs', rs);
    }

    Session.set('popularSubs', popular_subs);
    Session.set('multiList', multis);
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
    },

    multiList: function() {
      return Session.get('multiList');
    }
  });

  Template.index.events({
    'submit #search-form': function(event) {
      event.preventDefault();

      var input = event.target.sub_name.value.trim();

      var r;
      r = utils.isMulti(input);
      if (r && r.username && r.multiname) {
        Router.go('/user/' + r.username + '/m/' + r.multiname);
        return;
      }

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

      console.log('invalid input');
      Session.set('errorMessage', 'Invaid input');
      Router.go('/' + sub_name);
    }
  });

  Template.catBar.events({
    'click #random-button': function(event) {
      Session.set('randomSubs', getRandomSubs());
    }
  });

}
