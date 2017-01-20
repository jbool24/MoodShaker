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
                var ingredient_list=response.result[0].ingredients;
                console.log(ingredient_list);

                for (var i = 0; i < ingredient_list.length;i++){
                    $(".ingredients-list").append("<p>" + ingredient_list[i].textPlain + "</p>");
                }

                $("#instructions-area").text(response.result[0].descriptionPlain);
            });
            $("#myModal").modal();

        }


        window.onload = function() {

            console.log('hi');

            $(document).on("click", ".mood-style", loadList);
            $(".cocktailList").on("click",function(){
                displayRecipe();
            });

            //$(".carousel-inner").on("click", ".cocktailList", displayRecipe);


        }