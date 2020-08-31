'use strict';

//packages

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const app = express();

// global variables
const PORT = process.env.PORT || 3001;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);

//express configs


//routes


//constructors


//start app
client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`This is running the server on PORT : ${PORT} working`))
})