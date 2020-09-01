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

//===================================================== Routes =====================================================================

app.get('/', getUserName);
app.post('/user', insertUserFromSQL);

app.post('/show', getMapData);

app.get('/index', renderHomePage);
app.get('/collection', renderCollectionPage);
app.get('/aboutUs', renderAboutUsPage)

//===================================================== Functions ==================================================================
function getUserName(req, res){
  const SQL = 'SELECT * FROM user_table;';
  client.query(SQL)
    .then(result =>{
      res.render('pages/login', );// dont need to send users
    });
}

function insertUserFromSQL(req, res){
  const SQL = `INSERT INTO user_table (username) VALUES ($1)`;
  const value = [req.body.username];
  const user_name = req.body.username;
  client.query(SQL, value)
    .then(result =>{
      res.redirect(`/index`);
    });
}

function renderHomePage(req, res){
  const mapKey = process.env.MAP_API_KEY;
  res.render('pages/index', {key : mapKey});
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

function renderCollectionPage(req, res){
  const user_name = req.body.username;
  res.render(`pages/collection`)
}

function renderAboutUsPage(req, res){
  res.render(`pages/aboutUs`)
}







































//================Restaurant Route & Function======
// app.get('/show', getRestaurantData);
// 
// function getRestaurantData (req, res) {
//   let yelpQuery = request.query.formatted_query;
//   console.log('yelp req.query : ', request.query);

// const yelpKey = process.env.YELP_API_KEY;
// let yelpUrl = `https://api.yelp.com/v3/businesses/search?location=${yelpQuery}&limit=5&offset=5`;

// superagent.get(yelpUrl)
// .set('Authorization',`Bearer ${yelpKey}`)
//   .then(result => {
//     const jsonYelpObj = yelpComeBack.body.businesses;
//     const newYelpArr = jsonYelpObj.map(yelp => {
//       return new Yelp(yelp);
//     })
//     console.log(result);
//     res.render('/index', {yelpItem, newYelpArr});
// }

// function renderRestaurantData (req, res) {
//  res.render();
// }

//===================================================== Constructor ================================================================
// function Yelp(jsonYelpObj){
//   //console.log(jsonYelpObj);
//   this.name = jsonYelpObj.name;
//   this.image_url = jsonYelpObj.image_url;
//   this.price = jsonYelpObj.price;
//   this.rating = jsonYelpObj.rating;
//   this.url = jsonYelpObj.url;
// }

//===================================================== Start Server ===============================================================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`));
  });






