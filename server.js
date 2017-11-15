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
        const url = `http://api.wunderground.com/api/${process.env.WUNDERGROUND_TOKEN}/planner_${req.query.monthnumbers}/q/${req.query.airport_code}.json`;
        superagent(url)
          .then (api => {
            client.query(`
              UPDATE weather
              SET ${req.query.month}_temp_high = '${api.body.trip.temp_high.avg.F}',
              ${req.query.month}_temp_low = '${api.body.trip.temp_low.avg.F}',
              ${req.query.month}_chanceofsunnyday = '${api.body.trip.chance_of.chanceofsunnycloudyday.percentage}',
              ${req.query.month}_cloud_cover_cond = '${api.body.trip.cloud_cover.cond}'
              WHERE airport_code = '${api.body.trip.airport_code}';
            `)
              .then (res.send({'key': api.body.trip.temp_high.avg.F}))
              .catch(err => console.error(err));
          })
          .catch (err => console.error(err));
      }
      else res.send(results.rows[0]);
    })
    .catch (err => console.error(err));
});

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
            airports(airport_code, name, code, lat, lon, continent, elev)
            SELECT $1, $2, $3, $4, $5, $6, $7
            `,
              [ele.airport_code, ele.name, ele.code, ele.lat, ele.lon, ele.continent, ele.elev]
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
      jan_temp_high VARCHAR(3),
      jan_temp_low VARCHAR(3),
      jan_chanceofsunnyday VARCHAR(3),
      jan_cloud_cover_cond VARCHAR(255),
      feb_temp_high VARCHAR(3),
      feb_temp_low VARCHAR(3),
      feb_chanceofsunnyday VARCHAR(3),
      feb_cloud_cover_cond VARCHAR(255),
      mar_temp_high VARCHAR(3),
      mar_temp_low VARCHAR(3),
      mar_chanceofsunnyday VARCHAR(3),
      mar_cloud_cover_cond VARCHAR(255),
      apr_temp_high VARCHAR(3),
      apr_temp_low VARCHAR(3),
      apr_chanceofsunnyday VARCHAR(3),
      apr_cloud_cover_cond VARCHAR(255),
      may_temp_high VARCHAR(3),
      may_temp_low VARCHAR(3),
      may_chanceofsunnyday VARCHAR(3),
      may_cloud_cover_cond VARCHAR(255),
      jun_temp_high VARCHAR(3),
      jun_temp_low VARCHAR(3),
      jun_chanceofsunnyday VARCHAR(3),
      jun_cloud_cover_cond VARCHAR(255),
      jul_temp_high VARCHAR(3),
      jul_temp_low VARCHAR(3),
      jul_chanceofsunnyday VARCHAR(3),
      jul_cloud_cover_cond VARCHAR(255),
      aug_temp_high VARCHAR(3),
      aug_temp_low VARCHAR(3),
      aug_chanceofsunnyday VARCHAR(3),
      aug_cloud_cover_cond VARCHAR(255),
      sep_temp_high VARCHAR(3),
      sep_temp_low VARCHAR(3),
      sep_chanceofsunnyday VARCHAR(3),
      sep_cloud_cover_cond VARCHAR(255),
      oct_temp_high VARCHAR(3),
      oct_temp_low VARCHAR(3),
      oct_chanceofsunnyday VARCHAR(3),
      oct_cloud_cover_cond VARCHAR(255),
      nov_temp_high VARCHAR(3),
      nov_temp_low VARCHAR(3),
      nov_chanceofsunnyday VARCHAR(3),
      nov_cloud_cover_cond VARCHAR(255),
      dec_temp_high VARCHAR(3),
      dec_temp_low VARCHAR(3),
      dec_chanceofsunnyday VARCHAR(3),
      dec_cloud_cover_cond VARCHAR(255)
    );`
  )
    .then(loadAirports)
    .catch(console.error)
}
