(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = "http://localhost:5000";

    $scope.calculate = function () {
      const url_add = `${server_url}/add/${$scope.number1}/${$scope.number2}`;
      const url_sub = `${server_url}/sub/${$scope.number1}/${$scope.number2}`;
      const url_mul = `${server_url}/mul/${$scope.number1}/${$scope.number2}`;
      const url_div = `${server_url}/div/${$scope.number1}/${$scope.number2}`;
      const url_exp = `${server_url}/exp/${$scope.number1}/${$scope.number2}`;

      $scope.calcTable = [
        { add: 0, sub: 0, mul: 0, div: 0, exp: 0 }
      ];

      $http.get(url_add)
        .then(function(response) {
          $scope.calcTable[0].add = response.data.result;
        }, function(error) {
          console.log(error);
        });

      $http.get(url_sub)
        .then(function(response) {
          $scope.calcTable[0].sub = response.data.result;
        }
        , function(error) {
          console.log(error);
        });

      $http.get(url_mul)
        .then(function(response) {
          $scope.calcTable[0].mul = response.data.result;
        }
        , function(error) {
          console.log(error);
        });

      $http.get(url_div)
        .then(function(response) {
          $scope.calcTable[0].div = response.data.result;
        }
        , function(error) {
          console.log(error);
        }
      );

      $http.get(url_exp)
        .then(function(response) {
          $scope.calcTable[0].exp = response.data.result;
        }
        , function(error) {
          console.log(error);
        }
      );
    };
  };

  app.controller("pyController", ["$scope", "$http", pyController]);
})();
