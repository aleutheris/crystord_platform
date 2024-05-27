(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  app.controller("CreateElement", function ($scope, $http) {
    const server_url = `http://aleutherisnl1.synology.me:5000`;

    $scope.update_element_content = function () {
      const url = `${server_url}/api/update_element_content`;

      $http.put(url, {uuid: $scope.element_id, content: $scope.element_content})
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };

    $scope.create_element = function () {
      const url_ce = `${server_url}/api/create_element`;

      $http.post(url_ce, {title: $scope.element_title, labels: [$scope.element_labels]})
        .then(function(response_ce) {
          $scope.element_id = response_ce.data.result;
          const url_ue = `${server_url}/api/update_element_content`;

          $scope.update_element_content();
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("GetElement", function ($scope, $http) {
    const server_url = `http://aleutherisnl1.synology.me:5000`;

    $scope.get_element_content = function () {
      const url = `${server_url}/api/get_element_content/${$scope.element_id}`;

      $http.get(url)
        .then(function(response) {
          $scope.element_content = response.data.result;
        }, function(error) {
          console.log(error);
        });
    };
  });

  // app.controller("CreateElement", ["$scope", "$http", CreateElement]);
})();
