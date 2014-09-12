
var expensesApp = angular.module('expensesApp', ['ngRoute']);

expensesApp.controller('ExpensesController', function($scope, $http) {
  $scope.availableCategories = [ 'Food', 'Home', 'Lunch', 'Entertainment', 'Transportation' ];
  $scope.chartData = [0.0, 0.0, 0.0, 0.0, 0.0];
  
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
    
    for (var i = 0; i < $scope.categories.length; i++) {
      $scope.chartData[i] = Math.abs($scope.categories[i].amount);
    }
    console.log($scope.chartData);
  };
  
  $scope.setCategory = function(tx) {
    console.log('Updating category on', tx);
    $http.put('api/transactions/' + tx._id, {}, { params: { category: tx.category } }).success(function(data) {
      $scope.updateCategory();
    });
  };
  
  $scope.search();
});

expensesApp.directive('barsChart', function($parse) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      chartData: '='
    },
    link: function($scope, element, attrs) {
      var chart = d3.select(element[0]);
        
      $scope.$watch('chartData', function(newValue, oldValue) {
        if (newValue) {
          var total = 0.0;
          for (var i = 0; i < newValue.length; i++) {
            total += newValue[i];
          }
          
          chart.selectAll('div').remove();
          chart.append('div').attr('class', 'category-chart')
            .selectAll('div')
            .data(newValue).enter().append('div')
            .transition().ease('elastic')
            .style('width', function(d) { return d / total * 100.0 + '%'; })
            .text(function(d) {
              if (!d || d === 0) {
                return '';
              } else {
                return Math.round(d / total * 100.0) + ' %';
              }
            });
        }
      }, true);
    }
  };
});

expensesApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/transactions', {
        templateUrl: 'partials/transactions.html',
        controller: 'ExpensesController'
      })
      .when('/year', {
        templateUrl: 'partials/year.html',
        controller: 'YearController'
      })
      .otherwise({
        redirectTo: '/transactions'
      });
  }
]);
