
var url = null;


Template.sort.onRendered(function() {
  url = location.pathname;

  Session.set('sort', '');
  Session.set('t', '');

  var result = utils.isSort(url, Session.get('query'));
  if (result.sort.length > 4) {
    result.sort = result.sort.substring(0, 4);
  }
  Session.set('sort', result.sort);
  if (result.t) {
    Session.set('t', result.t[0]);
  }
});

Template.sort.helpers({
  sort: function() {
    return Session.get('sort');
  },

  t: function() {
    return Session.get('t');
  }
});

Template.sort.events(function() {

});
