(function () {
  "use strict";

  var app = angular.module("pyApp", []);

  var pyController = function ($scope, $http) {
    const server_url = `http://aleutherisnl1.synology.me:5000`;

    $scope.create_element = function () {
      const url_ce = `${server_url}/api/create_element`;

      $http.post(url_ce, {title: $scope.element_title, labels: [$scope.element_labels]})
        .then(function(response_ce) {
          $scope.element_id = response_ce.data.result;
          const url_ue = `${server_url}/api/update_element_content`;

          $http.put(url_ue, {uuid: $scope.element_id, content: $scope.element_content})
            .then(function(response_ue) {
              console.log(response_ue);
            }, function(error) {
              console.log(error);
            });

        }, function(error) {
          console.log(error);
        });
    };

    $scope.get_element_content = function () {
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
