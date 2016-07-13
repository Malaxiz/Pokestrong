angular.module('pokestrong')
.config(
	function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl: 'templates/pokemonlist.html'
		})
		.when('/pokemon/:pokemon', {
			templateUrl: 'templates/pokemon.html',
			controller: 'PokemonCtrl'
		})

		.otherwise({
			redirectTo: '/404'
		});
	}
);