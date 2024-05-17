(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = `http://aleutherisnl1.synology.me:5000`;

    $scope.create_unitbase = function () {
      const url = `${server_url}/`;
      $http.get(url)
        .then(function(response) {
          console.log(response);
          $scope.r = response.data.message;
        }, function(error) {
          console.log(error);
        });
    };
  };

  app.controller("pyController", ["$scope", "$http", pyController]);
})();
