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

var userData; // global handle for authenticated user data

//=============== AUTHENTICATION =========================
// var provider = ;
function signUserIn() {
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(function(result) {
        const user = result.user;

        // If user authenticated correctly check if they already have data
        // in storage otherwise create new userData domain for the user.
        if (firebase.auth().currentUser !== null) {

            var userRef = database.ref("users/" + user.uid);
            existingUser(user.uid, function(isexisting) {

                if (isexisting) {

                    //-----update handle to authenticated users data
                    userRef.once("value").then(function(snap) {
                        userData = snap.val();
                    });
                    //-----update the email address in case email changes
                    userRef.update({
                        email: user.email
                    });

                } else {
                    // If first time visit create user data domain
                    console.log("user doesn't exist")
                    userRef.set({
                        email: user.email
                    });
                }
                displayFavList();
            });
        }



    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(errorCode, errorMessage, email, credential)
    }); //======== End Authentication =================
}


function signUserOut() {



    if (firebase.auth().currentUser !== null) {
        firebase.auth().signOut()
            .then(function() {
                // Sign-out successful.
                // Reset UserData to empty object
                $("button.sign-in-btn").text("Sign In");
                userData = {};

            }, function(error) {
                var fullName = firebase.auth().currentUser.displayName;
                var firstName = fullName.split(" ")

                // An error happened.
                alert("Logout Unsuccessful")
                $("button.sign-in-btn").text(firstName[0] + " , sign out?");
            });

    }

}

function getUserData() {
    return userData;
}

function existingUser(userID, callback) {

    var usrRef = database.ref("users/");

    usrRef
        .child(userID)
        .once("value")
        .then(function(snapshot) {
            var exists = (snapshot.val() !== null);
            callback(exists);
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log(errorCode, errorMessage, email, credential);
            callback(false);
        });

};

//==========  Database Functions =====================

function addUserLike(recipe_id) {
    var user = firebase.auth().currentUser;
    var likesCollection = database.ref("users/" + user.uid + "/likes");
    likesCollection.push({
        //GET CURRENT ACTIVE RECIPE ID and add to collection
        recipe_id: recipe_id
    });

}


function removeUserLike(like_id) {
    var user = firebase.auth().currentUser;
    var likes = database.ref("users/" + user.uid + "/likes");
    if (user !== null) {
        likes.on("child_added", function(snap) {
            if (snap.val().recipe_id === like_id) {
                console.log('removing ' + snap.val().recipe_id)

                snap.ref.remove();
            }
        });

    } else {
        alert("No user logged in.");
    }
}

function displayFavList() {
    var user = firebase.auth().currentUser;
    var likesCollection = database.ref("users/" + user.uid + "/likes");
    if (user) {
        database.ref("users/" + user.uid).child("likes").on("child_added", function(snap) {
            var newLiItem = $("<li>");
            var newLink = $("<a>");
            var newDrink = $("<h5>");
            newDrink.css("display", "inline-block");
            newLink.css("display", "inline-block");
            newLink.addClass("favorite-cocktails");
            newDrink.addClass("favListItem");
            newDrink.attr("data-nameOnSrc", snap.val().recipe_id);
            newDrink.attr("data-drink-name", snap.val().recipe_id.replace(/-/g, " "));
            newDrink.text(snap.val().recipe_id.replace(/-/g, " "));
            newLink.append(newDrink);
            newLink.append("<p class='btn-delete' style='display:inline-block;float:right;' data-nameOnSrc='" + snap.val().recipe_id + "'> X </p>");
            newLiItem.append(newLink);
            $(".dropdown-menu").append(newLiItem)
        });
    }
}

//==========  Event Listeners  =======================
// On Document Ready
$(document).ready(function() {
    //-- Attach clickListener to signout button
    $("button.sign-in-btn").on("click", function() {
        if (firebase.auth().currentUser !== null) {
            signUserOut();
        } else {
            signUserIn();
        }
    });

    //-- Like button clickListene
    $(document).on("click", "#like-btn", function() {
        addUserLike(drinkSelected);
    });

    //-- Watch for user signOut then hide the signout button
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const fullName = firebase.auth().currentUser.displayName;
            const firstName = fullName.split(" ");
            $("button.sign-in-btn").text(firstName[0] + ", sign out?");
            // $("button#btn-signOut").show();
        } else {
            $("button.sign-in-btn").text("Sign in");
        }
    });

});
//================ End Database Code =================


