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
    }, 0.07);
    current_message += 1;
    setTimeout(function() {
      switchStory();
    }, cm.dur * 1000);
  }
}

// global to hold all gifs = [];
gifs = [];

// all the gifs that have loaded onto the page
loaded_gifs = [];

// global index
play_index = -1;

// current jquery gif playing
current_gif = null;

// number of images to load in at a time
PRELOAD_COUNT = 3;

Template.load.rendered = function() {
  // getListOfMessages();
  Session.set('isGif', false);
  Session.set('gifsLoaded', false);
  Session.set('loaded_gifs', []);

  var cursor = Gifs.find({});
  var result = cursor.fetch();
  if (result && result.length >= 1) {
    var data = result[0];
    if (data && data.gifs) {
      gifs = data.gifs;
      Session.set('gifsLoaded', true)
    }
  }

  // Meteor.call('returnGifs', function(err, data) {
  //   if (!err && data) {
  //     gifs = data;

  //     // need to allow blaze if statement to render #yesGif div
  //     Session.set('gifsLoaded', true);
  //   }
  // });
}

// Called when the place where gifs will be held is loaded
// Do whatever you need to do after we have the gifs from
// the server and are ready to display them
Template.gifStack.rendered = function() {
  var count = PRELOAD_COUNT;
  if (gifs && gifs.length < PRELOAD_COUNT) {
    count = gifs.length;
  }

  pe = document.getElementById('yesGif');
  for (var i = 0; i < count; i++) {
    var ge = createGifElement(gifs[i]);
    pe.appendChild(ge);
    loaded_gifs.push(gifs[i]);
  }
  Session.set('isGif', false);
}

var createGifElement = function(gif) {
  var a = document.createElement('a');
  a.setAttribute('target', '_blank');
  a.setAttribute('id', 'a-' + gif.name);
  a.setAttribute('href', gif.url);
  a.classList.add('hidden');

  var im = document.createElement('img');
  im.setAttribute('src', gif.url);
  im.setAttribute('alt', gif.title);
  im.setAttribute('id', 'gif-img-' + gif.name);
  im.classList.add('gif-img');

  // a.append(im);
  a.appendChild(im);
  return a;
}

var nextGif = function() {
  if (!gifs || gifs.length == 0) {
    return;
  }

  play_index += 1;
  if (play_index < 0) play_index = 0;
  if (play_index >= gifs.length) {
    play_index = 0;
  }

  var g = gifs[play_index];
  var pe = $('#yesGif');
  pe = document.getElementById('yesGif');

  if (play_index >= loaded_gifs.length - 1 && loaded_gifs.length < gifs.length) {
    // load the next 10 images
    var end = PRELOAD_COUNT + loaded_gifs.length;
    if (end > gifs.length) end = gifs.length;
    for (var i = loaded_gifs.length; i < end; i++) {
      var ge = createGifElement(gifs[i]);
      // pe.append(ge);
      pe.appendChild(ge);
      loaded_gifs.push(gifs[i]);
    }
  }

  if (play_index - 1 >= 0) {
    var og = gifs[play_index - 1];
    var oge = $('#a-' + og.name);
    oge.addClass('hidden');
    oge.remove();
  }

  var ge = $('#a-' + g.name);
  ge.removeClass('hidden');
  Session.set('gif', g);
  Session.set('isGif', true);
}

Template.load.helpers({
  title: function() {
    var cm = Session.get('message');
    if (cm) {
      return sm.title;
    }
    return '';
  },

  loaded_gifs: function() {
    return Session.get('loaded_gifs');
  },

  isGif: function() {
    return Session.get('isGif');
  },

  gif: function() {
    return Session.get('gif');
  },

  gifsLoaded: function() {
    return Session.get('gifsLoaded');
  },

  message: function() {
    var cm = Session.get('message');
    if (cm) {
      return sm.msg;
    }
    return '';
  }
});

Template.load.events({
  'click #next-gif img': function() {
    nextGif();
  }
})
