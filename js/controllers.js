angular.module('pokestrong')
.controller('MainCtrl',
	function($scope, $rootScope, $firebaseArray, $firebaseObject, $ionicPopup, $location, $window) {

		$scope.typeDebug = false;

		$scope.title = 'Pokéstrong';
		$scope.version = {};
		$scope.version.number = '0.5';
		$scope.isOldVersion = false;
		$scope.realVersion = '';
		$scope.ready = false;

		var pokemonsRef = new Firebase('https://pokestrong.firebaseio.com/pokemons');
		$scope.pokemons = $firebaseArray(pokemonsRef);
		$rootScope.pokemonsObj = $firebaseObject(pokemonsRef);

		var colorRef = new Firebase('https://pokestrong.firebaseio.com/typecolors');
		$scope.colors = $firebaseObject(colorRef);
		$scope.colorsList = $firebaseArray(colorRef);

		var counterRef = new Firebase('https://pokestrong.firebaseio.com/counters');
		$scope.counters = $firebaseObject(counterRef);

		var versionRef = new Firebase('https://pokestrong.firebaseio.com/version');
		$scope.realVersionObj = $firebaseObject(versionRef);
		$scope.realVersionObj.$loaded(function() {
			$scope.realVersion = $scope.realVersionObj.$value;
			console.log($scope.realVersion);
			var comparison = $scope.versionCompare($scope.realVersion, $scope.version.number);
			if(comparison == 1) {
				console.log('This is an old version.');
				$scope.isOldVersion = true;
			}
		});

		$scope.counters.$loaded().then(function() {
			$scope.ready = true;
		});

		$scope.go = function(location) {
			$location.path(location);
		};

		$scope.goBack = function() {
			$window.history.back();
		}

		$scope.showImage = false;
		$scope.toggleImage = function() {
			$scope.showImage = !$scope.showImage;
		};
		$scope.hideImage = function() {
			$scope.showImage = false;
		};

		$scope.versionCompare = function(a, b) {
			a = a + '';
			b = b + '';

		    if (a === b) {
		       return 0;
		    }
		    var a_components = a.split(".");
		    var b_components = b.split(".");
		    var len = Math.min(a_components.length, b_components.length);

		    for (var i = 0; i < len; i++) {
		        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
		            return 1;
		        }
		        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
		            return -1;
		        }
		    }
		    if (a_components.length > b_components.length) {
		        return 1;
		    }
		    if (a_components.length < b_components.length) {
		        return -1;
		    }
		    return 0;
		};

		$scope.infoPopup = function() {
			$ionicPopup.alert({
				templateUrl: 'templates/info.html',
				title: 'App Info',
				scope: $scope
			});
		};

		$scope.openLink = function(link) {
			console.log('here');
			window.open(encodeURI(link), '_system', 'location=yes');
			console.log('here2');
			return false;
		};

		$scope.textWhite = function(color) {
			color = String(color)
			return !(parseInt(color.replace('#', ''), 16) > 0xffffff / 2);
		};

		$scope.color = function(score, max, min) {
			// max score is green, half is yellow, and min is red
			range = max - min;
			score = score - min;
			factor = 255 / range;

			green = Math.round(score * factor);
			red = Math.round((range - score) * factor);

			toReturn = '#' + red.toString(16) + green.toString(16) + '00';
			return toReturn;
		};
	}
)
.controller('ListCtrl', 
	function($scope, $rootScope) {
		$scope.pokemonListActive = true;


	}
)
.controller('TypeCtrl',
	function($scope, $rootScope, $routeParams) {
		$scope.typeName = $routeParams.type;
		$scope.isStrengths = false;

	}
)
.controller('PokemonCtrl',
	function($scope, $rootScope, $routeParams, $firebaseObject) {
		$scope.pokemonName = $routeParams.pokemon;
		$scope.isStrengths = false;
		
		$scope.pokemonObj = $rootScope.pokemonsObj[$scope.pokemonName];
	}
)
.filter('handleEmptyType', function() {
	return function(input, attributes) {
		if (!angular.isObject(input)) return input;

		for(var i = 0; i < input.length; i++) {
			input[i].type1color = input[i].type1;
			input[i].type2color = input[i].type2;
			if(!input[i].type2) {
				input[i].type2color = 'Empty';
			}
		}

		return input;
	};
})
.filter('filterCounters', function() {
	return function(input, target, scope, ready, attacking) {
		// if attacking, reverse the score calculation

		if(!angular.isObject(input)) return input;
		if(!ready) return [];

		scope = scope.$parent.$parent;
		counters = scope.counters;
		var points = {'NoEffect': -2, 'NotEffective': -1, 'Effective': 0, 'SuperEffective': 1};
		var pointsReverse = {'NoEffect': 2, 'NotEffective': 1, 'Effective': 0, 'SuperEffective': -1}

		for(var i = 0; i < input.length; i++) {
			var strength = 0;

			targetType1 = target.type1;
			targetType2 = target.type2;
			inputType1 = input[i].type1;
			inputType2 = input[i].type2;

			inputSecond = true;
			targetSecond = true;
			if(!inputType2) {
				inputSecond = false;
			}
			if(!targetType2) {
				targetSecond = false;
			}

			if(inputType1 == 'Empty' || targetType1 == 'Empty') {
				continue;
			}

			score1 = 0;
			score2 = 0;
			score3 = 0;
			score4 = 0;

			if(!attacking) {
				score1 = points[counters[targetType1][inputType1]];
				if(inputSecond) {
					score2 = points[counters[targetType1][inputType2]];
				}
				if(targetSecond) {
					score3 = points[counters[targetType2][inputType1]];
				}
				if(inputSecond && targetSecond) {
					score4 = points[counters[targetType2][inputType2]];
				}
			} else {
				score1 = pointsReverse[counters[inputType1][targetType1]];
				if(inputSecond) {
					score2 = pointsReverse[counters[inputType2][targetType1]];
				}
				if(targetSecond) {
					score3 = pointsReverse[counters[inputType1][targetType2]];
				}
				if(inputSecond && targetSecond) {
					score4 = pointsReverse[counters[inputType2][targetType2]];
				}
			}
			

			input[i].type1Strong = false;
			input[i].type2Strong = false;
			input[i].type1Weak = false;
			input[i].type2Weak = false;
			if(score1 > 0 || score3 > 0) {
				input[i].type1Strong = true;
			}
			if(score2 > 0 || score4 > 0) {
				input[i].type2Strong = true;
			}
			if(score1 < 0 || score3 < 0) {
				input[i].type1Weak = true;
			}
			if(score2 < 0 || score4 < 0) {
				input[i].type2Weak = true;
			}

			strength = score1 + score2 + score3 + score4;
			input[i].strength = strength;
		}

		return input;
	}
})
.filter('typesToPokemon', function() {
	return function(input) {
		for(var i = 0; i < input.length; i++) {
			input[i]['type1'] = input[i]['$id']
		}

		return input;
	}
})

