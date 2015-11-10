music_subs = [];

popular_subs = [{
  subreddit: 'ListenToThis',
  link: '/r/ListenToThis'
}, {
  subreddit: 'futurebeats',
  link: '/r/futurebeats'
}, {
  subreddit: 'chillmusic',
  link: '/r/chillmusic'
}, {
  subreddit: 'MusicForConcentration',
  link: '/r/MusicForConcentration'
}, {
  subreddit: 'videos',
  link: '/r/videos'
}];

multis = [{
  subreddit: 'True Music',
  link: '/user/evilnight/m/truemusic'
}, {
  subreddit: 'The Firehose',
  link: '/user/evilnight/m/thefirehose'
}, {
  subreddit: 'Electronic Music',
  link: '/user/evilnight/m/electronic'
}, {
  subreddit: 'Rock',
  link: '/user/evilnight/m/rock'
}, {
  subreddit: 'The Drip',
  link: '/user/evilnight/m/thedrip'
}];

randomSubs = function() {
  var random = [];
  var success_counted = 0;
  var nums = [];
  while (success_counted < 5) {
    var n = Math.floor(Math.random() * music_subs.length);
    if (nums.indexOf(n) == -1) {
      success_counted += 1;
      nums.push(n);
      random.push(music_subs[n]);
    }
  }
}

loadMusicSubs = function() {
  Winston.info('loading music subs from json');
  var data = JSON.parse(Assets.getText('music_subs.json')).music_subs;
  data.forEach(function(obj) {
    music_subs.push({
      subreddit: obj,
      link: '/r/' + obj
    });
  });
}
