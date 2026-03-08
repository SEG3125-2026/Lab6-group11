const express = require('express');
const path = require('path');
const surveyController = require('./surveyController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

surveyController(app);

module.exports = app;
