'use strict';

//load Environtment Variable from the .env
require('dotenv').config();

//declare Application Dependancies
const express = require('express');
const cors = require('cors');
// const superagent = require('superagent');
// const pg = require('pg');

//Our Dependancies

const client = require('./modules/client.js');
const location = require('./modules/location.js');
const weather = require('./modules/weather.js');
const trails = require('./modules/trails.js');
//const events = require('./modules/events.js');
const movies = require('./modules/movies.js');
const yelp = require('./modules/yelp.js');


//Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// //API routes
// app.get('/location', getLocation);
// app.get('/weather', weatherHandler);
// app.get('/trails', getTrails);
// app.get('/movies', getMovies);
// app.get('/yelp', getYelp);

// Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
//app.get('/events', eventsHandler);
app.get('/trails',trailHandler);
app.get('/movies',movieHandler);
app.get('/yelp',yelpHandler);
app.get('/all', getAllHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);


function getAllHandler(request,response) {
  let location = request.query.data;
  let requests = [];
  requests.push(weather.getWeatherData(location));

  Promise.all(requests)
    .then(allData => {
      render(allData, response);
    });
}

// Even after modularization, these look the exact same. Can we break this out even further?
// Stretch Goals, for sure
function locationHandler(request,response) {
  const city = request.query.data;
  location.getLocation(city)
    .then(data => render(data, response))
    .catch( (error) => errorHandler(error, request, response) );
}

function weatherHandler(request,response) {
  const location = request.query.data;
  weather.weatherHandler(location)
    .then ( weatherSummaries => render(weatherSummaries, response) )
    .catch( (error) => errorHandler(error, request, response) );
}

function trailHandler(request,response) {
  const location = request.query.data;
  trails.getTrails(location)
    .then ( data => render(data, response) )
    .catch( (error) => errorHandler(error, request, response) );
}

function movieHandler(request,response) {
  const location = request.query.data;
  movies.getMovies(location)
    .then ( data => render(data, response) )
    .catch( (error) => errorHandler(error, request, response) );
}

function yelpHandler(request,response) {
  const location = request.query.data;
  yelp.getYelp(location)
    .then ( data => render(data, response) )
    .catch( (error) => errorHandler(error, request, response) );
}

// function eventsHandler(request,response) {
//   const location = request.query.data.formatted_query;
//   events.getEventsData(location)
//     .then ( weatherSummaries => render(weatherSummaries, response) )
//     .catch( (error) => errorHandler(error, request, response) );
// }

function render(data, response) {
  response.status(200).json(data);
}

function notFoundHandler(request,response) {
  response.status(404).send('huh?');
}

function errorHandler(error,request,response) {
  response.status(500).send(error);
}

function startServer() {
  app.listen(PORT, () => console.log(`Server up on ${PORT}`));
}

// Start Up the Server after the database is connected and cache is loaded
client.connect()
  .then( startServer )
  .catch( err => console.error(err) );

app.get('*', (request, response) => {
  response.status(404).send('This route does not exist');
});


// Connect to DB and Start the Web Server
client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log('Server up on', PORT);
    });
  })
  .catch(err => {
    throw `PG Startup Error: ${err.message}`;
  });
