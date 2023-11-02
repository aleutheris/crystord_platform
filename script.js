(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = `https://pyapp-3j2xlemvha-ew.a.run.app`;

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

    $scope.calculate = function () {
      const url_host = server_url;

      const url_add = `${server_url}/add/${$scope.number1}/${$scope.number2}`;
      const url_sub = `${server_url}/sub/${$scope.number1}/${$scope.number2}`;
      const url_mul = `${server_url}/mul/${$scope.number1}/${$scope.number2}`;
      const url_div = `${server_url}/div/${$scope.number1}/${$scope.number2}`;
      const url_exp = `${server_url}/exp/${$scope.number1}/${$scope.number2}`;
      const url_title = `${server_url}/get_title/0`;

      $scope.calcTable = [
        { add: 0, sub: 0, mul: 0, div: 0, exp: 0, title: "" }
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

      $http.get(url_title)
        .then(function(response) {
          $scope.calcTable[0].title = response.data.result;
        }
        , function(error) {
          console.log(error);
        }
      );

      $http.get(url_host)
        .then(function(response) {
          $scope.hostname = response.data;
        }
        , function(error) {
          console.log(error);
        }
      );
    };
  };

  app.controller("pyController", ["$scope", "$http", pyController]);
})();
