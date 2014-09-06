
var expensesApp = angular.module('expensesApp', []);

expensesApp.controller('ExpensesController', function($scope, $http) {
  $http.get('api/transactions').success(function(data) {
    $scope.transactions = data;
  });
  
  $scope.predicate = 'receiver';
  $scope.from_date = '2014-08-01'; // moment.startOf('month');
  $scope.to_date = '2014-08-30'; // moment.endOf('month');
  
  $scope.search = function() {
    $http.get('api/transactions', {
      params: {
        from_date: moment($scope.from_date).toDate(),
        to_date: moment($scope.to_date).toDate()
    }}).success(function(data) {
      $scope.transactions = data;
    });
  };
  
  var getCategory = function(categoryName) {
    for (var i = 0; i < $scope.categories.length; i++) {
      var category = $scope.categories[i];
      console.log('category.name: ' + category.name + ', categoryName: ' + categoryName);
      if (category.name === categoryName) {
        return category;
      }
    }
    
    console.log('No categories, creating new', categoryName);
    
    var category = { name: categoryName, amount: 0.00 };
    $scope.categories.push(category);
    return category;
  }
    
  $scope.updateCategory = function() {
    $scope.categories = [];
    
    for (var i = 0; i < $scope.transactions.length; i++) {
      var tx = $scope.transactions[i];
      
      if (tx.category) {
        var category = getCategory(tx.category);
        category.amount += tx.amount;
        console.log('category', tx.category);
      }
    }
  };
});
