var express = require('express');
var ctrl = require('./stock.controller');
var router = express.Router();

router.post('/add', ctrl.addStock);
router.post('/', ctrl.updateStock);
router.post('/changeName', ctrl.changeStockName);
router.post('/changePar', ctrl.changeStockPar);
router.post('/changeMass', ctrl.changeStockMass);
router.post('/delete', ctrl.deleteStock);
router.get('/:percentage', ctrl.getStock);

module.exports = router;
