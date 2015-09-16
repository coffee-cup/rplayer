var messages = [];
var current_message = -1;
var messages_length = -1;

var getListOfMessages = function() {
  Meteor.call('getListOfMessages', function(err, data) {
    if (data) {
      console.log(data);
      if (data.success && data.messages) {
        messages = data.messages;
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
  var cm = currentMessage();
  if (cm) {
    switchStory();
    setTimeout(function() {
      switchStory();
    }, cm.dur * 1000);
  }
}

/**
 * Switch the message in the story
 */
var switchStory = function() {
  var cm = currentMessage();
  if (cm) {
    Session.set('message', messages[current_message].msg);
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
  message: function() {
    return Session.get('message');
  }
});
