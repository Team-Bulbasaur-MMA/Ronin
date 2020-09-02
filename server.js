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
app.post('/collection', saveFavorites);
// app.get('/collection', getFavorites);
app.delete('/collection/:id', deleteItem);

//===================================================== Functions ==================================================================

function deleteItem (req, res){
  const id = req.params.id;
  const sql = 'DELETE FROM anime_table WHERE id=$1';
  client.query(sql, [id])
    .then(() => {
      res.redirect('/collection');
    });
}

function saveFavorites(req, res){
  const {name, image_url} = req.body;

  const sql =`INSERT INTO anime_table (name, image_url) VALUES ($1, $2)`;
  const animeArray = [name, image_url];

  client.query(sql, animeArray)
    .then(() => {
      res.redirect('/collection');
    })
    .catch(error => console.error(error));
}

// function getFavorites(req, res){
//   client.query('SELECT * FROM anime_table')
//     .then(result => {
//       console.log(result);
//       res.render('/collection', {anime: result.rows});
//     })
//     .catch(error => console.error(error));
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
  client.query('SELECT * FROM anime_table')
    .then(result => {
      res.render('pages/collection', {anime: result.rows});
    })
    .catch(error => console.error(error));
}

function renderAboutUsPage(req, res){
  res.render(`pages/aboutUs`);
}

function renderAnime (req, res){
  res.render('pages/anime');
}

function getmyAnime(req, res){ //genre_id
  const id = req.body.animeName;
  const animeURL = `https://api.jikan.moe/v3/search/character/?q=${id}&limit=10`;
  superagent.get(animeURL)
    .then(data =>{
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






