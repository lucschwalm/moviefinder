document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('searchInput');
    var searchButton = document.getElementById('searchButton');
    var movieList = document.getElementById('movieList');
    var movieDetails = document.getElementById('movieDetails');
    var trailerSection = document.getElementById('trailerSection');
    var dropdown = document.querySelector('.dropdown');
    var dropdownContent = document.querySelector('.dropdown-content');
    var omdbAPIKey = "5f12c8c3";
    var youtubeAPIKey = "AIzaSyCQEc2oj1t3PKi3DjDpoYiquIfCcrVBSi0";
    
    var historyNum = 0;

    function clearResults() {
      movieList.innerHTML = '';
      movieDetails.innerHTML = '';
      trailerSection.innerHTML = '';
    }
    
    dropdown.addEventListener("click", function(event) {
      event.stopPropagation();
      if(dropdown.classList.contains("is-active")){
        dropdown.classList.remove("is-active");
      }else{
        dropdown.classList.add("is-active");
      }
    })

    // Populates the history dropdown on page load
    function makeHistory() {
      for(i=0; i<localStorage.length; i++){
        var currentkey = localStorage.key(i);
        if(currentkey.substring(0, currentkey.length-1) == "history"){
          historyNum++;
          var newHistory = document.createElement("a");
          newHistory.classList.add("dropdown-item");
          newHistory.textContent = localStorage.getItem(localStorage.key(i));
          dropdownContent.append(newHistory);
        }
      }
    }
    makeHistory();

    function searchMovie(searchTerm) {
      // Clear previous search results
      clearResults(); 
      var element= document.getElementById("elementToHide");
      element.classList.remove("is-hidden");
      
      // Fetch movie data from OMDB API
      fetch('https://www.omdbapi.com/?apikey=' + omdbAPIKey + '&s=' + searchTerm)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.Response === 'True') {
            var movies = data.Search;
            movies.forEach(function(movie) { 
              createMovieCard(movie);
            });
          } else {
            movieList.innerHTML = '<p>No results found.</p>';
          }
        })
        .catch(function(error) {
          console.log('Error:', error);

        
        });
      }
  
    function createMovieCard(movie) {
      var movieCard = document.createElement('div');
      movieCard.className = 'column is-one-quarter';
  
      var moviePoster = document.createElement('img');
      moviePoster.src = movie.Poster;
      moviePoster.alt = movie.Title + ' Poster';
  
      var movieTitle = document.createElement('h3');
      movieTitle.textContent = movie.Title;
  
      movieCard.appendChild(moviePoster);
      movieCard.appendChild(movieTitle);
      movieList.appendChild(movieCard);
  
      movieCard.addEventListener('click', function() {
        clearResults();
        createMovieCard(movie);
        // Fetch movie details from OMDB API
        fetch('https://www.omdbapi.com/?apikey=' + omdbAPIKey + '&i=' + movie.imdbID)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            displayMovieDetails(data);
          })
          .catch(function(error) {
            console.log('Error:', error);
          });
  
        // Fetch movie trailer from YouTube API
        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + movie.Title + ' trailer&key=' + youtubeAPIKey)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            displayTrailer(data.items[0].id.videoId);
          })
          .catch(function(error) {
            console.log('Error:', error);
          });
      });
    }
  
    function displayMovieDetails(movie) {
      var movieDetailsHTML = `
        <div class="column">
          <h2 class="title">${movie.Title}</h2>
          <p><strong>Year:</strong> ${movie.Year}</p>
          <p><strong>Genre:</strong> ${movie.Genre}</p>
          <p><strong>Director:</strong> ${movie.Director}</p>
          <p><strong>Actors:</strong> ${movie.Actors}</p>
          <p><strong>Plot:</strong> ${movie.Plot}</p>
          <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
        </div>
      `;
      movieDetails.innerHTML = movieDetailsHTML;
    }
  
    function displayTrailer(videoId) {
      var trailerHTML = `
        <div class="column">
          <iframe width="100%" height="515" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>
      `;
      trailerSection.innerHTML = trailerHTML;
    }
      
    searchButton.addEventListener('click', function() {
      var searchTerm = searchInput.value;
      // Sets localStorage for the search term, and adds a selector for it into the dropdown
      localStorage.setItem("history" + historyNum, searchTerm);
      var newHistory = document.createElement("a");
      newHistory.classList.add("dropdown-item");
      newHistory.textContent = searchTerm;
      dropdownContent.append(newHistory);

      searchMovie(searchTerm);
    });

    dropdownContent.addEventListener('click', function(event){
      var searchTerm = event.target.textContent;
      searchMovie(searchTerm);
    })
});