(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = "http://localhost:5000";

    $scope.create_unitbase = function () {
      const url = `${server_url}/api/create_unitbase`;
      $http.get(url)
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };

    $scope.add_unit = function () {
      const url = `${server_url}/api/add_unit?title=${$scope.unit_title}`;
      $http.get(url)
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };

    $scope.remove_unit = function () {
      const url = `${server_url}/api/remove_unit?unit_id=${$scope.unit_id}`;
      $http.get(url)
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };

    $scope.search_units = function () {
      const url = `${server_url}/api/search_units`;

      $http.get(url)
        .then(function(response) {
          $scope.search_table = response.data;
        }, function(error) {
          console.log(error);
        });
    };
  };

  app.controller("pyController", ["$scope", "$http", pyController]);
})();
