Template.controls.helpers({
  playing: function() {
    return Session.get('playing');
  },

  canPlay: function() {
    return Session.get('canPlay');
  },

  canPrev: function() {
    return Session.get('canPrev');
  },

  canNext: function() {
    return Session.get('canNext');
  },

  canPause: function() {
    return Session.get('canPause');
  },

  canEye: function() {
    return Session.get('canEye');
  },

  canControl: function() {
    return Session.get('canControl');
  }
});
