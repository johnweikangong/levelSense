var app = angular.module("app", ["ngRoute"]);
var stocks;
const LOW = 34;

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", { templateUrl : "/html/dashboard.html" })
    .when("/DSStock", { templateUrl : "/html/stock.html" })
    .when("/DSLow", { templateUrl : "/html/low.html" })
    .when("/settings", { templateUrl : "/html/settings.html" });
    $locationProvider.html5Mode(true);
});

// Retrieve stocks from server for Overview and Low Stocks
app.controller("stockCtrl", function($scope, $http) {
  $scope.getData = function() {
    $http({
      method: "GET",
      url: "/server/stock/101"
    }).then(function mySuccess(response) {
        stocks = response.data.result;
        if(typeof stocks != "undefined") { $scope.totalQty = stocks.length; }
        $scope.stocks = stocks;
        var lowStocks = filterOnlyEqualAndBelow(response.data.result, LOW);
        $scope.totalLowQty = lowStocks.length;
        $scope.lowStocks = lowStocks;
        $scope.date = Date().substring(4,21);
      }, function myError(response) {
        $scope.stocks = response.statusText;
      });
  };
  setInterval($scope.getData, 2000);
});

// Display the Settings dropdown
app.controller("settingsCtrl", function($scope) { $scope.storageID = stocks; });

// Send the form data on submission to server and display response
function formController($scope, $http) {
  $scope.processForm = function(url) {
    $http.post(url, $scope.formData)
    .success(function(data) {
      $scope.formData = {};
      $("#snackbar").html(data.result);
    	var x = document.getElementById("snackbar");
    	x.className = "show";
    	setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
    });
  };
}

// Filter stock based on percentage requested
var filterOnlyEqualAndBelow = function (stocks, percentage) {
  if(typeof stocks != "undefined") {
	   return stocks.filter(function (stock) {
       return stock.percentage <= percentage;
	    });
    } else { return []; }
};

function filter() {
  var input, tableRow, tableData, i;
  input = document.getElementById("input").value.toUpperCase();
  tableRow = document.getElementById("table").getElementsByTagName("tr");

  // Loop through all table rows, and hide those which don't match the search query
  for (i = 0; i < tableRow.length; i++) {
    tableData = tableRow[i].getElementsByTagName("td")[0];
    if (tableData && tableData.innerHTML.toUpperCase().indexOf(input) > -1) {
        tableRow[i].style.display = "";
    } else if(tableData) { tableRow[i].style.display = "none"; }
  }
}
