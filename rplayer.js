if (Meteor.isClient) {

// Template.loginForm.events({
//     'submit form': function(event) {
//       event.preventDefault();

//       console.log(event.target.username.value + ' : ' + event.target.password.value);
//       var username = event.target.username.value;
//       var password = event.target.password.value;
//       Meteor.loginWithReddit({username: username, password: password}, function(res, re) {
//         console.log(res);
//         console.log(re);
//       });

//       return false;
//     }
//   });

}

if (Meteor.isServer) {

}
