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
    console.log(r);
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
  }
});
