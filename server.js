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
// app.post('/show', getMapData);
app.get('/index', renderHomePage);
app.get('/collection', renderCollectionPage);
app.get('/aboutUs', renderAboutUsPage);
app.get('/anime', renderAnime);
app.post('/anime', getmyAnime);
app.post('/collection',saveUserInfoRestuarant);
app.delete('/collection/:id', deleteRestaurants);

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

function saveUserInfoRestuarant(req, res){
  const {name, image_url, price, rating, address, phone} = req.body;
  const SQL = `INSERT INTO food_table (name, image_url, price, rating, address, phone) VALUES ($1, $2, $3, $4, $5, $6)`
  const foodArr = [name, image_url, price, rating, address, phone];

  client.query(SQL, foodArr)
  .then(() => {
      res.redirect('/collection');
  })
}

function deleteRestaurants(req, res){
  const id = req.params.id;
  const SQL = 'DELETE FROM food_table WHERE id=$1';
  client.query(SQL, [id])
   .then( () => {
     res.redirect('/collection');
});
}

function dataFunction (req, res){
  const lat = req.params.lat;
  const lng = req.params.lng;
  const mapKey = process.env.MAP_API_KEY;
  const yelpKey = process.env.YELP_API_KEY;
  const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`;
  let yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&limit=10`;

  let monsterObj = {};

  superagent.get(urlToSearchWeather)
    .then(results => {
      const weather = results.body.data;
      const weatherArr = weather.map(index => new Weather(index));
      const limitedWeatherArr = weatherArr.slice(0, 7);
      monsterObj.weatherData = limitedWeatherArr;
    })

    .then(() => {
      superagent.get(yelpUrl)
        .set('Authorization',`Bearer ${yelpKey}`)
        .then(result => {
          const jsonYelpObj = result.body.businesses;
          console.log(jsonYelpObj);
          const newYelpArr = jsonYelpObj.map(yelp => new Yelp(yelp));
          let yelpArrSort = newYelpArr.sort ((a, b) => {
            if (a.rating < b.rating) {
              return 1;
            } else if (a.rating > b.rating) {
              return -1;
            } else {
              return 0;
            }
          });
          monsterObj.yelpData = yelpArrSort;
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


function renderHomePage(req, res){
  const mapKey = process.env.MAP_API_KEY;
  res.render('pages/index', {key : mapKey});
}

function renderCollectionPage(req, res){
  // how can i get the username to be entered here? Each obj saved will need to reference user_name
  client.query('SELECT * FROM food_table')
  .then(result => {
    res.render(`pages/collection`, {food : result.rows});
    
  })
}

function renderAboutUsPage(req, res){
  res.render(`pages/aboutUs`);
}

// function getMapData(req, res){
//   const mapKey = process.env.MAP_API_KEY;

//   let mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&callback=initMap&libraries=&v=weekly`;

//   superagent.get(mapsUrl)
//     .then(results => {
//       console.log(results);
//       res.redirect('/');
//       // const googleMapData = results.body
//     });
// }

function renderAnime (req, res){
  res.render('pages/anime');
}

function getmyAnime(req, res){ //genre_id
  const id = req.body.animeName;
  const animeURL = `https://api.jikan.moe/v3/search/character/?q=${id}&limit=10`;
  superagent.get(animeURL)
    .then(data =>{
      console.log(data.body.results);
      const animeObj = data.body.results;
      const animeArr = animeObj.map(anime => new Anime(anime));
      let animeArrSort = animeArr.sort ((a, b) => {
        if (a.name > b.name) {
          return 1;
        } else if (a.name < b.name) {
          return -1;
        } else {
          return 0;
        }
      });
      res.render('pages/index3', {animeList : animeArrSort});
    })
    .catch(error => console.error(error));
}

//===================================================== Constructor ================================================================
function Weather(weatherObj){
  this.forecast = weatherObj.weather.description;
  this.time = weatherObj.valid_date;
}

function Yelp(jsonYelpObj){
  this.name = jsonYelpObj.name;
  this.image_url = jsonYelpObj.image_url;
  this.price = jsonYelpObj.price;
  this.rating = jsonYelpObj.rating;
  const street = jsonYelpObj.location;
  this.address = `${street.address1}, ${street.city}, ${street.zip_code}`;
  this.phone = jsonYelpObj.phone;
  this.url = jsonYelpObj.url;
}

function Anime(animeObj){
  this.name = animeObj.name;
  this.image_url = animeObj.image_url;
}

//===================================================== Start Server ===============================================================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`));
  });
