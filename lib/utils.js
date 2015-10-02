utils = {

  // check if input is subreddit
  // if it is, return subreddit
  isSubreddit: function(input) {
    var name_reg = /^([\w+]+)$/i;
    var m;
    // check if input is plain subreddit
    if ((m = name_reg.exec(input)) !== null) {
      if (m.index === name_reg.lastIndex) {
        name_reg.lastIndex++;
      }

      if (m[0].length == input.length) {
        // the input is a reddit name
        return {
          subreddit: input
        };
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
        return {
          username: username,
          multiname: multiname
        };
      }
    }
    return null;
  },

  // check if input is reddit link
  // if it is, return the subreddit
  isLink: function(input) {
    var link_reg = /\/?r\/([\w+]+)\/?/i;
    var m;
    if ((m = link_reg.exec(input)) !== null) {
      if (m.index === link_reg.lastIndex) {
        link_reg.lastIndex++;
      }

      if (m.length == 2) {
        return {
          link: m[1],
          subreddit: this.subFromLink((input))
        };
      }
    }
    return null;
  },

  // return subreddit portion of a link
  subFromLink: function(input) {
    var link_reg = /\/r\/([\w+]+)/;
    var m;
    if ((m = link_reg.exec(input)) !== null) {
      if (m.index === link_reg.lastIndex) {
        link_reg.lastIndex++;
      }

      if (m.length == 2) {
        return m[1];
      }
    }
    return null;
  },

  randomId: function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  },

  //  possible reddit sort words
  sort_words: [
    'hot',
    'top',
    'new',
    'rising',
    'controversial',
    'gilded'
  ],

  // possible reddit top sort words
  top_words: [
    'hour',
    'day',
    'week',
    'month',
    'year',
    'all'
  ],

  // returns if input string is valid sort param
  isSortWord: function(str) {
    var sort_word = false;
    this.sort_words.forEach(function(w) {
      if (w === str) {
        sort_word = true;
      }
    });
    return sort_word;
  },

  // returns if input string is valid top param
  isTopWord: function(str) {
    var top_word = false;
    this.top_words.forEach(function(w) {
      if (w === str) {
        top_word = true;
      }
    });
    return top_word;
  },

  // returns either 'hot', 'top', 'new', or the default (hot),
  // depending if the url is sorted
  // This checks the following cases
  //
  // url = '/r/ListenToThis/top'
  // url = '/r/ListenToThis?sort=top'
  //
  // if both are found, the latter is given priority
  isSort: function(input, query) {

    // check if sort is in slash form
    // e.g. url = https://reddit.com/r/ListenToThis/top
    //      matches = top
    var re = /\/(\w+)/g;
    var m = input.match(re);
    var sort = null;
    var t = null;
    if (m && m[m.length - 1]) {
      sort = m[m.length - 1];
      sort = sort.substring(1, sort.length);
      if (!sort || !this.isSortWord(sort)) {
        sort = null;
      }
    }

    // check if sort is in query
    // also checks for t param in sort
    if (query) {
      sort_q = query.sort;
      t = query.t;

      if (sort_q && this.isSortWord(sort_q)) {
        sort = sort_q
      }

      if (!t || !this.isTopWord(t)) {
        t = null;
      }
    }

    var sort_obj = {};
    if (sort) {
      if (sort === 'top') {
        if (!t) {
          t = 'all';
        }
        sort_obj = {
          sort: sort,
          t: t
        };
      } else if (sort) {
        sort_obj = {
          sort: sort
        };
      }
    } else {
      sort_obj = {
        sort: 'hot'
      };
    }
    return sort_obj;
  },

  // returns whether or not the user is on mobile device
  isMobile: function(input) {
    var isMobile = false; //initiate as false
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
    return isMobile;
  },

  /*
   * Validates the given input
   * returns obj
   *   {valid: boolean, msg: string}
   */
  validateInput: function(input) {
    if (input === null || input === undefined && input === '') {
      console.log('invalid');
      return {
        valid: false,
        msg: 'Invalid Input'
      };
    }

    if (this.isLink(input) || this.isSubreddit(input) || this.isMulti(input)) {
      console.log('valid');
      return {
        valid: true,
        msg: null
      };
    }
    return {
      valid: false,
      msg: 'Cannot get media from there'
    };
  },

  /**
   * Returns object containing whether or not
   * https was available for that url,
   * if it is available, it returns success and the url
   * if check_source is true, it only converts to https for specific urls
   * returns object
   *   {aval: boolean, url: string}
   */
  avalHTTPS: function(input, check_source) {
    if (input.indexOf('https') != -1) {
      return {
        aval: true,
        url: input
      };
    }
    if (!check_source) {
      var u = input.replace('http', 'https');
      return {
        aval: true,
        url: u
      };
    } else {
      var passed = false;

      // allowed urls to convert to https
      var whitelist = [
        'giphy',
        'imgur'
      ];
      for (var i = 0; i < whitelist.length; i++) {
        if (input.indexOf(whitelist[i]) !== -1) {
          passed = true;
          break;
        }
      }

      if (passed) {
        return {
          aval: true,
          url: input.replace('http', 'https')
        };
      } else {
        return {
          aval: false,
          url: null
        };
      }
    }
  }
}
