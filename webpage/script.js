(function () {
  "use strict";

  var app = angular.module("pyApp", ['ngRoute']);
  var api_url = 'https://aleutherisnl1.synology.me:5665/api/get_atom_content/'
  var share_url = 'http://crystord/atom.html?atom_id='

  app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

  app.controller("CreateAtom", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;
    $scope.atom_id = 'None'
    $scope.atom_share_url = 'None'

    $scope.update_atom_content = function () {
      const url = `${server_url}/api/update_atom_content`;

      $http.put(url, {atom_ids: $scope.atom_id, content: $scope.atom_content})
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };

    $scope.create_atom = function () {
      const url = `${server_url}/api/create_atom`;

      $http.post(url, {title: $scope.atom_title, labels: [$scope.atom_labels]})
        .then(function(response_ce) {
          $scope.atom_id = response_ce.data.result;
          $scope.atom_share_url = share_url + $scope.atom_id;

          $scope.update_atom_content();
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("GetAtom", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.get_atom = function () {
      $scope.get_atom_content();
      $scope.list_atom_labels();
    };

    $scope.get_atom_content = function () {
      const url = `${server_url}/api/get_atom_content/${$scope.atom_id}`;
      $scope.atom_share_url = share_url + $scope.atom_id;

      $http.get(url)
        .then(function(response) {
          $scope.atom_content = response.data.result;
        }, function(error) {
          console.log(error);
        });
    };

    $scope.list_atom_labels = function () {
      const url = `${server_url}/api/list_labels`;
      $http.post(url, {atom_ids: [$scope.atom_id]})
        .then(function(response) {
          $scope.atom_labels = response.data.result;
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("UpdateAtom", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.update_atom_content = function () {
      const url = `${server_url}/api/update_atom_scalar_fields`;
      var fields = {
        'Title': $scope.atom_title,
        'Description': $scope.atom_description,
        'Content': $scope.atom_content,
        'Operation': $scope.atom_operation,
      }
      $http.put(url, {atom_ids: $scope.atom_id, fields: fields})
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("AddLabelsToAtoms", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.AddLabelsToAtoms = function () {
      const url = `${server_url}/api/add_labels_to_atoms`;
      $http.post(url, {atom_ids: [$scope.atomId], labels: [$scope.atomLabels]})
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("RemoveLabelsFromAtoms", function ($scope, $http) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.RemoveLabelsFromAtoms = function () {
      const url = `${server_url}/api/remove_labels_from_atoms`;
      const data = {atom_ids: [$scope.atomId], labels: [$scope.atomLabels]};
      const config = {
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        data: data
      };

      $http.delete(url, config)
        .then(function(response) {
          console.log(response);
        }, function(error) {
          console.log(error);
        });
    };
  });

  app.controller("GetAtomURL", function ($scope, $http, $location, $window) {
    const server_url = `https://aleutherisnl1.synology.me:5665`;

    $scope.atom_id = $location.search().atom_id;

    const url_all_fields = `${server_url}/api/get_atom_all_fields/${$scope.atom_id}`;
    $scope.atom_content_api_url = api_url + $scope.atom_id;

    const url_list_labels = `${server_url}/api/list_labels`;

    $http.post(url_list_labels, {atom_ids: [$scope.atom_id]})
      .then(function(response) {
        $scope.atom_labels = response.data.result;
      }, function(error) {
        console.log(error);
    });

    $http.get(url_all_fields)
      .then(function(response) {
        $scope.atom_data = response.data;
        $scope.atom_title = response.data['Title'];
        $scope.atom_content = response.data['Content'];
      }, function(error) {
        console.log(error);
      });

      $scope.copyToClipboard = function(textToCopy) {
        var textArea = document.createAtom("textarea");
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
