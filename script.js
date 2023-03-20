(function() {
    "use strict";

    var app = angular.module("voViewer", []);

    var FrameController = function($scope, $http) {
        $scope.tableData = [
            { name: 'Alice', age: 27, city: 'New York' },
            { name: 'Bob', age: 30, city: 'Chicago' },
            { name: 'Charlie', age: 35, city: 'San Francisco' }
        ];

        $scope.generate = function() {
            var promise = $http.get("https:localhost/square/6");

            promise.then(function(response) {
                pixelsGenerated = response.data;
                $scope.tableData[0]['age'] = response.data['square']
            });
        };
    }

    app.controller("FrameController", ["$scope", "$http", FrameController]);
}());
