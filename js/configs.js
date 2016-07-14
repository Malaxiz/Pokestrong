angular.module('pokestrong')
.config(
	function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'templates/pokemonlist.html',
			controller: 'ListCtrl'
		})
		.when('/pokemon/:pokemon', {
			templateUrl: 'templates/pokemon.html',
			controller: 'PokemonCtrl'
		})
		.when('/type/:type', {
			templateUrl: 'templates/type.html',
			controller: 'TypeCtrl'
		})

		.otherwise({
			redirectTo: '/'
		});
	}
);