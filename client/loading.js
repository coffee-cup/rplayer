var messages = [];
var current_message = -1;
var messages_length = -1;

var getListOfMessages = function() {
  Meteor.call('getListOfMessages', function(err, data) {
    if (data) {
      if (data.success && data.messages) {

        messages = data.messages;
        messages.forEach(function(obj) {

          if (!obj.title) {
            obj.title = '';
          }
          if (!obj.dur) {
            obj.dur = 3; // default duration of 3 seconds
          }
          if (!obj.msg) {
            obj.msg = '';
          }

          var t = "";
          var in_break = false;
          var end_break = false;
          for (var i = 0; i < obj.title.length; i++) {
            var l = obj.title[i];
            if (!in_break && l === '<') {
              in_break = true;
            }

            if (!in_break) {
              t += "<span>" + l + "</span>";
            } else {
              t += l;
              if (!end_break && l === '/') {
                end_break = true;
              }
              if (l === '>') {
                end_break = false;
                in_break = false;
              }
            }
          }
          obj.stext = t;
        });

        messages_length = messages.length;
        if (messages.length > 0) {
          startStory();
        }
      }
    }
  });
}

/**
 * returns the current message or null
 */
var currentMessage = function() {
  if (current_message >= 0 && current_message < messages_length) {
    return messages[current_message];
  }
  return null;
}

/**
 * Start the message story
 */
var startStory = function() {
  current_message = 0;
  switchStory();
}

/**
 * Switch the message in the story
 */
var switchStory = function() {
  var cm = currentMessage();
  if (cm) {
    // Session.set('message', cm);
    $('#story-p').html(cm.stext);
    TweenMax.staggerFromTo($('#story-p').find("span"), 0.05, {
      autoAlpha: 0
    }, {
      autoAlpha: 1,
      ease: Power2.easeInOut
    }, 0.1);
    current_message += 1;
    setTimeout(function() {
      switchStory();
    }, cm.dur * 1000);
  }
}

Template.load.rendered = function() {
  getListOfMessages();
}

Template.load.helpers({
  title: function() {
    var cm = Session.get('message');
    if (cm) {
      return sm.title;
    }
    return '';
  },

  message: function() {
    var cm = Session.get('message');
    if (cm) {
      return sm.msg;
    }
    return '';
  }
});
