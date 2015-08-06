Router.route('/', function() {
  this.render('index');
});

Template.index.events({
  'submit #search-form': function(event) {
    event.preventDefault();

    var sub_name = event.target.sub_name.value.trim();
    Router.go('/' + sub_name);
  }
});
