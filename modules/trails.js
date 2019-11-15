'use strict';

const superagent = require('superagent');
const trails = require('./trails.js');

// Trails handler

function getTrails(request, response) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&key=${process.env.TRAILS_API_KEY}`;
  // console.log('lat/long', request.query.data.latitude);
  superagent.get(url)
    .then(data => {
      const trailsSummaries = data.body.trails.map(element => {
        return new Trails(element);
      });
      response.status(200).send(trailsSummaries);
    })
    .catch(() => {
      errorHandler('Something went wrong', request, response);
    });
}

// trails constructor
function Trails(trail){
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionStatus;
  this.condition_date = trail.conditionDate.slice(0, 10);
  this.condition_time = trail.conditionDate.slice(11);
}

// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = trails;


