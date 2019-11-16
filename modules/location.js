'use strict';

const superagent = require('superagent');
const location= require('./location.js');
const client = require('./client.js');

function getLocation(query) {
  const SQL = 'SELECT * FROM locations WHERE search_query=$1';
  const values = [query];
  return client.query(SQL,values)
    .then(results => {
      if(results.rowCount > 0) {
        console.log('From SQL');
        return results.rows[0];
      } else {
        const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
        return superagent.get(_URL)
          .then(data => {
            const location = (new Location(query, data.body));
            let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4) RETURNING *';
            let values = [query, location.formatted_query, location.latitude, location.longitude];
            return client.query(SQL, values);
          })
          .then (results => {
            return results.rows[0];
          });
      }
    });
}

//Helper Funcitons
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}



module.exports = location;
