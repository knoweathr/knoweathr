'use strict';

console.log('server started');

// Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const fs = require('fs');
const bodyParser = require('body-parser').urlencoded({extended: true});

// App Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Middleware
app.use(cors());

// API Endpoints
app.get('/fetchcontinent', (req, res) => {
  console.log(req.query.continent);
  client.query(`
    SELECT airport_code FROM airports
    WHERE continent='${req.query.continent}'
    ;`
  )
  .then(result => res.send(result.rows))
  .catch(console.error);
});

app.get('/fetchone', (req, res) => {
    client.query(`
      SELECT ${req.query.month}_temp_high FROM weather
      WHERE airport_code='${req.query.airport_code}';
      `)
    .then (results => {
      if (!results.rows[0][Object.keys(results.rows[0])[0]]) {
        console.log('null: ' + results.rows[0][Object.keys(results.rows[0])[0]]);
        // const url = `http://api.wunderground.com/api/${process.env.WUNDERGROUND_TOKEN}/planner_${req.query.month}/q/${req.query.airport_code}.json`;
        // superagent(url)
        // .then (api => console.log(api.body.trip.airport_code))
      }
      else res.send(results.rows[0]);
    })
    .catch (err => console.error(err));
});


// client.query(`
//   UPDATE weather
//   SET ${req.query.month}_temp_high =
//   WHERE airport_code = ;
// `)

// app.post('/postToDB', bodyParser, (request, response) => {
//   console.log(request.body);
//   client.query(
//     'INSERT INTO weather(airport_code, jan_temp_high, jan_temp_low, jan_chanceofsunnyday, jan_cloud_cover_cond) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
//     [request.body.author, request.body.authorUrl],
//   )
//     .then( () => response.sendStatus(201))
//     .catch(console.error);
// });


loadAirportsDB();
loadWeatherDB();

app.get('/*', (req, res) => res.redirect(CLIENT_URL));

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

function loadJSON() {
  console.log('loadJSON');
  client.query('SELECT COUNT(*) FROM airports')
    .then(result => {
      if(!parseInt(result.rows[0].count)) {
        fs.readFile(`airports.json`, (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
            INSERT INTO
            airports(airport_code, name, code, lat, lon, city, state, country, continent, elev)
            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            `,
              [ele.airport_code, ele.name, ele.code, ele.lat, ele.lon, ele.city, ele.state, ele.country, ele.continent, ele.elev]
            )
              .catch(console.error);
          })
        })
      }
    })
}

function loadAirports() {
  console.log('loadAirports');
  client.query('SELECT COUNT(*) FROM weather')
    .then(result => {
      if(!parseInt(result.rows[0].count)) {
        fs.readFile(`airports.json`, (err, fd) => {
          JSON.parse(fd.toString()).forEach(ele => {
            client.query(`
            INSERT INTO
            weather(airport_code)
            SELECT $1
            `,
              [ele.airport_code]
            )
              .catch(console.error);
          })
        })
      }
    })
}

function loadAirportsDB() {
  console.log('loadAirportsDB');
  client.query(`
    CREATE TABLE IF NOT EXISTS
    airports (
      id SERIAL,
      airport_code VARCHAR(4) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(3) NOT NULL,
      lat NUMERIC(8,4),
      lon NUMERIC(8,4),
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      continent VARCHAR(255) NOT NULL,
      elev INTEGER
    );`
  )
    .then(loadJSON)
    .catch(console.error)
}

function loadWeatherDB() {
  console.log('loadWeatherDB');
  client.query(`
    CREATE TABLE IF NOT EXISTS
    weather (
      id SERIAL,
      airport_code VARCHAR(4) PRIMARY KEY,
      jan_temp_high INTEGER,
      jan_temp_low INTEGER,
      jan_chanceofsunnyday INTEGER,
      jan_cloud_cover_cond VARCHAR(255),
      feb_temp_high INTEGER,
      feb_temp_low INTEGER,
      feb_chanceofsunnyday INTEGER,
      feb_cloud_cover_cond VARCHAR(255),
      mar_temp_high INTEGER,
      mar_temp_low INTEGER,
      mar_chanceofsunnyday INTEGER,
      mar_cloud_cover_cond VARCHAR(255),
      apr_temp_high INTEGER,
      apr_temp_low INTEGER,
      apr_chanceofsunnyday INTEGER,
      apr_cloud_cover_cond VARCHAR(255),
      may_temp_high INTEGER,
      may_temp_low INTEGER,
      may_chanceofsunnyday INTEGER,
      may_cloud_cover_cond VARCHAR(255),
      jun_temp_high INTEGER,
      jun_temp_low INTEGER,
      jun_chanceofsunnyday INTEGER,
      jun_cloud_cover_cond VARCHAR(255),
      jul_temp_high INTEGER,
      jul_temp_low INTEGER,
      jul_chanceofsunnyday INTEGER,
      jul_cloud_cover_cond VARCHAR(255),
      aug_temp_high INTEGER,
      aug_temp_low INTEGER,
      aug_chanceofsunnyday INTEGER,
      aug_cloud_cover_cond VARCHAR(255),
      sep_temp_high INTEGER,
      sep_temp_low INTEGER,
      sep_chanceofsunnyday INTEGER,
      sep_cloud_cover_cond VARCHAR(255),
      oct_temp_high INTEGER,
      oct_temp_low INTEGER,
      oct_chanceofsunnyday INTEGER,
      oct_cloud_cover_cond VARCHAR(255),
      nov_temp_high INTEGER,
      nov_temp_low INTEGER,
      nov_chanceofsunnyday INTEGER,
      nov_cloud_cover_cond VARCHAR(255),
      dec_temp_high INTEGER,
      dec_temp_low INTEGER,
      dec_chanceofsunnyday INTEGER,
      dec_cloud_cover_cond VARCHAR(255)
    );`
  )
    .then(loadAirports)
    .catch(console.error)
}
