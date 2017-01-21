// Firebase Setup and Initalization
var config = {
    apiKey: "AIzaSyDoOkqPqY8bu68SFTBAkxof3DTqeyDUHBI",
    authDomain: "mood-shaker.firebaseapp.com",
    databaseURL: "https://mood-shaker.firebaseio.com",
    storageBucket: "mood-shaker.appspot.com",
    messagingSenderId: "243141168442"
};
// Init db app and create handle
firebase.initializeApp(config);
var database = firebase.database();

// signInWithPopup
var provider = new firebase.auth.FacebookAuthProvider();
// provider.addScope('user_birthday');
firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    console.log(result)
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(user)
    database.ref("/users").set({
        user: user.email,
        token: token
    });

}).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
          $("button.signOut").hide();
    } else {
          $("button.signOut").hide();
    }
});

// SignOut
$("button.signOut").on("click", function() {
    console.log("Sign-Out Called")
    // firebase.auth().signOut().then(function() {
    //     // Sign-out successful.
    //     // redirect to splash page to login again
    // }, function(error) {
    //     // An error happened.
    // });
})
