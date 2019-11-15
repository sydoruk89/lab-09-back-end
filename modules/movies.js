
'use strict';

const superagent = require('superagent');
const movies= require('./moviesjs');

// Movies handler
function getMovies(request, response){
  const url = `https://api.themoviedb.org/3/search/movie/?api_key=${process.env.MOVIES_API_KEY}&query=${request.query.data}`;
  superagent.get(url)
    .then(data => {
      const moviesSummaries = data.body.results.map(element => {
        return new Movies(element);
      });
      response.status(200).send(moviesSummaries);
    })
    .catch(() => {
      errorHandler('Something went wrong', request, response);
    });
}

// movies constructor
function Movies(movie){
  this.title = movie.title;
  this.released_on = movie.release_date;
  this.total_votes = movie.vote_count;
  this.average_votes = movie.vote_average;
  this.popularity = movie.popularity;
  this.image_url = movie.backdrop_path;
  this.overview = movie.overview;
}

// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = movies;


