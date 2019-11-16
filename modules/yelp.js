'use strict';

const superagent = require('superagent');
const yelp= require('./yelp.js');


// yelp handler
function getYelp(request, response){
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`;
  superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {
      console.log(data.body.business);
      const restaurantSummaries = data.body.businesses.slice(0, 20).map(element => {
        return new Yelp(element);
      });
      response.status(200).send(restaurantSummaries);
    })
    .catch(() => {
      errorHandler('Something went wrong', request, response);
    });
}

// yelp constructor
function Yelp(business){
  this.name = business.name;
  this.image_url = business.image_url;
  this.price = business.price;
  this.rating = business.rating;
  this.url = business.url;
}

// error handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = yelp;
