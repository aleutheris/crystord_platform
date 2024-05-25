(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = `http://aleutherisnl1.synology.me:5000`;

    $scope.get_element = function () {
      const url = `${server_url}/api/get_element_content/${$scope.element_id}`;

      $http.get(url)
        .then(function(response) {
          $scope.element_content = response.data.result;
        }, function(error) {
          console.log(error);
        });
    };
  };

  app.controller("pyController", ["$scope", "$http", pyController]);
})();
