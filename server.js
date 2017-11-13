'use strict';

// Dependencies
const express = require('express');
const cors = require('cors');

// App Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Middleware
app.use(cors());

// API Endpoints
app.get('/*', (req, res) => res.redirect(CLIENT_URL));




app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
