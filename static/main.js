$(document).ready(function(){
    console.log("Hello")
})

function login(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  $.ajax({
    type: "POST",
    url: '/login',
    data: {
      login_info: JSON.stringify({username: username, password: password})
    },
    success:function(response){
      if(response == "False"){
        window.location = "/"
        alert("Incorrect Username or Password")
      }
      else{
        window.location.href = '/'
      }
    }
  })
}

function createUser(){
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  $.ajax({
    type: "POST",
    url: '/createUser',
    data: {
      json_string: JSON.stringify({username: username, password: password})
    },
    success: function(response){
      if(response === "True"){
        console.log("User Created")
        window.location.href = '/'
      }
      else{
        alert("User has already existed")
        window.location.href = '/'
      }
    }
  })
}

function searchMovie(){

  let search = document.getElementById("search").value;
  $.ajax({
    url: '/searchMovie',
    type: "POST",
    data:{
      json_string: JSON.stringify({search: search})
    },
    success: function(response){
      results = JSON.parse(response)
      movies = results.Search
      let output = ' '
      $.each(movies, (index, movie) => {
        output += `
        <div id ="searchMovie" class="col-md-3">
          <div class="well text-center"><img src = "${movie.Poster}">
            <h5 class ="movie-title"> ${movie.Title} </h5>
            <br>
            <button type = "submit" id = "add" onclick = "AddMovie('${movie.Title}', '${movie.Year}', '${movie.imdbID}', '${movie.Poster}')" class="btn btn-warning" > + Watchlist </button>
            <button class="btn btn-primary" onclick ="movieInfo('${movie.imdbID}')" > Movie Info </button>
        <br> <br>
          </div>
        </div>`
      })
      $('#movies').html(output)

    }
  })
}

function movieInfo(id){
  window.sessionStorage.setItem('id', id)
  window.location.href = '/movieInfo'
  getMovie();

}

function getMovie(){
  let id = sessionStorage.getItem('id');
  $.ajax({
    url: '/movieInfo',
    type:'POST',
    data:{
      json_string: JSON.stringify({id:id})
    },
    success: function(response){
      let movie = JSON.parse(response)
        console.log(JSON.parse(response))
      let output =`<div class ="row">
                        <div class = "col-md-4" style = "margin-bottom: 0px">
                          <img style = "width:300px; height:455px" src = "${movie.Poster}" class = "thumbnail">
                        </div>
                        <div class = "col-md-8">
                          <h2>${movie.Title}</h2>
                          <ul class = "list-group">
                            <li class = "list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>
                            <li class = "list-group-item"><strong>Released:</strong> ${movie.Released}</li>
                            <li class = "list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>
                            <li class = "list-group-item"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
                            <li class = "list-group-item"><strong>Metascore:</strong> ${movie.Metascore}</li>
                            <li class = "list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
                            <li class = "list-group-item"><strong>Director:</strong> ${movie.Director}</li>
                            <li class = "list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
                          </ul>
                        </div>
                      </div>
                      <div class = "row">
                        <div class = "well">
                          <h3> Plot </h3>
                          ${movie.Plot}
                          <hr>
                          <a href ="http://imdb.com/title/${movie.imdbID}" target = "blank" class = "btn btn-primary">View in IMDB</a>
                          <a href = "/searchMovie" class = "btn btn-default"> Go back to search </a>
                        </div>
                      </div>`
      $('#movieInfo').html(output)
    }
  })
}

function AddMovie(title, year, id, poster){

  $.ajax({
    url: '/AddMovie',
    type: "POST",
    data:{
      json_string: JSON.stringify({movieName:title, year: year, id: id, poster: poster})
    },
    success: function(response){
      if(response === "True"){
        console.log("Movie Added")
      }
      else if(response === "False"){
        console.log("Failed to Add Movie")
      }
    }
  })
}

function AddedMovie(){
  let count = 0
  $.ajax({
    url:'/AddedMovie',
    type: "POST",
    success: function (response){
      movies = JSON.parse(response)
      let output = ''
      $.each(movies, (index, movie) => {
        output += `
        <div class="col-md-3" id = "movie${count}">
        <div class ="well text-center">
        <img src = "${movie.poster}">
        <h5 class ="movie-title"> ${movie.title} </h5>
        <h7> Rate this movie: </h7>
        <input class = "ratingBox" type = "text" id = "rate${count}" onchange = "rateMovie('${count}', '${movie.title}','${movie.year}','${movie.id}','${movie.poster}')">
        <br><br>
        <button type = "submit"  class="btn btn-danger"  id = "remove" onclick = "removeMovie('${count}', '${movie.title}')"> Remove </button>
        <br> <br>
        </div>
        </div>`
        count++;
      })
      $('#movies').html(output)
    }
  })
}

function rateMovie(count, title, year, id, poster){
  let rating = document.getElementById(`rate${count}`).value;
  console.log(rating)
  $.ajax({
    url: '/rateMovie',
    type: "POST",
    data:{
      json_string: JSON.stringify({title: title, year: year, id: id, poster: poster, rating: rating})
    },
    success: function(response){
      if(response === "True"){
        console.log("The movie has been rated")
      }
      else if(response === "False"){
        console.log("Failed to rate movie")
      }
    }
  })
}

function removeMovie(count, movie){
  $(`#movie${count}`).closest("div").remove();
  $.ajax({
    url: '/removeMovie',
    type: "POST",
    data:{
      json_string: JSON.stringify({movie: movie})
    },
    success: function(response){
      if(response === "True"){

        console.log("Movie removed")

      }
      else{
        console.log("Failed to remove movie");
      }
    }
  })
}

function ratedMovie(){
  let count = 0;
  $.ajax({
    url:'/ratedMovie',
    type: "POST",
    success: function (response){
      console.log(JSON.parse(response))
      movies = JSON.parse(response)
      let output = ''
      $.each(movies, (index, movie) => {
        let rating = Number(movie.rating)
        output += `
        <div class="col-md-3" id = "movie${count}">
        <div class="well text-center">
        <img src = "${movie.poster}">
        <h5 class = "movie-title"> ${movie.title} </h5>
        <h5 class ="movie-rating" > ${movie.rating} <i class="fa fa-star checked" style ="color:goldenrod; size=12px"></i>  </h5>
        <br> <br>
        </div>
        </div>`
        count++;
      })
      $('#movies').html(output)
    }
  })
}

function Logout(){

  $.ajax({
    url:'/logout',
    type:'POST',
    success: function(response){
      window.location.href = '/login'
    }
  })

}
