var fs = require('fs');
var Info = require('./info.model'); // Information database storage

// Change the location of the store
module.exports.changeLocation = function(req, res) {
	var oldLocation = req.body.oldLocation;
	var newLocation = req.body.newLocation;

	if(newLocation == "") {
		res.json({
			"code": 10,
			"result": "Empty Location"
		});
	}
	else if(oldLocation == newLocation) {
		res.json({
			"code": 20,
			"result": "Identical Location"
		});
	}
	else {
		Info.findOneAndUpdate(
			{ location: oldLocation },
			{ location: newLocation },
			{ new: true },
			function(err, newLocation) {
				if(err) return res.json(err);

				res.json({
					"code": 0,
					"result": "Successful"
				});
			}
		);
	}
}

// Change the email address for receiver of Alert and Report
module.exports.changeEmail = function(req, res) {
	var oldEmail = req.body.oldEmail;
	var newEmail = req.body.newEmail;
	var emailTest = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

	if(newEmail == "") {
		res.json({
			"code": 10,
			"Result": "Empty Email"
		});
	}
	else if(!emailTest.test(newEmail)) {
		res.json({
			"code": 20,
			"Result": "Invalid Email"
		})
	}
	else if(oldEmail == newEmail) {
		res.json({
			"code": 30,
			"Result": "Identical Email"
		});
	}
	else {
		Info.findOneAndUpdate(
			{ email: oldEmail },
			{ email: newEmail },
			function(err, storageID) {
				if(err) return res.json(err);

				res.json({
					"code": 0,
					"Result": "Successful"
				});
			}
		);
	}
}

// Retrieve info when there is a HTTP request
module.exports.getInfo = function (req, res) {
	Info.find({}, { data: { $slice: -1 } }, function (err, info) {
		if (err) return res.json(err);

		info = info.map(function (Info) {
			return {
        location: Info.location,
        email: Info.email
      };
    });

    res.json({
			"code": 0,
			"result": info
		});
	});
};

// Adds default info if the database is empty
(function defaultInfo() {
	var newInfo = new Info({location: "NILL", email: "kkhprojecttesting@gmail.com"});
	Info.count({}, function( err, count) {
  	if(count == 0) {
			newInfo.save(function (err, info) {
				if (err) return res.json(err);
				console.log("Default Info sucessfully added!");
			});
		}
	});
})();