//================ Absolute API CODE =================
var moodList = ["party", "romantic", "relax", "cry"];
var alcoholList = ["Rum", "Vodka", "Whisky", "Gin", "Brandy", "Tequila"];
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
    var client_id = "ac07738a";

    $.ajax({
            url: "https://api.jamendo.com/v3.0/playlists/tracks/?client_id=" + client_id + "&format=json&limit=5&name=" + moodName,
            method: 'GET'
        })
        .done(function(response) {
            var data = response.results[0];
            var tracks = data.tracks;
            var randomPlay = Math.floor(Math.random() * tracks.length)
                //blow away old songs
            songs = [];

            for (t in tracks) {
                songs.push(tracks[t].audio);
            }

            playSong(songs[randomPlay]);
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

    playSong(next);

}
//function that loads the list of cocktails as per the moods clicked..
function loadList() {
    $("#theCarousel").show();

    if (this.hash !== "") {
        // Prevent default anchor click behavior
        event.preventDefault();

        // Store hash
        var hash = this.hash;

        // Using jQuery's animate() method to add smooth page scroll
        // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
        $('html, body').animate({
            scrollTop: $(hash).offset().top
        }, 800, function() {

            // Add hash (#) to URL when done scrolling (default click behavior)

        });
    } // End if

    $(activeDiv).empty();
    $(activeDiv).removeClass("item active");
    $(inactiveDiv).empty();
    $(inactiveDiv).removeClass("item active");
    moodSelected = $(this).attr("data-name");

    var queryURL = "https://addb.absolutdrinks.com/drinks/tagged/" + moodSelected + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + queryURL,
        method: "GET"
    }).done(function(response) {
        activeDiv = $("<div>");
        activeDiv.addClass("item active");
        $(".carousel-inner").append(activeDiv);

        inactiveDiv = $("<div>");
        inactiveDiv.addClass("item");
        $(".carousel-inner").append(inactiveDiv);

        for (var i = 0; i < 10; i++) {
            var name = response.result[i].name;
            newDiv = $("<div>");
            newDiv.addClass("item-style cocktailList");
            newDiv.attr("id", "cocktailID");
            newDiv.attr("data-drink-name", name);
            newDiv.append("<h4>" + name + "</h4>");
            nameOnSrc = name.replace(/ /g, '-');
            newDiv.attr("data-nameOnSrc", nameOnSrc);
            newDiv.append("<img src=https://assets.absolutdrinks.com/drinks/200x200/" + nameOnSrc + ".jpg>");
            if (i > 4) {
                $(inactiveDiv).append(newDiv);
            } else {
                $(activeDiv).append(newDiv);
            }

        }

    });
    getSong(moodSelected);
}

$(".carousel-control").on("click", function() {
    activeDiv.toggleClass(inactiveDiv);
    inactiveDiv.toggleClass(activeDiv);

});

// function to display the recipe once a drink is selected..
function displayRecipe() {
    $("#like-btn").show();
    $(".modal-container").show();
    $("#cocktail-name").html($(this).attr("data-drink-name"));
    $("#image-holder").attr("src", "http://assets.absolutdrinks.com/drinks/145x200/" + $(this).attr("data-nameOnSrc") + ".jpg");
    drinkSelected = $(this).attr("data-nameOnSrc");

    var queryURL = "https://addb.absolutdrinks.com/drinks/" + drinkSelected.toLowerCase() + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + queryURL,
        method: "GET"
    }).done(function(response) {
        var ingredient_list = response.result[0].ingredients;
        for (var i = 0; i < ingredient_list.length; i++) {
            $(".ingredients-list").append("<p>" + ingredient_list[i].textPlain + "</p>");
        }
        $("#instructions-area").text(response.result[0].descriptionPlain);
    });


    //code to hide "add to favorites" button

    if ($(this).hasClass("favListItem")) {
        $("#like-btn").hide();

    }

    $("#myModal").modal();


}

$("#carousel-close").click(function() {
    $("#theCarousel").hide();
})


function fillAlcoholList() {
    for (var i = 0; i < alcoholList.length; i++) {
        var newLink = $("<li>");

        newLink.addClass("alcohol");

        newLink.attr("data-name", alcoholList[i].toLowerCase());
        newLink.text(alcoholList[i].toUpperCase());

        $("#alcohol-list").append(newLink);
    }
}


function loadAlcoholList() {
    $("#theCarousel").show();
    $(activeDiv).empty();
    $(activeDiv).removeClass("item active");
    $(inactiveDiv).empty();
    $(inactiveDiv).removeClass("item active");

    drinkSelected = $(this).attr("data-name");
    var queryURL = "https://addb.absolutdrinks.com/drinks/withtype/" + drinkSelected + "/?apiKey=24a49938d9c64ae18a4b6fbc29d7f751";

    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + queryURL,
        method: "GET"
    })

    .done(function(response) {
        activeDiv = $("<div>");
        activeDiv.addClass("item active");
        $(".carousel-inner").append(activeDiv);

        inactiveDiv = $("<div>");
        inactiveDiv.addClass("item");
        $(".carousel-inner").append(inactiveDiv);

        for (var i = 0; i < 10; i++) {
            var name = response.result[i].name;
            newDiv = $("<div>");
            // newDiv.addClass("col-md-2 cocktailList");
            newDiv.addClass("item-style cocktailList");
            newDiv.attr("id", "cocktailID");

            newDiv.attr("data-drink-name", name);
            newDiv.append("<h4>" + name + "</h4>");
            nameOnSrc = response.result[i].id;
            newDiv.attr("data-nameOnSrc", nameOnSrc);
            newDiv.append("<img src=https://assets.absolutdrinks.com/drinks/200x200/" + nameOnSrc + ".jpg>");
            if (i > 4) {
                $(inactiveDiv).append(newDiv);
            } else {
                $(activeDiv).append(newDiv);
            }
        }

    });

}




window.onload = function() {
    $("#theCarousel").hide();
    $(".modal-container").hide();
    $(document).on("click", ".mood-style", loadList);
    $(".carousel-inner").on("click", ".cocktailList", displayRecipe);
    fillAlcoholList();
    $(".dropdown-menu").on("click", ".favListItem", displayRecipe);
    $(document).on("click", ".alcohol", loadAlcoholList);
    $(document).on("click", ".btn-delete", function() {
        $(this).parent().hide();
        removeUserLike($(this).attr("data-nameOnSrc"));
    });

}
