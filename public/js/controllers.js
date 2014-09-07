
var expensesApp = angular.module('expensesApp', []);

expensesApp.controller('ExpensesController', function($scope, $http) {
  $scope.availableCategories = [ 'Food', 'Home', 'Lunch', 'Entertainment', 'Transportation' ];
  
  $scope.predicate = 'receiver';
  $scope.from_date = '2014-08-01'; // moment.startOf('month');
  $scope.to_date = '2014-08-30'; // moment.endOf('month');
  
  $scope.search = function() {
    $http.get('api/transactions', {
      params: {
        from_date: $scope.from_date,
        to_date: $scope.to_date
    }}).success(function(data) {
      $scope.transactions = data;
      $scope.updateCategory();
    });
  };
  
  var getCategory = function(categoryName) {
    for (var i = 0; i < $scope.categories.length; i++) {
      var category = $scope.categories[i];
      // console.log('category.name: ' + category.name + ', categoryName: ' + categoryName);
      if (category.name === categoryName) {
        return category;
      }
    }
    
    // console.log('No categories, creating new', categoryName);
    
    var category = { name: categoryName, amount: 0.00 };
    $scope.categories.push(category);
    return category;
  };
  
  $scope.updateCategory = function() {
    $scope.categories = [];
    
    for (var i = 0; i < $scope.availableCategories.length; i++) {
      var category = getCategory($scope.availableCategories[i]);
      category.amount = 0.0;
    }
    
    for (var i = 0; i < $scope.transactions.length; i++) {
      var tx = $scope.transactions[i];
      
      if (tx.category) {
        var category = getCategory(tx.category);
        category.amount += tx.amount;
        // console.log('category', tx.category);
      }
    }
  };
  
  $scope.setCategory = function(tx) {
    console.log('Updating category on', tx);
    $http.put('api/transactions/' + tx._id, {}, { params: { category: tx.category } }).success(function(data) {
      $scope.updateCategory();
    });
  };
  
  $scope.search();
});
