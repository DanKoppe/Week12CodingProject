//lit-html snippet - Begin
let html = (strings, ...values) => {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
};
//lit-html snippet - End

class Game { // game class
  
  constructor(name) { //constructor method with new game parameter
    
    this.name = name; //setting name property
    this.reviews = []; //setting reviews property with empty array
  }

  addReview(name, rating, id) { //add review method to add a review to the created game object with 3 parameters of name, rating, id
    this.reviews.push(new Review(name, rating, id)); //pushing new review object to the reviews array in the game object
  }
}

class Review { //review class
  
  constructor(name, rating, id) {
    //constructor method with 3 parameters of name, rating, id
    this.name = name; //setting name, rating and id properties
    this.score = rating;
    this.id = id;
  }
}

class GameService { //game service class to interact with API
  
  static url = "https://652f4e4f0b8d8ddac0b25885.mockapi.io/Games"; //defining API url

  static getAllGames() { //getAllGames method to return all the games and their reviews from the API
    
    return $.get(this.url);
  }

  static getGame(id) { //method to retrieve specific games based on id
    
    return $.get(this.url + `/${id}`);
  }

  static createGame(game) { //create game method that sends post request to the API to add new game object

    return $.post(this.url, game);
  }

  static updateGame(game) { //method to update existing game with a PUT request using the game id
    
    return $.ajax({ //Jquery AJAX request
      
      url: this.url + `/${game.id}`, //URL and game id for request
      dataType: "json", //data type for API
      data: JSON.stringify(game), //converting the game object to a JSON string
      contentType: "application/json", //content type indicating JSON format
      type: "PUT", //request type of PUT
    });
  }

  static deleteGame(id) { //method to delete a game with specific id by sending DELETE request to the API
    
    return $.ajax({ //jquery AJAX request
      
      url: this.url + `/${id}`, //URL and id
      type: "DELETE", //request type of DELETE
    });
  }
}

class DOMManager { //class to manipulate the DOM
  
  static games; //defining property of games to store array of games

  static getAllGames() { //method to retrieve all game data
    
    GameService.getAllGames().then((games) => this.render(games)); //.then promise to render all games after they have been retrieved
  }

  static createGame(name) { //create game method with name parameter
    
    GameService.createGame(new Game(name)) //sending post request to API to create new game object with name
      .then(() => {
        return GameService.getAllGames(); //promise to return all games after post
      })
      .then((games) => this.render(games)); //promise to render all games after post/return
  }

  static deleteGame(id) { //method to delete game with specific id
    
    console.log("Deleting game with ID:", id); //console.log added for debuggin issue
    GameService.deleteGame(id) //sending DELETE request to API
      .then(() => {
        return GameService.getAllGames(); //promise to return all games after delete
      })
      .then((games) => this.render(games)); //promise to render all games after delete/return
  }

  static addReview(id) { //method to add a review to specific game id
    
    const reviewName = $(`#${id}-review-name`).val(); //declaring variables by retrieving values from the input fields using jquery
    const reviewScore = $(`#${id}-review-score`).val(); //declaring variables by retrieving values from the input fields using jquery
    const uniqueReviewID = DOMManager.generateUniqueID(); //creating a unique id for the review in code since its not provided automatically via the API

    for (let game of this.games) { //for loop to loop through array of games
      
      if (game.id == id) { //checking if current game matches id
        
        const newReview = new Review(reviewName, reviewScore, uniqueReviewID); //creating a new review object with 3 parameters
        game.reviews.push(newReview); //pushing new review object to the reviews array
        GameService.updateGame(game) //sending a PUT request to update the game with the new review
          .then(() => {
            return GameService.getAllGames(); //promise to return all games
          })
          .then((games) => this.render(games)); //promise to render al games
      }
    }
  }

  static generateUniqueID() { //method to generate unique ids for the reviews
    
    return Date.now() + "-" + Math.random().toString(36).substring(2, 15); //formula i found to generate unique id by combining the timestamp with random string
  }

  static deleteReview(gameId, reviewId) { //method to delete a review with game and review ids
    
    for (let game of this.games) { //looping through games array
      
      if (game.id == gameId) { //checking for correct game id
        
        for (let review of game.reviews) { //looping through reviews array
          
          if (review.id == reviewId) { //checking for correct review id
            
            game.reviews.splice(game.reviews.indexOf(review), 1); //using splice 1 to remove the review using indexOf to target the correct review
            GameService.updateGame(game) //sending a PUT request to update the game
              .then(() => {
                return GameService.getAllGames(); //promise to return all games
              })
              .then((games) => this.render(games)); //promise to render al games
          }
        }
      }
    }
  }

  static render(games) { //method to render the game on the webpage
    this.games = games; //updating the games array
    console.log(games); //consol.log for debugging
    $("#app").empty(); //clearing the app div before rerendering
    for (let game of games) {  //for looping through the games array
      $("#app").prepend( //prepending content to the begining so new games show on top
        html`<div id="${game.id}" class="card"> <!--creating a new div corrisponding to the unique game id with class of card-->
            <div class="card-header"> <!--card header-->
              <h2>${game.name}</h2> <!--h2 with game name-->
              <button
                class="btn btn-danger"
                onclick="DOMManager.deleteGame('${game.id}')"
              >
                Delete Game
              </button> <!--delete game button with on click attribute and corrisponding game id-->
            </div>
            <div class="card-body"> <!--card body-->
              <div class="card">
                <div class="row">
                  <div class="col-sm">
                    <input
                      type="text"
                      id="${game.id}-review-name"
                      class="form-control"
                      placeholder="Review Name"
                    /> <!--input for review name-->
                  </div>
                  <div class="col-sm">
                    <input
                      type="text"
                      id="${game.id}-review-score"
                      class="form-control"
                      placeholder="Review Score"
                    /><!--input for review socre-->
                  </div>
                </div>
                <button
                  id="${game.id}-new-review"
                  onclick="DOMManager.addReview('${game.id}')"
                  class="btn btn-primary form-control"
                >
                  Add Review
                </button> <!--add review button with correct game id-->
              </div>
              <div class="reviews-container"></div> <!--review container for styling-->
            </div>
          </div>
          <br />`
      );
      for (let review of game.reviews) { //for loop to loop through reviews array
        $(`#${game.id}`) //jquery to select the correct game id for the review and append the card body wtih the review
          .find(".card-body")
          .append(
            `<p> 
                        <span id="name-${review.id}"><strong>Name: </strong> ${review.name}</span>
                        <span id="score-${review.id}"><strong>Score: </strong> ${review.score}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteReview('${game.id}', '${review.id}')">Delete Review</button>`
          );//displaying review name and score to the correct review id and button to delete correct review based on id
      }
    }
  }
}

$("#create-new-game").click(() => { //using jquery to target button to call createGame when clicked and use value in targeted input
  DOMManager.createGame($("#new-game-name").val());
  $("#new-game-name").val("");
});

DOMManager.getAllGames(); //calling getAllGames method to fetch and render game list
