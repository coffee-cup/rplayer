// the number times we want to call reddit for gifs
// each time we get 100 back
// so gifs count = GIF_SETS * 100
var GIF_SETS = 3;

// the number of times we will retry each gif set if it fails
// max gif requests to reddit = GIF_SETS * MAX_RETRY
var MAX_RETRY = 5;

// array to hold our gifs to show for loading
// do not keep them in database or anything cause its just 500ish strings
gifs = [];

// the gif id where the gifs are stored under in db
gif_id = null;

Gifs = new Mongo.Collection('gifs');

if (Meteor.isServer) {

  var ONE_HOUR = 60 * 60 * 1000; // ms

  /**
   * Check the status of gifs in the db
   * gif count > 1
   *   remove all and start fresh (call again after remove all gifs)
   * gif count = 1
   *   do nothing, assume gifs good
   * gif count = 0
   *   create new gif object with empty set of gifs
   *
   * return boolean
   *      Whether or not we shold fetch to get a new set of gifs
   */
  checkGifDB = function() {
    Winston.info('Checking Gif DB');
    var fetch_required = false;
    var data = Gifs.find({});
    var result = data.fetch();
    var reset = false;
    if (result.length > 1) {
      Winston.info('Gif DB count > 1, removing all');
      Gifs.remove({});
      reset = true;
    } else if (result.length <= 0) {
      reset = true;
      Winston.info('Gif DB empty');
    } else if (result.length === 1) {
      g = result[0];
      if (g.gifs) {
        Winston.info('found Gif in DB');
        gif_id = g._id
        if (g.date) {
          var n = Date.now;
          // gifs are stale
          if ((n - g.date) > ONE_HOUR) {
            fetch_required = true;
          } else {
            Winston.info('Do not need to get gifs at startup');
          }
        }
      } else {
        reset = true;
      }
    }

    if (reset) {
      fetch_required = true;
      Winston.info('inserting empty Gif collection');
      gif_id = Gifs.insert({
        gifs: [],
        date: null
      });
    }
    return fetch_required;
  }

  got_gifs = false;
  getGifSet = function(current_set, current_retry, after) {

    if (got_gifs) {
      return;
    }

    if (after === undefined || after === null) {
      after = null;
    }

    // we are done getting gifs
    if (current_set >= GIF_SETS) {
      got_gifs = true;
      Winston.info('got ' + gifs.length + ' gifs');
      if (gif_id) {
        Gifs.update(gif_id, {
          $set: {
            gifs: gifs,
            date: Date.now()
          }
        });
      }
      return;
    }

    // we have too many retries
    // go on to next set
    // which is just trying to get the same set again,
    // but with another set of retries if we are allowed
    if (current_retry >= MAX_RETRY) {
      getGifSet(current_set + 1, 0, after);
    }

    var url = 'https://www.reddit.com/r/gifs.json?limit=100'
    if (after) {
      url += '&after=' + after;
    }
    Winston.info('making gif request to ' + url);
    var result = Meteor.http.get(url, {
      timeout: 100000
    });

    if (result) {
      try {
        var children = result.data.data.children;
        if (children) {
          var last_id = null;
          for (var i = 0; i < children.length; i++) {
            var p = children[i].data;
            last_id = p.name;
            // dont use self posts
            if (p.domain !== 'self.gifs') {
              var u = p.url.replace('.gifv', '.gif');
              if (u.indexOf('.gif') === -1) {
                continue;
              }

              // keep site secure with ssl only
              var r = utils.avalHTTPS(u, true);
              if (!r || !r.aval || !r.url) {
                continue;
              }
              u = r.url;

              var g = {
                url: u,
                name: p.name,
                title: p.title,
                author: p.author
              }
              gifs.push(g);
            }
          }

          if (last_id) {
            getGifSet(current_set + 1, 0, last_id);
          }

          return;
        }
      } catch (err) {}
    }

    // we get to here if the fetch or parse failed
    // try again with retry increase
    Winston.error('gif set: ' + current_set + ' failed. url: ' + url + ' Retrying with retry ' + current_retry + 1);
    getGifSet(current_set, current_retry + 1, after);
  }
}
