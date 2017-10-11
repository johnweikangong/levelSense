var mongoose = require("mongoose");

var data = mongoose.Schema({
	percentage: {
		type: Number,
		min: 0,
		max: 101,
		required: true
	},
	status: {
		type: String,
		default: "EMPTY"
	},
	mass: {
		type: Number,
		default: 0
	},
	qty: {
		type: Number,
		default: 0
	},
	battery: {
		type: Number,
		min: 0,
		max: 100,
		default: 0
	},
	updatedOn: {
		type: String,
		default: Date().substring(4, 25)
	}
}, { _id: false });

var stockSchema = mongoose.Schema({
	storageID: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	par: {
		type: Number,
		required: true
	},
	unitMass: {
		type: Number,
		required: true
	},
	data: {
		type: [data],
		default: {percentage: 101}
	}
});

module.exports = mongoose.model("Stock", stockSchema);
