(function () {
  "use strict";

  var app = angular.module("pyApp", ['ngRoute']);
  var shared_url = 'https://aleutherisnl1.synology.me:5665/api/get_element_content/'

  app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

  app.controller("CreateElement", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;
    $scope.element_id = 'None'
    $scope.share_element_content = 'None'

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
      const url = `${server_url}/api/create_element`;

      $http.post(url, {title: $scope.element_title, labels: [$scope.element_labels]})
        .then(function(response_ce) {
          $scope.element_id = response_ce.data.result;
          $scope.share_element_content = shared_url + $scope.element_id;

          $scope.update_element_content();
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("GetElement", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

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

  app.controller("UpdateElement", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.update_element_content = function () {
      const url = `${server_url}/api/update_element_content`;

      $http.put(url, {uuid: $scope.element_id, content: $scope.element_content})
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("Element", function ($scope, $http, $location) {
    var element_id = $location.search().element_id;
  });
})();
