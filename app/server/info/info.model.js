var mongoose = require('mongoose');

var infoSchema = mongoose.Schema({
  location: {
    type: String,
    required: true
  },
	email: String
});

module.exports = mongoose.model("Info", infoSchema);
