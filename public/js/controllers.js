
var expensesApp = angular.module('expensesApp', ['ngRoute']);

expensesApp.controller('TransactionController', function($scope, $http) {
  $scope.availableCategories = [ 'Food', 'Home', 'Lunch', 'Entertainment', 'Transportation' ];
  $scope.selectableCategories = [];
  
  $scope.predicate = 'receiver';
  $scope.from_date = moment().startOf('month').format("YYYY-MM-DD");
  $scope.to_date = moment().endOf('month').format("YYYY-MM-DD");
  $scope.from_account = '';
  
  $scope.search = function() {
    $http.get('api/transactions', {
      params: {
        from_date: $scope.from_date,
        to_date: $scope.to_date,
        from_account_number: $scope.from_account
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
  
  $scope.toggleSplit = function(category) {
    if (category.split) {
      category.split = !category.split;
    } else {
      category.split = true;
    }
    
    $http.put('api/categories/' + category._id, { category: category }).success(function(data) {
      console.log('is not expense status updated');
      $scope.findAll();
    });
  }
  
  $scope.findAll();
});

expensesApp.controller('YearController', function($scope, $http) {
  $scope.months = [];
  $scope.categories = [];
  $scope.rows = [];
  $scope.persons = [];
  $scope.personMonths = {};
  $scope.personCategories = {};
  $scope.totalSplitForMonth = {};
  
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
  
  $scope.processCalculationResult = function(data) {
    for (var i = 0; i < data.length; i++) {
      var month = data[i];
      month.readableMonth = moment().month(data[i].month).format('MMM');
      
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
    
    return data;
  }
  
  $scope.calculate = function() {
    $http.get('api/year', {}).success(function(data) {
      $scope.months = $scope.processCalculationResult(data);
    });
  };
  
  $scope.findPersons = function() {
    $http.get('api/persons', {}).success(function(data) {
      $scope.persons = data;
      for (var i = 0; i < data.length; i++) {
        $scope.calculatePerson(data[i]);
      }
    });
  };
  
  $scope.calculatePerson = function(person) {
    $http.get('api/year/' + person._id, {}).success(function(data) {
      $scope.personCategories[person.name] = [];
      $scope.personMonths[person.name] = $scope.processCalculationResultForPerson(data, person.name);
    });
  };
  
  $scope.processCalculationResultForPerson = function(data, personName) {
    for (var i = 0; i < data.length; i++) {
      var month = data[i];
      month.readableMonth = moment().month(data[i].month).format('MMM');
      
      var categories = month.categories;
      for (var j = 0; j < categories.length; j++) {
        var category = categories[j];
        
        var index = $scope.personCategories[personName].map(function(c) { return c.name; }).indexOf(category.name);
        
        if (index < 0) {
          $scope.personCategories[personName].push(category);
        }
      }

      month.personCategoryForName = function(month, category) {
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
      
      month.personSplitForMonth = function(month) {
        var splitAmountForMonth = 0.00;
        for (var j = 0; j < month.categories.length; j++) {
          var category = month.categories[j];
          if (category.split && category.amount) {
            splitAmountForMonth += category.amount;
          }
        }
        return splitAmountForMonth;
      }; // function
    } // for
    
    return data;
  };
  
  $scope.calculate();
  $scope.findPersons();
});

expensesApp.controller('HouseholdController', function($scope, $http) {
  $scope.persons = [];
  $scope.accounts = [];
  $scope.nameInput = '';
  $scope.showAddPersonDialog = false;

  $scope.findAll = function() {
    $http.get('api/persons', {}).success(function(data) {
      $scope.persons = data;
    });
  };
  
  $scope.savePerson = function() {
    console.log('Adding', $scope.nameInput);
    
    if ($scope.person) {
      console.log('saving person');
      var nameInput = $scope.nameInput;
      var selectedAccounts = $scope.accounts.filter(function(account) { return account.selected === true }).map(function (account) { return account.number });
      var person = $scope.person;
      person.name = nameInput;
      person.accounts = selectedAccounts;
      console.log('Putting person', person);
      $http.put('api/persons/' + person._id, { person: person }).success(function(data) {
        console.log('put done');
        $scope.showAddPersonDialog = false;
        $scope.findAll();
      });
    } else if ($scope.nameInput) {
      console.log('adding new person');
      var nameInput = $scope.nameInput;
      var selectedAccounts = $scope.accounts.filter(function(account) { return account.selected === true }).map(function (account) { return account.number });
      $scope.nameInput = '';
      console.log('Posting person', nameInput, selectedAccounts);
      $http.post('api/persons/', { name: nameInput, accounts: selectedAccounts }).success(function(data) {
        console.log('post done');
        $scope.showAddPersonDialog = false;
        $scope.findAll();
      });
    }
  };
  
  $scope.removePerson = function(person) {
    $http.delete('api/persons/' + person._id, {}).success(function(data) {
      console.log('delete done');
      $scope.findAll();
    });
  };
  
  $scope.editPerson = function(person) {
    $scope.nameInput = person.name;
    $scope.showAddPersonDialog = true;
    
    var selectedAccounts = $scope.accounts.map(function(account) {
      var index = person.accounts.indexOf(account.number)
      return { number: account.number, selected: index >= 0 };
    });
    
    $scope.accounts = selectedAccounts;
    
    $scope.person = person;
  };
  
  $scope.addPerson = function() {
    $scope.person = null;
    $scope.showAddPersonDialog = true;
  };
  
  $scope.closeDialog = function() {
    $scope.person = null;
    $scope.showAddPersonDialog = false;
  };
  
  $scope.findAccounts = function() {
    $http.get('api/accounts', {}).success(function(data) {
      $scope.accounts = data;
    });
  };
  
  $scope.findAll();
  $scope.findAccounts();
});

expensesApp.directive("modalShow", function ($parse) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      //Hide or show the modal
      scope.showModal = function (visible, elem) {
        if (!elem)
          elem = element;

        if (visible)
          $(elem).modal("show");                     
        else
          $(elem).modal("hide");
      }

      //Watch for changes to the modal-visible attribute
      scope.$watch(attrs.modalShow, function (newValue, oldValue) {
        scope.showModal(newValue, attrs.$$element);
      });

      //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
      $(element).bind("hide.bs.modal", function () {
        $parse(attrs.modalShow).assign(scope, false);
        if (!scope.$$phase && !scope.$root.$$phase)
          scope.$apply();
      });
    }
  };
});


expensesApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/transactions', {
        templateUrl: 'partials/transactions.html',
        controller: 'TransactionController'
      })
      .when('/year', {
        templateUrl: 'partials/year.html',
        controller: 'YearController'
      })
      .when('/categories', {
        templateUrl: 'partials/categories.html',
        controller: 'CategoryController'
      })
      .when('/household', {
        templateUrl: 'partials/household.html',
        controller: 'HouseholdController'
      })
      .otherwise({
        redirectTo: '/transactions'
      });
  }
]);
