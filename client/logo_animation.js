
var ANIMATION_TIME = 500;
var CIRCLE_RADIUS_FULL = 27;
var CIRCLE_RADIUS_SMALL = 12;

var s;
var g;
var circle;
var headphones;

var cont_animate = false;

var loaded = false;

// expose global animation object for rest of meteor client
animations = {
  // use snap svg to aniamte the logo
  logo_animation: function() {
    return;
    s = Snap("#logo-link-svg");
    g = s.group();
    heaphones = g.group();

    // load heaphones icon
    Snap.load('/icons/headphones.svg', function(f) {
      heaphones.append(f);
    });

    // setup red circle
    circle = s.circle(48, 59, CIRCLE_RADIUS_FULL);
    circle.attr({
      fill: '#B9121B'
    });
    g.append(circle);

    var in_an = function() {
      if (cont_animate) {
        circle.animate({r: CIRCLE_RADIUS_SMALL}, ANIMATION_TIME, null, function() {
          circle.animate({r: CIRCLE_RADIUS_FULL}, ANIMATION_TIME, null, function() {
            in_an();
          });
        });
      }
    }

    s.hover(function() { // hover over
      cont_animate = true;
      in_an();
    }, function() { // hover out
      cont_animate = false;
    });

    // Snap.load('/icons/circle.svg', function(f) {
    //   circle.append(f);
    //   g.append(circle);
    //   g.hover(function() { // hover over
    //     circle.animate({transform: 's200'}, ANIMATION_TIME);
    //     heaphones.animate({transform: 't100,5'}, ANIMATION_TIME);
    //   }, function() { // hover out
    //     circle.animate({transform: 's1'}, ANIMATION_TIME);
    //     heaphones.animate({transform: 't0,0'}, ANIMATION_TIME);
    //   })
    // });
  }
}
