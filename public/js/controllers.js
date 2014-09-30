
var expensesApp = angular.module('expensesApp', ['ngRoute']);

expensesApp.controller('ExpensesController', function($scope, $http) {
  $scope.availableCategories = [ 'Food', 'Home', 'Lunch', 'Entertainment', 'Transportation' ];
  $scope.selectableCategories = [];
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
  
  $scope.findAllCategories = function() {
    $http.get('api/categories', {}).success(function(data) {
      $scope.selectableCategories = [];
      if (data) {
        for (var i = 0; i < data.length; i++) {
          $scope.selectableCategories.push(data[i].name);
        }
      }
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
  
  $scope.findAllCategories();
  $scope.search();
});

expensesApp.controller('CategoryController', function($scope, $http) {
  $scope.categories = [];
  $scope.newCategoryName = '';
  
  $scope.findAll = function() {
    $http.get('api/categories', {}).success(function(data) {
      $scope.categories = data;
    });
  };
  
  $scope.addCategory = function() {
    console.log('Adding', $scope.newCategoryName);
    
    if ($scope.newCategoryName) {
      var category = $scope.newCategoryName;
      $scope.newCategoryName = '';
      console.log('Posting category', category);
      $http.post('api/categories/', { name: category }).success(function(data) {
        console.log('post done');
        $scope.findAll();
      });
    }
  };
  
  $scope.removeCategory = function(category) {
    $http.delete('api/categories/' + category._id, {}).success(function(data) {
      console.log('delete done');
      $scope.findAll();
    });
  };
  
  $scope.setType = function(category, type) {
    category.type = type;
    
    $http.put('api/categories/' + category._id, { category: category }).success(function(data) {
      console.log('is not expense status updated');
      $scope.findAll();
    });
  };
  
  $scope.findAll();
});

expensesApp.controller('YearController', function($scope, $http) {
  $scope.months = [];
  $scope.categories = [];
  $scope.rows = [];
  
  for (var i = 0; i < 12; i++) {
    $scope.months.push( { month: i, total: 0.0 } );
  }
  
  $scope.expense = function(category) {
    return category.type !== 1 && category.type !== 2;
  };
  
  $scope.income = function(category) {
    return category.type === 1;
  };
  
  $scope.saving = function(category) {
    return category.type === 2;
  };
  
  $scope.calculate = function() {
    $http.get('api/year', {}).success(function(data) {
      $scope.months = data;
      
      for (var i = 0; i < $scope.months.length; i++) {
        var month = $scope.months[i];
        month.readableMonth = moment().month($scope.months[i].month).format('MMM');
        
        var categories = month.categories;
        for (var j = 0; j < categories.length; j++) {
          var category = categories[j];
          
          var index = $scope.categories.map(function(c) { return c.name; }).indexOf(category.name);
          
          if (index < 0) {
            $scope.categories.push(category);
          }
        }
        
        month.categoryForName = function(month, category) {
          if (month.categories.length === 0) {
            return 0.00;
          }
    
          var categoryIndex = -1;
    
          for (var j = 0; j < month.categories.length; j++) {
            if (month.categories[j].name === category.name) {
              categoryIndex = j;
              break;
            }
          }
    
          if (categoryIndex < 0) {
            return 0.00;
          }
    
          return month.categories[categoryIndex].amount;
        }; // function
      } // for
    });
  };
  
  $scope.calculate();
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
      .when('/categories', {
        templateUrl: 'partials/categories.html',
        controller: 'CategoryController'
      })
      .otherwise({
        redirectTo: '/transactions'
      });
  }
]);
