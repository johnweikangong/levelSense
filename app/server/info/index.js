var express = require('express');
var ctrl = require('./info.controller');
var router = express.Router();

router.post('/changeLocation', ctrl.changeLocation);
router.post('/changeEmail', ctrl.changeEmail);
router.get('/get', ctrl.getInfo);

module.exports = router;
