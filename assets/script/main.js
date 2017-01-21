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
var user;

// signInWithPopup
var provider = new firebase.auth.FacebookAuthProvider();
// provider.addScope('user_birthday');
firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    // console.log(result)
    var token = result.credential.accessToken;
    // The signed-in user info.
    user = result.user;
    console.log(user)

    console.log(database.ref("/users").child("email").exists())
    // if (!) {
    //   database.ref("/users/" + user.uid).push({ email: user.email, });
    //   console.log(database.ref().queryOrderedByChild("email"))
    // }


}).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
});

database.ref("/users").on("value", function(snap){
  // console.log(user)
})

firebase.auth().onAuthStateChanged(function(user) {
    // console.log("User in onAuthStateChanged: ", user)
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

var activeDiv;
var inactiveDiv;
var newDiv;

//Audio api variables
var player = document.querySelector("audio");
var songs = [];
var count = songs.length;

function getSong(mood) {
    var format = "json";
    var moodName = mood;
    var client_id = "56d30c95"; // FIXME Change this when you get the key

    $.ajax({
            url: "https://api.jamendo.com/v3.0/playlists/tracks/?client_id=" + client_id + "&format=json&limit=5&name=" + moodName,
            method: 'GET'
        })
        .done(function(response) {
            var data = response.results[0];
            var tracks = data.tracks;

            //blow away old songs
            songs = [];

            for (t in tracks) {
                songs.push(tracks[t].audio);
            }
            // console.log(data, tracks);
            console.log(songs);
            playSong(songs[0]);
        });
}

function playSong(song) {
    player.setAttribute("src", song);
    player.play();
}

function stopSong() {
    player.pause()
}

function nextSong() {
    count += 1;
    if (count > songs.length) {
        count = 0;
    }
    let next = songs[count];
    console.log(next);
    playSong(next);
    console.log(count);
}

function loadList() {
    console.log("Hello");

    moodSelected = $(this).attr("data-name");

    var queryURL = "https://crossorigin.me/https://addb.absolutdrinks.com/drinks/tagged/" + moodSelected + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";

    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    })

    .done(function(response) {
        console.log(response);
        activeDiv = $("<div>");
        activeDiv.addClass("item active");
        $(".carousel-inner").append(activeDiv);

        inactiveDiv = $("<div>");
        inactiveDiv.addClass("item");
        $(".carousel-inner").append(inactiveDiv);

        for (var i = 0; i < 5; i++) {
            var name = response.result[i].name;
            newDiv = $("<div>");
            // newDiv.addClass("col-md-2 cocktailList");
            newDiv.addClass("item-style cocktailList");
            newDiv.attr("id", "cocktailID");

            newDiv.attr("data-drink-name", name);
            newDiv.append("<h3>" + name + "</h3>");
            nameOnSrc = name.replace(/ /g, '-');
            newDiv.attr("data-nameOnSrc", nameOnSrc);
            newDiv.append("<img src=http://assets.absolutdrinks.com/drinks/200x200/" + nameOnSrc + ".jpg>");
            $(activeDiv).append(newDiv);
        }

        for (var i = 5; i < 10; i++) {
            var name = response.result[i].name;
            newDiv = $("<div>");
            // newDiv.addClass("col-md-2 cocktailList");
            newDiv.addClass("item-style cocktailList");
            newDiv.attr("id", "cocktailID");

            newDiv.attr("data-drink-name", name);
            newDiv.append("<h3>" + name + "</h3>");
            nameOnSrc = name.replace(/ /g, '-');
            newDiv.attr("data-nameOnSrc", nameOnSrc);
            newDiv.append("<img src=http://assets.absolutdrinks.com/drinks/200x200/" + nameOnSrc + ".jpg>");
            $(inactiveDiv).append(newDiv);
        }

    });

    getSong(moodSelected);
}

$(".carousel-control").on("click", function() {
    activeDiv.toggleClass(inactiveDiv);
    inactiveDiv.toggleClass(activeDiv);

});


function displayRecipe() {
    console.log("he");
    //$('#myModal').modal('show');
    console.log($(this));
    //jQuery.noConflict();
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

    // console.log('hi');

    $(document).on("click", ".mood-style", loadList);

    //            $("#cocktailID").on("click",function(){
    //                displayRecipe();
    //            });

    $(".carousel-inner").on("click", ".cocktailList", displayRecipe);

    //			 $(".carousel-inner").on("click", ".cocktailList", function(){
    //				  console.log("he");
    //        //$('#myModal').modal('show');
    //        console.log($(this));
    ////				 jQuery.noConflict();
    //        $("#cocktail-name").html($(this).attr("data-drink-name"));
    //        $("#image-holder").attr("src", "http://assets.absolutdrinks.com/drinks/145x200/" + $(this).attr("data-nameOnSrc") + ".jpg");
    //        drinkSelected = $(this).attr("data-nameOnSrc");
    //
    //        var queryURL = "https://addb.absolutdrinks.com/drinks/" + drinkSelected.toLowerCase() + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";
    //
    //
    //        console.log(queryURL);
    //
    //        $.ajax({
    //            url: queryURL,
    //            method: "GET"
    //        })
    //
    //        .done(function(response) {
    //				console.log(response);
    //					var ingredient_list=response.result[0].ingredients;
    //					console.log(ingredient_list);
    //
    //					for (var i = 0; i < ingredient_list.length;i++){
    //						$(".ingredients-list").append("<p>" + ingredient_list[i].textPlain + "</p>");
    //					}
    //
    //					$("#instructions-area").text(response.result[0].descriptionPlain);
    //				});
    //           $("#myModal").modal();
    ////				 $("#myModal").modal();
    //        });
}
