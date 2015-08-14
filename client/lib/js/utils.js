
utils = {

  // check if input is subreddit
  // if it is, return subreddit
  isSubreddit: function(input) {
    var name_reg = /([\w+]+)/;
    var m;
    // check if input is plain subreddit
    if ((m = name_reg.exec(input)) !== null) {
      if (m.index === name_reg.lastIndex) {
        name_reg.lastIndex++;
      }

      if (m[0].length == input.length) {
        // the input is a reddit name
        return {subreddit: input};
      }
    }
    return null;
  },

  // check if input is reddit multi reddit
  // if it is, return username and multiname
  isMulti: function(input) {
    var multi_reg = /\/user\/(\w+)\/m\/(\w+)/;
    var m;
    // check if input is mutli reddit
    if ((m = multi_reg.exec(input)) !== null) {
      if (m.index === multi_reg.lastIndex) {
        multi_reg.lastIndex++;
      }

      if (m.length == 3) {
        var username = m[1];
        var multiname = m[2];
        return {username: username, multiname : multiname};
      }
    }
    return null;
  },

  // check if input is reddit link
  // if it is, return the subreddit
  isLink: function(input) {
    var link_reg = /\/r\/([\w+]+)/;
    var m;
    if ((m = link_reg.exec(input)) !== null) {
      if (m.index === link_reg.lastIndex) {
        link_reg.lastIndex++;
      }

      if (m.length == 2) {
        return {subreddit: m[1]};
      }
    }
      return null;
    }
}
