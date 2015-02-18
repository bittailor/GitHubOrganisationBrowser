


var app = angular.module('gitHubOrgBrowserApp', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/organisation.html',
      controller: 'OrganisationCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});


app.controller('OrganisationCtrl', function ($scope, $http) {
  function ensure(parent,pathParts,i,leaf) {
    if(i >= pathParts.length){
      var link = 'https://github.com/' + $scope.organisationName + '/';
      if(pathParts.length > 0) {
        link = link + pathParts.join($scope.separator) + $scope.separator
      }
      link = link + leaf;
      parent.children.push({isFolder: false, name: leaf, link: link  });
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
    ensure(child, pathParts, i + 1, leaf);
  }

  function insert(parts) {
    ensure($scope.tree,parts.slice(0,-1),0,parts.slice(-1)[0]);
  }

  function fetch() {
    $http.get('https://api.github.com/orgs/' + $scope.organisationName + '/repos').
      success(function(data) {
        $scope.data = data;
        $scope.names = $.map(data, function(repository){
            return repository.name;
        });
        $scope.tree = {isFolder: true, name: $scope.organisationName, children: []};
        $.each($scope.names, function(i,name){
          insert(name.split($scope.separator));
        });
        $scope.current = $scope.tree;
      });
  }

  function browse(element) {
    $scope.current = element;
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

  $scope.organisationName = 'BtDraftOrganization';
  $scope.separator = '.';
  $scope.tree = {isFolder: true, name: '', children: []};
  $scope.current = $scope.tree;
  $scope.fetch = fetch;
  $scope.browse = browse;
  $scope.getPath = getPath;

});
