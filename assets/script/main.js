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
    database.ref("/users").push({
        user: {
            email: user.email,
        },
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
    console.log("User in onAuthStateChanged: ", user)
    if (user) {
        $("button#btn-signOut").show();
    } else {
        $("button#btn-signOut").hide();
    }
});

// SignOut
$(document).ready(function() {
    $("#btn-signOut").click(function() {
        console.log("Sign-Out Called");
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            // redirect to splash page to login again
        }, function(error) {
            // An error happened.
        });
    });
});

//================ Absolute API CODE =================
var moodList = ["party", "romantic", "relax", "cry"];
var moodSelected, drinkSelected;
var nameOnSrc;


function loadList() {
    console.log("Hello");

    moodSelected = $(this).attr("data-name");

    var queryURL = "https://addb.absolutdrinks.com/drinks/tagged/" + moodSelected + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";

    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    })

    .done(function(response) {
        console.log(response);
        for (var i = 0; i < 5; i++) {
            var name = response.result[i].name;
            var newDiv = $("<div>");
            // newDiv.addClass("col-md-2 cocktailList");
            newDiv.addClass("item active");
            newDiv.attr("id", "cocktailID");

            newDiv.attr("data-drink-name", name);
            newDiv.append("<h3>" + name + "</h3>");
            nameOnSrc = name.replace(/ /g, '-');
            newDiv.attr("data-nameOnSrc", nameOnSrc);
            newDiv.append("<img src=http://assets.absolutdrinks.com/drinks/200x200/" + nameOnSrc + ".jpg>")
            $(".carousel-inner").append(newDiv);
        }
    });
}


function displayRecipe() {
    console.log("he");
    //$('#myModal').modal('show');
    console.log($(this));
    jQuery.noConflict();
    $("#cocktail-name").html($(this).attr("data-drink-name"));
    $("#image-holder").attr("src", "http://assets.absolutdrinks.com/drinks/145x200/" + $(this).attr("data-nameOnSrc") + ".jpg");
    drinkSelected = $(this).attr("data-nameOnSrc");

    var queryURL = "https://addb.absolutdrinks.com/drinks/" + drinkSelected.toLowerCase() + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";


    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    })

    .done(function(response) {
        console.log(response);
        var ingredient_list = response.result[0].ingredients;
        console.log(ingredient_list);

        for (var i = 0; i < ingredient_list.length; i++) {
            $(".ingredients-list").append("<p>" + ingredient_list[i].textPlain + "</p>");
        }

        $("#instructions-area").text(response.result[0].descriptionPlain);
    });
    $("#myModal").modal();

}


window.onload = function() {

    console.log('onload fired');

    $(document).on("click", ".mood-style", loadList);
    $(".cocktailList").on("click", function() {
        displayRecipe();
    });

    //$(".carousel-inner").on("click", ".cocktailList", displayRecipe);


}
