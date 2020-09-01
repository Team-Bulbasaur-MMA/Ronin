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

//===================================================== Routes =====================================================================

app.get('/', getUserName);
app.post('/user', insertUserFromSQL);

app.post('/show', getMapData);
// app.post('/citySearch', searchForCityInJapan);
// app.get('/index', renderWeatherData);

app.get('/index', renderHomePage);
app.get('/collection', renderCollectionPage);
app.get('/aboutUs', renderAboutUsPage)

//===================================================== Functions ==================================================================
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

// this function relies on the coordinates from the MAP
// function renderWeatherData(req, res){
//   let latitude = req.query.latitude;
//   let longitude = req.query.longitude;
//   const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;

//   superagent.get(urlToSearchWeather)
//   .then(results => {
//     const weather = results.body.data;
//     const weatherArr = weather.map(index => new Weather(index));
//     res.render('/index', {weatherTime : weatherArr})
//   })
//   .catch(error => {
//     console.log(error.message);
//     res.status(500).send(error.message);
//   });
// }

// this function relies on information from the MAP + resturants + anime
// function searchForCityInJapan(req, res){
//   const inputText = req.body.userSearch;
//   console.log('here is the selector:', inputText[1])
//   console.log('here is the city:', inputText[0])
//   let radioButton = inputText[1]; //this is the radio button
//   let citySearched = inputText[0]; // this is the city
// }

//   if(radioButton === 'Restaurants'){
  // start the superagent for resturants here.
//   }else{
  // start the superagent for anime here.
//   }
// }

//===================================================== Constructor ================================================================
function Weather(weatherObj){
  this.forecast = weatherObj.weather.description;
  this.time = weatherObj.valid_date;
}

//===================================================== Start Server ===============================================================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`));
  });
