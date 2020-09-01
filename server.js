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
app.get('/', getUserName)
app.post('/user', insertUserFromSQL)
app.get('/index', renderHomePage)
app.get('/collection', renderCollectionPage)

//===================================================== Functions ==================================================================
function getUserName(req, res){
  const SQL = 'SELECT * FROM user_table;'
  client.query(SQL)
    .then(result =>{
      res.render('pages/login', {users : result.rows})
    })
  }

function insertUserFromSQL(req, res){
  const SQL = `INSERT INTO user_table (username) VALUES ($1)`
  const value = [req.body.username]
  console.log(value)
  client.query(SQL, value)
    .then(result =>{
      console.log(result)
      res.redirect('/index')
    })
}

function renderHomePage(req, res){
  res.render('pages/index')
}

function renderCollectionPage(req, res){
  res.render('pages/collection')
}

//===================================================== Constructor ================================================================


//===================================================== Start Server ===============================================================
client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`))
})