var express = require('express');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var ctrl = require('./email.controller');
var router = express.Router();

module.exports = router;
