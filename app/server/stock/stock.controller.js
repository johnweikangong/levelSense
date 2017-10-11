var fs = require("fs");
var Stock = require("./stock.model"); // Stock database storage

const HIGH = 75;
const MEDIUM = 35;

// Add new stock
module.exports.addStock = function (req, res) {
	if(req.body.storageID.length != 4 || !(/^\d+$/.test(req.body.storageID))) {
		res.json({
			"code": 20,
			"result": "Invalid Storage ID. Please try again."
		});
	} else if(req.body.name.length > 20) {
		res.json({
			"code": 30,
			"result": "Invalid Name. Please try again."
		});
	} else {
		var newStock = new Stock(req.body);
		newStock.save(function (err) {
			if (err) return res.json({"code": 40, "result": "Duplicate Storage ID. Please try again."});
			res.json({
				"code": 0,
				"result": "Successfully added the following stock, Stock Name: " + req.body.name
			});
		});
	}
};

// Update stock
module.exports.updateStock = function (req, res) {
	var storageID = req.body.storageID;
	var mass = req.body.mass;
	var battery = req.body.battery;

	var query = Stock.findOne({ storageID: storageID });
	query.select("par unitMass");
	query.exec(function(err, currStock) {
		if(err) return handleError(err);
		var percentage = getPercentage(mass, currStock.par, currStock.unitMass);
		var status = getStatus(percentage);
		var qty = Math.round(mass/currStock.unitMass);

		Stock.findOneAndUpdate(
			{ storageID: storageID },
			{ $push: { data: { 
				percentage: percentage,
				status: status,
				mass: mass,
				qty: qty,
				battery: battery,
				updatedOn: Date().substring(4, 25) } }
			}, { new: true },
			function (err) {
				if (err) return res.json(err);
				res.json({
					"code": 0,
					"result": "Successful"
				});
			}
		);
	})
};

// Change stock name
module.exports.changeStockName = function (req, res) {
	var storageID = req.body.nStorageID;
	var newName = req.body.newName;

	Stock.findOneAndUpdate(
		{ storageID: storageID },
		{ name: newName },
		function(err) {
			if(err) return res.json(err);
			res.json({
				"code": 0,
				"result": "Successfully changed the following stock, New Stock Name: " + newName
			});
		}
	);
};

// Change stock par
module.exports.changeStockPar = function (req, res) {
	var storageID = req.body.pStorageID;
	var newPar = req.body.newPar;

	Stock.findOneAndUpdate(
		{ storageID: storageID },
		{ par: newPar },
		function(err) {
			if(err) return res.json(err);
			res.json({
				"code": 0,
				"result": "Successfully changed the following stock, New PAR Level: " + newPar
			});
		}
	);
};

// Change stock mass
module.exports.changeStockMass = function (req, res) {
	var storageID = req.body.mStorageID;
	var newUnitMass = req.body.newUnitMass;

	Stock.findOneAndUpdate(
		{ storageID: storageID },
		{ unitMass: newUnitMass },
		function(err) {
			if(err) return res.json(err);
			res.json({
				"code": 0,
				"result": "Successfully changed the following stock, New Unit Mass: " + newUnitMass
			});
		}
	);
};

// Delete stock
module.exports.deleteStock = function(req, res) {
	var storageID = req.body.dStorageID;

	if(typeof storageID == "undefined") {
		res.json({
			"code": 10,
			"result": "Unsuccessful deletion. Please try again."
		})
	} else {
		Stock.findOneAndRemove(
			{ storageID: storageID },
			function(err) {
				if(err) return res.json(err);
				res.json({
					"code": 0,
					"result": "Successfully deleted the following stock, Storage ID: " + storageID
				});
			}
		);
	}
};

// Retrieve stock when there is a HTTP request
module.exports.getStock = function (req, res) {
	var percentage = (req.params.percentage ? req.params.percentage : 0);
	Stock.find({}, { data: { $slice: -1 } }, function (err, stocks) {
		if (err) return res.json(err);
		stocks = stocks.map(function (stock) {
			return {
				storageID: stock.storageID,
				name: stock.name,
				par: stock.par,
				unitMass: stock.unitMass,
				percentage: stock.data[0].percentage,
				status: stock.data[0].status,
				qty: stock.data[0].qty,
				battery: stock.data[0].battery,
				updatedOn: stock.data[0].updatedOn
			};
		});

		var filteredResult = filterOnlyEqualAndBelow(stocks, percentage);
		sortResult(filteredResult);
		res.json({
			"code": 0,
			"result": filteredResult
		});
	});
};

// Get percentage based on mass, PAR and unit mass
var getPercentage = function(mass, par, unitMass) {
	var percentage = mass/(par*unitMass)*100; // Current mass divided by total mass
	if(percentage > 100) return 100;
	return percentage;
}

// Get status based on percentage
var getStatus = function(percentage) {
	if(percentage >= HIGH) return "HIGH";
	else if(percentage >= MEDIUM) return "MEDIUM";
	else return "LOW";
}

// Filter stock based on percentage requested
var filterOnlyEqualAndBelow = function(stocks, percentage) {
	return stocks.filter(function (stock) {
		return stock.percentage <= percentage;
	});
};

// Sort stock based on storage ID
var sortResult = function(displayStocks) {
	displayStocks.sort(function (a, b) {
		return parseFloat(a.storageID) - parseFloat(b.storageID);
	});
	return displayStocks;
};
