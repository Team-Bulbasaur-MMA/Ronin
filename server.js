'use strict';

//===================================================== Packages ===================================================================
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const app = express();

//===================================================== Global Vars =================================================================
const PORT = process.env.PORT || 3001;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const mapKey = process.env.MAP_API_KEY;

//===================================================== Routes =====================================================================

app.get('/', getUserName);
app.post('/user', insertUserFromSQL);
app.get('/location/:title/:lat/:lng', dataFunction);
// app.get('/location/:title/:lat/:lng', renderRestaurant);
app.post('/show', getMapData);
// app.post('/citySearch', searchForCityInJapan);
// app.get('/index', renderWeatherData);

app.get('/index', renderHomePage);
app.get('/collection', renderCollectionPage);
app.get('/aboutUs', renderAboutUsPage)
app.get('/anime', renderAnime);
app.post('/anime', getmyAnime)

//===================================================== Functions ==================================================================

// function renderWeather(req, res){
//   // const title = req.params.title;
//   const lat = req.params.lat;
//   const lng = req.params.lng;
//   const mapKey = process.env.MAP_API_KEY;


//   const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`;

//   superagent.get(urlToSearchWeather)
//     .then(results => {
//       const weather = results.body.data;
//       const weatherArr = weather.map(index => new Weather(index));
//       res.render('pages/index2', {weatherTime : weatherArr, key : mapKey});
//     })
//     .catch(error => {
//       console.log(error.message);
//       res.status(500).send(error.message);
//     });
// }

function dataFunction (req, res){
  const lat = req.params.lat;
  const lng = req.params.lng;
  const mapKey = process.env.MAP_API_KEY;
  const yelpKey = process.env.YELP_API_KEY;
  const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`;
  let yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&limit=5&offset=5`;

  let monsterObj = {};

  superagent.get(urlToSearchWeather)
    .then(results => {
      const weather = results.body.data;
      const weatherArr = weather.map(index => new Weather(index));
      monsterObj.weatherData = weatherArr;
    })

    .then(() => {
      superagent.get(yelpUrl)
        .set('Authorization',`Bearer ${yelpKey}`)
        .then(result => {
          const jsonYelpObj = result.body.businesses;
          const newYelpArr = jsonYelpObj.map(yelp => new Yelp(yelp));
          monsterObj.yelpData = newYelpArr;
          res.render('pages/index2', {data : monsterObj, key : mapKey});
        })
        .catch(error => {
          console.log('Yelp Call', error);
          res.status(500).send(error.message);
        });
    })
    .catch(error => {
      console.log('Weather Call', error);
      res.status(500).send(error.message);
    });
}

// function renderRestaurant (req, res){
//   console.log('Hello');
//   // const title = req.params.title;
//   const lat = req.params.lat;
//   const lng = req.params.lng;

//   const yelpKey = process.env.YELP_API_KEY;
//   let yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}limit=5&offset=5`;

//   superagent.get(yelpUrl)
//     .set('Authorization',`Bearer ${yelpKey}`)
//     .then(result => {
//       const jsonYelpObj = result.body.businesses;
//       const newYelpArr = jsonYelpObj.map(yelp => new Yelp(yelp));
//       console.log(newYelpArr);
//       res.send(newYelpArr);
//     })
//     .catch(error => {
//       console.log(error.message);
//       res.status(500).send(error.message);
//     });
// }

function getUserName(req, res){
  const SQL = 'SELECT * FROM user_table;';
  client.query(SQL)
    .then(result =>{
      res.render('pages/login');
    });
}

function insertUserFromSQL(req, res){
  const SQL = `INSERT INTO user_table (username) VALUES ($1)`;
  const value = [req.body.username];
  const user_name = req.body.username;
  client.query(SQL, value)
    .then(result =>{
      res.redirect(`/index`);
      // I want the index page to say "Hello user_name"
    });
}

function renderHomePage(req, res){
  const mapKey = process.env.MAP_API_KEY;
  res.render('pages/index', {key : mapKey});
}

function renderCollectionPage(req, res){
  // how can i get the username to be entered here? Each obj saved will need to reference user_name
  res.render(`pages/collection`)
}

function renderAboutUsPage(req, res){
  res.render(`pages/aboutUs`)
}

function getMapData(req, res){
  const mapKey = process.env.MAP_API_KEY;

  let mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&callback=initMap&libraries=&v=weekly`;

  superagent.get(mapsUrl)
    .then(results => {
      console.log(results);
      res.redirect('/');
      // const googleMapData = results.body
    });
}

function renderAnime (req, res){
  res.render('pages/anime');
}

function getmyAnime(req, res){ //genre_id
  const id = req.body.animeName;
  console.log(id) 
  const animeURL = `https://api.jikan.moe/v3/search/character/?q=${id}&limit=10`;
  superagent.get(animeURL)
    .then(results =>{
      console.log(results.body.results);
      res.render('pages/index3', {animeList : results.body.results});
    })
    .catch(error => console.error(error));
}

//===================================================== Constructor ================================================================
function Weather(weatherObj){
  this.forecast = weatherObj.weather.description;
  this.time = weatherObj.valid_date;
}

function Yelp(jsonYelpObj){
  //console.log(jsonYelpObj);
  this.name = jsonYelpObj.name;
  this.image_url = jsonYelpObj.image_url;
  this.price = jsonYelpObj.price;
  this.rating = jsonYelpObj.rating;
  this.url = jsonYelpObj.url;
}


//===================================================== Start Server ===============================================================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`));
  });






