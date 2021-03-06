'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const app = express();


const PORT = process.env.PORT || 3001;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const mapKey = process.env.MAP_API_KEY;


app.get('/', getUserName);
app.post('/user', insertUserFromSQL);
app.post('/show', getMapData);
app.get('/location/:title/:lat/:lng', renderIndex2);
app.get('/index', renderHomePage);
app.get('/collection', renderCollectionPage);
app.get('/aboutUs', renderAboutUsPage);
app.get('/anime', renderAnime);
app.post('/animeForm', renderIndex3);
app.post('/anime', saveAnime);
app.delete('/anime/:id', deleteAnime);
app.post('/restaurants', saveRestuarants);
app.delete('/restaurants/:id', deleteRestaurants);

function deleteAnime (req, res){
  const id = req.params.id;
  const sql = 'DELETE FROM anime_table WHERE id=$1';
  client.query(sql, [id])
    .then(() => {
      res.redirect(`/collection?user_name=${req.body.user_name}`);
    });
}

function saveAnime(req, res){
  const {name, image_url, user_name} = req.body;

  const sql =`INSERT INTO anime_table (name, image_url, owner) VALUES ($1, $2, $3)`;
  const animeArray = [name, image_url, user_name];

  client.query(sql, animeArray)
    .then(() => {
      res.redirect(`/collection?user_name=${req.body.user_name}`);
    })
    .catch(error => console.error(error));
}

function saveRestuarants(req, res){
  const {name, image_url, price, rating, address, phone, user_name} = req.body;
  const SQL = `INSERT INTO food_table (name, image_url, price, rating, address, phone, owner) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  const foodArr = [name, image_url, price, rating, address, phone, user_name];

  client.query(SQL, foodArr)
    .then(() => {
      res.redirect(`/collection?user_name=${req.body.user_name}`);
    });
}

function deleteRestaurants(req, res){
  const id = req.params.id;
  console.log(req.params.id);
  const SQL = 'DELETE FROM food_table WHERE id=$1';
  client.query(SQL, [id])
    .then( () => {
      res.redirect(`/collection?user_name=${req.body.user_name}`);
    });

}

function renderIndex2 (req, res){
  const title = req.params.title;
  const lat = req.params.lat;
  const lng = req.params.lng;
  const mapKey = process.env.MAP_API_KEY;
  const yelpKey = process.env.YELP_API_KEY;
  const urlToSearchWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lng}&key=${WEATHER_API_KEY}`;
  let yelpUrl = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&limit=10`;

  let monsterObj = {};
  monsterObj.city = title;
  const user_name = req.query.user_name;
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
          res.render('pages/index2', {data : monsterObj, key : mapKey, users : user_name});
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

function getMapData(req, res){

  let mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&callback=initMap&libraries=&v=weekly`;

  superagent.get(mapsUrl)
    .then(results => {
      console.log(results);
      res.redirect('/');
    });
}

function getUserName(req, res){
  const SQL = 'SELECT * FROM user_table;';
  client.query(SQL)
    .then(result =>{
      res.render('pages/login', {users : result.rows[0]});
    })
    .catch(error => console.error(error));
}

function insertUserFromSQL(req, res){
  const SQL = `INSERT INTO user_table (username) VALUES ($1)`;
  const value = [req.body.username];
  client.query(SQL, value)
    .then(() =>{
      res.redirect(`/index?user_name=${req.body.username}`);
    })
    .catch(error => console.error(error));
}

function renderHomePage(req, res){
  const mapKey = process.env.MAP_API_KEY;
  const user_name = req.query.user_name;
  res.render(`pages/index`, {key : mapKey, users : user_name});
}

function renderCollectionPage(req, res){
  const user_name = req.query.user_name;

  let dataObj = {};
  client.query('SELECT * FROM food_table WHERE owner=$1', [user_name])
    .then((results) => {
      dataObj.foodData = results.rows;
    });
  client.query('SELECT * FROM anime_table WHERE owner=$1', [user_name])
    .then(results => {
      dataObj.animeData = results.rows;
      res.render(`pages/collection`, {data : dataObj, users : user_name });
    });
}

function renderAboutUsPage(req, res){
  const user_name = req.query.user_name;
  res.render(`pages/aboutUs`, {users : user_name});
}

function renderAnime (req, res){
  const user_name = req.query.user_name;
  res.render('pages/anime', {users : user_name});
}

function renderIndex3(req, res){
  const id = req.body.animeName;
  const user_name = req.body.user_name;

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
      res.render('pages/index3', {animeList : animeArrSort, users : user_name});
    })
    .catch(error => console.error(error));
}

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
  this.url = animeObj.url;
  this.anime = animeObj.anime;
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`));
  });
