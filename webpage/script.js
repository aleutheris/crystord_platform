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
    $scope.element_content_api_url = 'None'

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
          $scope.element_content_api_url = shared_url + $scope.element_id;

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

  app.controller("GetElementURL", function ($scope, $http, $location, $window) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.element_id = $location.search().element_id;

    const url = `${server_url}/api/get_element_all_fields/${$scope.element_id}`;
    $scope.element_content_api_url = shared_url + $scope.element_id;

    $http.get(url)
      .then(function(response) {
        $scope.element_data = response.data;
        $scope.element_title = response.data['Title'];
        $scope.element_content = response.data['Content'];
      }, function(error) {
        console.log(error);
      });

      $scope.copyToClipboard = function(textToCopy) {
        var textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (err) {
          console.log('Oops, unable to copy');
        }
        document.body.removeChild(textArea);
      };

  });
})();
