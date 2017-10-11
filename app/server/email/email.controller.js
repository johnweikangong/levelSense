var nodemailer = require('nodemailer');
var Promise = require("bluebird");
var request = Promise.promisify(require("request"), { multiArgs: true });
Promise.promisifyAll(request, { multiArgs: true })
var stock = "http://localhost:80/server/stock/";
var info = "http://localhost:80/server/info/get";
var schedule = require('node-schedule');
var alertRule = new schedule.RecurrenceRule();
alertRule.second = [0,10,20,30,40,50];
var reportRule = new schedule.RecurrenceRule();
reportRule.hour = [9, 15];
reportRule.minute = [0, 0];
var infos;

const LOW = 34;

var message = function (type) {
	return request.getAsync(info).spread(function (res, body) {
		if (res.statusCode != 200) throw new Error("Call failed, code: " + res.statusCode);
		return JSON.parse(body).result;
	}).then(function (info) {
		infos = info;
		if(type == "ALERT") return createAlertEmailMessage(info);
		else if(type == "REPORT") return createReportEmailMessage(info);
	});
}

var createAlertEmailMessage = function (info) {
	return request.getAsync(stock + LOW).spread(function (res, body) {
		if (res.statusCode != 200) throw new Error("Call failed, code: " + res.statusCode);
		return JSON.parse(body).result;
	}).then(function(stocksWithPercentageLow) {
		var num = 1;
		if (typeof stocksWithPercentageLow != "undefined" && stocksWithPercentageLow.length > 0) {
			var text = "Location: " + info[0].location + "\n\n";
			text += "These item(s) are running low in stock: \n\n";
			for (var i = 0; i < stocksWithPercentageLow.length; i++) {
 				if (stocksWithPercentageLow[i].status == "LOW") {
					text += num + ")\t" + stocksWithPercentageLow[i].name + " (storage ID: " + stocksWithPercentageLow[i].storageID + ")\n";
					text += "\tStatus: " +  stocksWithPercentageLow[i].status + " in stock\n";
					text += "\tRequired quantity: " + (stocksWithPercentageLow[i].par-stocksWithPercentageLow[i].qty) + "\n";
					text += "\tLast updated: " + stocksWithPercentageLow[i].updatedOn + "\n\n";
					num++;
				}
			}

			text += "This is an automatically generated email. Please do not reply.\n\n"
			return text;
		}
	});
};

var createReportEmailMessage = function (info) {
	return request.getAsync(stock + 100).spread(function (res, body) {
		if (res.statusCode != 200) throw new Error("Call failed, code: " + res.statusCode);
		return JSON.parse(body).result;
	}).then(function (stocks) {
		var num = 1;
		var text = "Location: " + info[0].location + "\n\n";
		text += "Current Stock Overview: \n\n";
		for (var i = 0; i < stocks.length; i++) {
			text += num + ")\t" + stocks[i].name + " (storage ID: " + stocks[i].storageID + ")\n";
			text += "\tStatus: " + stocks[i].status + "\n";
			text += "\tCurrent Quantity: " + stocks[i].qty + "\n";
			text += "\tLast updated: " + stocks[i].updatedOn + "\n\n";
			num++;
		}

		text += "This is an automatically generated email. Please do not reply.\n\n"
		return text;
	});
};

// Initialises the sender's particulars
var transporter = nodemailer.createTransport({
	service: 'gmail',
	host: "smtp.gmail.com",
	auth: {
		user: 'kkhprojecttesting@gmail.com',
		pass: 'kkhtesting'
	}
});

// Send Scheduled Alert Email hourly between 9am and 5pm
schedule.scheduleJob(alertRule, function sendAlertGmail() {
	message("ALERT").then(function (msg) {
		if (typeof msg == "undefined") return;
		else {
      // console.log("Alert Email Message \n\n" + msg);
			var mailOptions = {
				from: 'kkhprojecttesting@gmail.com',
				to: infos[0].email,
				subject: "Low Stock Alert (" + Date().substring(4, 21) + ")",
				text: msg
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) console.log(error);
				else console.log('Alert Email sent: ' + info.response + '\n\n');
			});
		}
		return;
	});
});

// Send Scheduled Report Email at 9am and 3pm
schedule.scheduleJob(reportRule, function sendReportGmail() {
	message("REPORT").then(function (msg) {
    // console.log("Report Email Message \n\n" + msg);
		var mailOptions = {
			from: 'kkhprojecttesting@gmail.com',
			to: infos[0].email,
			subject: 'Stock Overview Report (' + Date().substring(4, 21) + ')',
			text: msg
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) console.log(error);
			else console.log('Report Email sent: ' + info.response + '\n\n');
		});
		return;
	});
});
