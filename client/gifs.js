// array of gifs
gifs = [];

Template.gifs.rendered = function() {

  var cursor = Gifs.find({});
  var result = cursor.fetch();
  if (result && result.length >= 1) {
    var data = result[0];
    if (data && data.gifs) {
      gifs = data.gifs
      Session.set('gifs', gifs);
    }
  }
}

Template.gifs.helpers({
  gifs: function() {
    return Session.get('gifs');
  }
});
