


var app = angular.module('gitHubOrgBrowserApp', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/main.html',
      controller: 'MainCtrl'
    })
    .when('/browse', {
      templateUrl: 'app/views/organisation.html',
      controller: 'OrganisationCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.controller('MainCtrl', function ($scope, $location, $routeParams) {
  $scope.organisationName = $routeParams.org || 'BtDraftOrganization';
  $scope.separator = $routeParams.sep ||  '.';
  $scope.browse = browse;


  function browse() {
    $location.path('/browse').search({org: $scope.organisationName, sep: $scope.separator});
  }

});


app.controller('OrganisationCtrl', function ($scope, $http, $location, $routeParams) {
  function ensure(parent,pathParts,i,repository) {
    if(i >= (pathParts.length - 1) ){
      var link = 'https://github.com/' + $scope.organisationName + '/' + pathParts.join($scope.separator);
      parent.children.push({isFolder: false, name: pathParts[i], link: link, repository: repository });
      return;
    }
    var children = $.grep(parent.children, function(child){ return child.isFolder && child.name === pathParts[i];});
    var child;
    if (children.length === 0) {
      child = {isFolder: true, name: pathParts[i], parent: parent, children: []};
      parent.children.push(child);
    } else {
      child = children[0];
    }
    ensure(child, pathParts, i + 1, repository);
  }

  function insert(parts,repository) {
    ensure($scope.tree,parts,0,repository);
  }

  function fetch() {
    $http.get('https://api.github.com/orgs/' + $scope.organisationName + '/repos').
      success(function(data) {
        $scope.data = data;
        $scope.names = $.map(data, function(repository){
            return repository.name;
        });
        $scope.tree = {isFolder: true, name: $scope.organisationName, children: []};
        $.each(data, function(i,repository){
          insert(repository.name.split($scope.separator),repository);
        });
        $scope.current = $scope.tree;
      }).
      error(function(data, status) {
          $scope.error = data || "Request failed";
          $scope.status = status;
      });
  }

  function browse(element) {
    $scope.current = element;
  }

  function home() {
    $location.path('/')
  }

  function getPath(element) {
    var path = [];
    path.push(element);
    while(element.parent) {
      path.push(element.parent);
      element = element.parent;
    }
    return path.reverse();
  }

  $scope.organisationName = $routeParams.org;
  $scope.separator = $routeParams.sep;
  $scope.tree = {isFolder: true, name: '', children: []};
  $scope.current = $scope.tree;
  $scope.browse = browse;
  $scope.home = home;
  $scope.getPath = getPath;

  fetch();

});
