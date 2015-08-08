Router.route('/', function() {
  Session.set('errorMessage', '');

  this.render('index');
});

var example_string = 'https://www.reddit.com/r/listentothis';

var link_reg = /r\/(\w+)/;;
var name_reg = /(\w+)/;
var multi_reg = /\/user\/(\w+)\/m\/(\w+)/;

Template.subredditSearch.helpers({
  errorMessage: function() {
    return Session.get('errorMessage');
  }
});

Template.index.events({
  'submit #search-form': function(event) {
    event.preventDefault();

    var input = event.target.sub_name.value.trim();

    var m;
    if ((m = name_reg.exec(input)) !== null) {
      if (m.index === name_reg.lastIndex) {
        name_reg.lastIndex++;
      }

    if (m[0].length == input.length) {
      // the input is a reddit name
      console.log('redirect to /' + input);
       Router.go('/' + input);
      return;
    }
   }

    if ((m = multi_reg.exec(input)) !== null) {
      if (m.index === multi_reg.lastIndex) {
          multi_reg.lastIndex++;
      }

      if (m.length == 3) {
        var username = m[1];
        var mutliname = m[2];
        console.log('redirect to /' + username + '-' + mutliname);
        Router.go('/' + username + '-' + mutliname);
        return;
      }
    }

    if ((m = link_reg.exec(input)) !== null) {
      if (m.index === link_reg.lastIndex) {
          link_reg.lastIndex++;
      }

      if (m.length == 2) {
        console.log('redirect to /' + m[1]);
        Router.go('/' + m[1]);
        return;
      }
    }

    console.log('invalid input');
    Session.set('errorMessage', 'Invaid input');
    // Router.go('/' + sub_name);
  }
});
