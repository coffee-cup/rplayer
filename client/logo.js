var EASE_DURATION = 0.6;
var EASE_FUNCTION = Power2.easeInOut;

var tl;
var pause_next = false;


Template.logo.onRendered(function() {
  tl = new TimelineMax({
    paused: true,
    repeat: -1
  });
  tl.to('#logo-circle', EASE_DURATION, {
      scale: 0.2,
      transformOrigin: "center center",
      ease: EASE_FUNCTION
    })
    .to('#logo-circle', EASE_DURATION, {
      scale: 1,
      transformOrigin: "center center",
      ease: EASE_FUNCTION
    });

  tl.eventCallback("onRepeat", function() {
    if (pause_next) {
      pause_next = false;
      tl.pause();
    }
  });

  $('#logo-link-svg').on('mouseenter', function() {
    tl.play();
  }).on('mouseleave', function() {
    pause_next = true;
  });

});
