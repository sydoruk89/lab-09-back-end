'use strict';

const superagent = require('superagent');
const location= require('./location.js');
const client = require('./client.js');

function getLocation(request, response) {
  const city = request.query.data;
  const SQL = 'SELECT * FROM locations WHERE search_query= $1';
  let val = [city];
  client.query(SQL, val)
    .then( result => {
      if (result.rowCount > 0) {
        console.log('Location data from SQL');
        response.status(200).send(result.rows[0]);
      } else {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
        superagent.get(url)
          .then(data => {
            console.log('From API');
            if (!data.body.results.length) { throw 'No Data'; }
            else {
              const geoData = data.body;
              const location = (new Location(request.query.data, geoData));
              let newSQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4) RETURNING *';
              let values = [location.search_query, location.formatted_query, location.latitude, location.longitude];
              return client.query(newSQL, values)
                .then(results => {
                  response.status(200).send(results.rows[0]);
                })
                .catch(() => {
                  errorHandler('Something went wrong', request, response);
                });
            }
          });
      }
    })
    .catch(() => {
      errorHandler('Something went wrong', request, response);
    });
}

//Helper Funcitons
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}


// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = location;
