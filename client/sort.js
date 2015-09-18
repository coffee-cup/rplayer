var url = null;

sort = {
  parseUrl: function() {
    url = Session.get('path');

    Session.set('sort', '');
    Session.set('t', '');
    Session.set('isT', false);

    var result = utils.isSort(url, Session.get('query'));
    if (result.sort.length > 4) {
      result.sort = result.sort.substring(0, 4);
    }
    Session.set('sort', result.sort);
    if (result.t) {
      Session.set('isT', true);
      Session.set('t', result.t[0]);
    }
  }
}

Template.sort.onRendered(function() {
  sort.parseUrl();
});

Template.sort.helpers({
  sort: function() {
    return Session.get('sort');
  },

  t: function() {
    return Session.get('t');
  },

  isT: function() {
    return Session.get('isT');
  }
});

var redirectSort = function(sort, t) {
  var base = Session.get('base_reddit');
  if (sort === 'top') {
    Router.go(base + '/' + sort + '?sort=' + sort + '&t=' + t);
  } else {
    Router.go(base + '/' + sort);
  }
  everythingIn();
}

var everythingIn = function() {
  // slide options in
  TweenLite.to('#selection', SELECTION_DURATION, {
    opacity: 1,
    ease: EASING
  });

  TweenLite.to('#opt_top', SLIDE_DURATION, {
    opacity: 0,
    right: '0',
    ease: EASING,
    delay: 0.1
  });
  TweenLite.to('#opt_new', SLIDE_DURATION, {
    opacity: 0,
    right: '0',
    ease: EASING,
    delay: 0.05
  });
  TweenLite.to('#opt_hot', SLIDE_DURATION, {
    opacity: 0,
    right: '0',
    ease: EASING,
    delay: 0
  });

  TweenLite.to('.can', 0, {
    opacity: 100,
    ease: EASING
  });
  TweenLite.to('.cant', 0, {
    opacity: 100,
    ease: EASING
  });

  if (top_out) {
    TweenLite.to('#top_day', SLIDE_DURATION, {
      opacity: 0,
      right: '0',
      ease: EASING,
      delay: 0.15
    });
    TweenLite.to('#top_mon', SLIDE_DURATION, {
      opacity: 0,
      right: '0',
      ease: EASING,
      delay: 0.1
    });
    TweenLite.to('#top_year', SLIDE_DURATION, {
      opacity: 0,
      right: '0',
      ease: EASING,
      delay: 0.05
    });
    TweenLite.to('#top_all', SLIDE_DURATION, {
      opacity: 0,
      right: '0',
      ease: EASING,
      delay: 0
    });

    top_out = false;
  }

  options_out = false;
}

var SELECTION_DURATION = 0.375;
var SLIDE_DURATION = 0.150;
var EASING = Power2.easeInOut;

var options_out = false;
var top_out = false;

Template.sort.events({
  'click #selection': function() {

    // animate sort options out
    if (!options_out) {

      // slide options out
      TweenLite.to('#selection', SELECTION_DURATION, {
        opacity: 0.5,
        ease: EASING
      });

      TweenLite.to('#opt_top', SLIDE_DURATION, {
        opacity: 100,
        right: '80px',
        ease: EASING,
        delay: 0.1
      });
      TweenLite.to('#opt_new', SLIDE_DURATION, {
        opacity: 100,
        right: '130px',
        ease: EASING,
        delay: 0.05
      });
      TweenLite.to('#opt_hot', SLIDE_DURATION, {
        opacity: 100,
        right: '190px',
        ease: EASING,
        delay: 0
      });

      TweenLite.to('.can', 0, {
        opacity: 0,
        ease: EASING
      });
      TweenLite.to('.cant', 0, {
        opacity: 0,
        ease: EASING
      });

      options_out = true;
    } else {
      everythingIn();
    }
  },

  'click #opt_top': function() {

    // animate top options out
    if (!top_out) {
      TweenLite.to('#opt_top', SLIDE_DURATION, {
        opacity: 0.5,
        right: '80px',
        ease: EASING
      });
      TweenLite.to('#opt_new', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0.05
      });
      TweenLite.to('#opt_hot', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0
      });

      TweenLite.to('#top_day', SLIDE_DURATION, {
        opacity: 1,
        right: '120px',
        ease: EASING,
        delay: 0.15
      });
      TweenLite.to('#top_mon', SLIDE_DURATION, {
        opacity: 1,
        right: '170px',
        ease: EASING,
        delay: 0.1
      });
      TweenLite.to('#top_year', SLIDE_DURATION, {
        opacity: 1,
        right: '230px',
        ease: EASING,
        delay: 0.05
      });
      TweenLite.to('#top_all', SLIDE_DURATION, {
        opacity: 1,
        right: '290px',
        ease: EASING,
        delay: 0
      });


      top_out = true;
    } else {
      TweenLite.to('#opt_top', SLIDE_DURATION, {
        opacity: 1,
        right: '80px',
        ease: EASING
      });
      TweenLite.to('#opt_new', SLIDE_DURATION, {
        opacity: 1,
        right: '130px',
        ease: EASING,
        delay: 0.05
      });
      TweenLite.to('#opt_hot', SLIDE_DURATION, {
        opacity: 1,
        right: '190px',
        ease: EASING,
        delay: 0
      });

      TweenLite.to('#top_day', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0.15
      });
      TweenLite.to('#top_mon', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0.1
      });
      TweenLite.to('#top_year', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0.05
      });
      TweenLite.to('#top_all', SLIDE_DURATION, {
        opacity: 0,
        right: '0',
        ease: EASING,
        delay: 0
      });

      top_out = false;
    }
  },

  'click #opt_new': function() {
    redirectSort('new');
  },

  'click #opt_hot': function() {
    redirectSort('hot');
  },

  'click #top_day': function() {
    redirectSort('top', 'day');
  },

  'click #top_mon': function() {
    redirectSort('top', 'month');
  },

  'click #top_year': function() {
    redirectSort('top', 'year');
  },

  'click #top_all': function() {
    redirectSort('top', 'all');
  }
});
