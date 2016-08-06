(function() {
  var app;

  app = angular.module('appdsampleapp', ['ngRoute']);

  app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
          templateUrl : 'view/home.html',
          controller : 'AdminController'
        })
        .otherwise({
          redirectTo: '/'
        });

  });

  app.config([
    '$httpProvider', function($httpProvider) {
      return $httpProvider.interceptors.push([
        '$q', '$rootScope', function($q, $rootScope) {
          if ($rootScope.loaders == null) {
            $rootScope.loaders = 0;
          }
          return {
            request: function(request) {
              $rootScope.loaders++;
              return request;
            },
            requestError: function(error) {
              $rootScope.loaders--;
              if ($rootScope.loaders < 0) {
                $rootScope.loaders = 0;
              }
              return error;
            },
            response: function(response) {
              $rootScope.loaders--;
              if ($rootScope.loaders < 0) {
                $rootScope.loaders = 0;
              }
              return response;
            },
            responseError: function(error) {
              $rootScope.loaders--;
              if ($rootScope.loaders < 0) {
                $rootScope.loaders = 0;
              }
              return error;
            }
          };
        }
      ]);
    }
  ]);

  app.controller('AdminController', [
    '$scope', '$http', '$rootScope', '$timeout', function($scope, $http, $rootScope, $timeout) {
      var setupProductUpdate;

      //----------------------------------------
      // Properties
      //----------------------------------------
      $scope.products = [];
      $scope.ready = false;
      $scope.activeTabIndex = 0;

      $scope.slowRequest = false;
      $scope.delay = {
        request: 5
      };

      $scope.looping = false;
      $scope.recursive = {
        request: 25
      };

      $scope.newProduct = {
        newName: "",
        newStock: 0
      };
      $scope.loadingNew = false;

      $scope.raising = false;
      $scope.raisingJava = false;
      $scope.raisingSql = false;

      $scope.selectedProduct = null;

      if ($rootScope.exceptions == null) {
        $rootScope.exceptions = 0;
      }
      if ($rootScope.exceptionsJava == null) {
        $rootScope.exceptionsJava = 0;
      }
      if ($rootScope.exceptionsSql == null) {
        $rootScope.exceptionsSql = 0;
      }

      setupProductUpdate = function(product) {

        $scope.selectedProduct = product;
        $scope.selectedProduct.loading = false;
        $scope.selectedProduct.stock = parseInt(product.stock, 10);

        $scope.selectedProduct.save = function(decrement) {
          var useStock;
          if ($scope.selectedProduct.name === "" || !angular.isNumber($scope.selectedProduct.stock)) {
            return;
          }
          useStock = decrement ? $scope.selectedProduct.stock - 1 : $scope.selectedProduct.stock;
          return $http.get('/update', {
            method: 'GET',
            params: {
              id: $scope.selectedProduct.id,
              name: $scope.selectedProduct.name,
              stock: useStock < 0 ? 0 : useStock
            }
          }).success(function(returnProduct) {
            $scope.getProducts();
            $scope.selectedProduct.stock = parseInt(returnProduct.stock, 10);
          }.bind(this)).error(function() {
            alert('Unable to update the product.');
            return $scope.selectedProduct.loading = false;
          });
        };
        $scope.selectedProduct["delete"] = function() {
          return $http.get('/delete', {
            method: 'GET',
            params: {
              id: $scope.selectedProduct.id
            }
          }).success(function() {
            var lookup, results;
            $scope.selectedProduct.loading = false;
            results = [];
            for (lookup in $scope.products) {
              if (!$scope.products.hasOwnProperty(lookup)) {
                continue;
              }
              if ($scope.products[lookup].id === product.id) {
                $scope.products.splice(lookup, 1);
                break;
              } else {
                results.push(void 0);
              }
            }
            return results;
          }).error(function() {
            alert('Unable to delete the product.');
            return product.loading = false;
          });
        };
        return $scope.products.push(product);
      };

      //----------------------------------------
      // Functions
      //----------------------------------------

      $scope.getProducts = function() {
        $scope.products = [];
        $http.get('/products').success(function(data) {
          var product;
          for (product in data) {
            if (!data.hasOwnProperty(product)) {
              continue;
            }
            setupProductUpdate(data[product]);
          }

          return null;
        });
      };

      $scope.slowRequestGet = function() {
        $scope.slowRequest = true;
        return $http.get('/exceptions/slow', {
          params: {
            delay: $scope.delay.request
          }
        }).success(function() {
          return $scope.slowRequest = false;
        }).error(function() {
          return $scope.slowRequest = false;
        });
      };

      $scope.addNew = function() {
        if ($scope.newProduct.newName === "" || !angular.isNumber($scope.newProduct.newStock)) {
          return;
        }
        $scope.loadingNew = true;
        return $http.post('/add', {
          params: {
            name: $scope.newProduct.newName,
            stock: $scope.newProduct.newStock
          }
        }).success(function(data) {
          $scope.loadingNew = false;
          $scope.newProduct.newName = "";
          $scope.newProduct.newStock = 0;
          $scope.getProducts();
        }).error(function() {
          alert('Unable to add new product.');
          return $scope.loadingNew = false;
        });
      };


      //-------- Exceptions ----------------------

      $scope.getExceptions = function() {
        return $rootScope.exceptions;
      };

      $scope.raiseException = function() {
        $scope.raising = true;
        return $http.get('/exception', {
          method: 'GET'
        }).success(function(data) {
          $rootScope.exceptions++;
          return $scope.raising = false;
        }).error(function() {
          alert('Unable to raise exception.');
          return $scope.raising = false;
        });
      };

      $scope.getJavaExceptions = function() {
        return $rootScope.exceptionsJava;
      };

      $scope.raiseJavaException = function() {
        $scope.raisingJava = true;
        return $http.get('/exceptions/java', {
          method: 'GET'
        }).success(function(data) {
          $rootScope.exceptionsJava++;
          return $scope.raisingJava = false;
        }).error(function() {
          alert('Unable to raise exception.');
          return $scope.raisingJava = false;
        });
      };

      $scope.getSqlExceptions = function() {
        return $rootScope.exceptionsSql;
      };

      $scope.raiseSqlException = function() {
        $scope.raisingSql = true;
        return $http.get('/exceptions/sql', {
          method: 'GET'
        }).success(function(data) {
          $rootScope.exceptionsSql++;
          return $scope.raisingSql = false;
        }).error(function() {
          alert('Unable to raise exception.');
          return $scope.raisingSql = false;
        });
      };

      //-------- TABS -----------------------------

      $scope.isTabActive = function(tabIndex) {
        return $scope.activeTabIndex === tabIndex.toString();
      };

      $scope.tabActive = function(tabIndex) {
        if ($scope.isTabActive(tabIndex)) {
          return 'active';
        } else {
          return '';
        }
      };

      $scope.activateTab = function(tabIndex) {
        return $scope.activeTabIndex = tabIndex;
      };

      $scope.init = function () {
        $scope.getProducts();
        $scope.ready = true;
        $scope.activateTab(1);
      };

      $scope.init();

      return null;
    }
  ]);

  app.directive('adLoader', [
    '$rootScope', function($rootScope) {
      return {
        restrict: 'E',
        templateUrl: '/partials/loader.html',
        link: function() {
          if ($rootScope.loaders == null) {
            $rootScope.loaders = 0;
          }
          $rootScope.$on('$routeChangeStart', function() {
            return $rootScope.loaders++;
          });
          return $rootScope.$on('$routeChangeSuccess', function() {
            $rootScope.loaders--;
            if ($rootScope.loaders < 0) {
              return $rootScope.loaders = 0;
            }
          });
        }
      };
    }
  ]);

  app.directive('adProduct', function() {
    return {
      restrict: 'E',
      templateUrl: '/partials/product.html',
      scope: {
        product: '=',
        consumeProduct: '='
      }
    };
  });

}).call(this);
