
var expensesApp = angular.module('expensesApp', []);

expensesApp.controller('ExpensesController', function($scope, $http) {
  $http.get('api/transactions').success(function(data) {
    $scope.transactions = data;
  });
  
  $scope.predicate = 'receiver';
  $scope.from_date = '2014-06-01'; // moment.startOf('month');
  $scope.to_date = '2014-06-30'; // moment.endOf('month');
  
  $scope.search = function() {
    $scope.from_date = 'ok';
    $http.get('api/transactions', {
      params: {
        from_date: moment($scope.from_date).toDate(),
        to_date: moment($scope.to_date).toDate()
    }}).success(function(data) {
      $scope.transactions = data;
    });
  };
});
