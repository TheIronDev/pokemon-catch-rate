App = Ember.Application.create();
App.ApplicationAdapter = DS.RESTAdapter.extend({});
var dataNamespace = (window.location.pathname + 'data').substring(1) || 'data';

// We are reopening the TextSupport class to add styling
Ember.TextSupport.reopen({
	attributeBindings: ["style"]
});

// Currently we are doing nothing with the router, but we will be adding a pokemon route later on
App.Router.map(function() {
	// TODO: Pokemon resource Route
});

// The IndexRoute maps to / or /#index
App.IndexRoute = Ember.Route.extend({
	model: function() {
		return this.store.find('pokemon');
	}
});

/**
 * The IndexController's role is to gather the data from the indexRoute's model to paint the index template.
 * IndexController automagically gets binded to the indexRoute
 *
 * Additionally, it adds a view "view-level" attributes to maintain state, while also adding observers to bind the
 * relationship between the controller's state and the models.
 */
App.IndexController = Ember.Controller.extend({
	levels: function(){
	  return App.Levels; 
	}.property(),
	pokeballs: function(){
	  return App.Pokeball.all()
	}.property(),
	status: function(){
	  return App.Status.all();
	}.property(),
	currentHPPercent: 100,
	battleTurnsCount: 1,
	genderList: ['♂', '♀'],
	hasLoadedData: false,
	pokemonSprite: function() {
		return '/pokemon-catch-rate/images/pokemon/' +this.get('selectedWildPokemon.id') + '.png';
	}.property('selectedWildPokemon.id'),
	currentHPPercentString: function() {
		var currentHPPercent = parseInt(this.get('currentHPPercent'), 10);
		return (currentHPPercent === 1 ? 1 : currentHPPercent + '%');
	}.property('currentHPPercent'),
	currentHPRangeBackground: function() {
		var currentHPPercent = parseInt(this.get('currentHPPercent'), 10),
			currentHPPercentEdge = (currentHPPercent === 100) ? 100 : currentHPPercent + 1,
			color = 'green';

		if (currentHPPercent < 20) {
			color = 'red';
		} else if (currentHPPercent < 50) {
			color = 'yellow';
		}

		return 'background: linear-gradient(to right, '+ color +' 0%, '+ color +' '+currentHPPercent+'%, transparent ' + currentHPPercentEdge + '%, transparent 100%);';
	}.property('currentHPPercent'),

	selectedWildPokemonObserver: function() {
		var selectedWildPokemon = this.get('selectedWildPokemon'),
			hasBeenCaughtBefore = selectedWildPokemon.get('hasBeenCaughtBefore'),
			pokeballs = this.get('pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set('selectedWildPokemon', selectedWildPokemon);
		});

		this.set('hasBeenCaughtBefore', hasBeenCaughtBefore);

	}.observes('selectedWildPokemon'),
	selectedWildPokemonLevelObserver: function() {
		var selectedWildPokemonLevel = this.get('selectedWildPokemonLevel') || 1,
			pokemonList = this.get('model');

		pokemonList.forEach( function( pokemon ) {
			pokemon.set('level', selectedWildPokemonLevel);
		});
	}.observes('selectedWildPokemonLevel'),

	selectedWildPokemonHasBeenCaught: function() {

		var hasBeenCaughtBefore = this.get('hasBeenCaughtBefore'),
			selectedWildPokemon = this.get('selectedWildPokemon');

		if (selectedWildPokemon) {
			selectedWildPokemon.set('hasBeenCaughtBefore', hasBeenCaughtBefore);
		}

	}.observes('hasBeenCaughtBefore'),

	pokeballObservers: function(controller, changedAttribute) {
		var changedAttributeValue = this.get(changedAttribute),
			pokeballs = this.get('pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set(changedAttribute, changedAttributeValue);
		});
	}.observes('battleTurnsCount', 'selectedWildPokemonGender', 'selectedTrainerPokemonGender', 'isUnderwater',
		'isSurfing', 'isFishing', 'isDusk', 'selectedTrainerPokemonLevel', 'selectedTrainerPokemon', 'currentHPPercent',
		'currentStatus')
});

// Components

/**
 * BattleAttributeCheckboxComponent binds to {{battle-attribute-checkbox }}, which is bound to:
 *  script type="text/x-handlebars" id="components/battle-attribute-checkbox"
 */
App.BattleAttributeCheckboxComponent = Ember.Component.extend({
	classNames: ['battle-attribute']
});

// Views
App.PokeballView = Ember.View.extend({
	templateName: 'pokeball',
	tagName: 'li',
	classNames: ['pokeball'],

	oldCatchRate: 0,

	/**
	 * If the catch rate changes, lets apply a minor animation
	 */
	catchRateObserver: function(){

		var catchRate = parseFloat(this.get('catchRate')),
			oldCatchRate = parseFloat(this.get('oldCatchRate')),
			$this = $('#'+this.get('elementId'));

		if (catchRate > oldCatchRate) {
			$this.addClass('hasIncreased');
		} else {
			$this.addClass('hasDecreased');
		}

		$this.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
			$this.removeClass('hasIncreased hasDecreased');
		});

		this.set('oldCatchRate', catchRate)
	}.observes('catchRate')
});

// Model Definitions

// Pokeball Model
App.Pokeball = Ember.Object.extend({
	name: '',
	ballRate: 1,
	spriteClass: function() {
		return 'pokeball-icon pokeball-icon-' + this.get('id');
	}.property('id'),
	currentHPPercent: 100,
	pokemonWeightModifier: 0,
	isDusk: false,
	isFishing: false,
	isSurfing: false,
	isUnderwater: false,
	battleTurnsCount: 1,
	catchRate: function() {

		var pokemon = this.get('selectedWildPokemon');

		if (!pokemon) {
			return '';
		}

		var hpMax = pokemon.get('maxHP'),
			hpCurrentPercent = parseInt(this.get('currentHPPercent'), 10),
			hpPercent = (hpMax * hpCurrentPercent / 100),
			hpCurrent = ((hpPercent < 1) ? 1 : hpPercent),
			currentStatus = this.get('currentStatus'),
			statusRate = (currentStatus && currentStatus.get('value')) || 1,
			pokemonCatchRate = pokemon.get('catchRate') + this.get('pokemonWeightModifier'),
			ballRate = this.get('ballRate');

		var numerator = ((3 * hpMax - 2 * hpCurrent) * pokemonCatchRate * ballRate),
			denominator = ( 3 * hpMax),
			shakeRate = (numerator/denominator) * statusRate,
			catchProbability;

		if (shakeRate >= 255) {
			return 100;
		}
		catchProbability = (((65536 / (255/shakeRate)^0.1875) / 65536));

		return (catchProbability * 100).toFixed(2);
	}.property('ballRate', 'currentHPPercent', 'currentStatus', 'selectedWildPokemon', 'selectedWildPokemon.maxHP')
});
App.Pokeball.reopenClass({
	all: function () {

		var pokeball = this.create({id: 1, name: 'PokeBall'}),
			greatball = this.create({id: 2, name: 'Great Ball', ballRate: 1.5}),
			ultraball = this.create({id: 3,name: 'Ultra Ball',ballRate: 2}),
			masterball = this.create({id: 4,name: 'Master Ball',ballRate: 255}),
			safariball = this.create({id: 5,name: 'Safari Ball',ballRate: 1.5}),
			levelball = this.createWithMixins({
				id: 6,
				name: 'Level Ball',
				ballRate: function() {
					var trainerPokemonLevel = this.get('selectedTrainerPokemonLevel') || 1,
						wildPokemonLevel = this.get('selectedWildPokemon.level') || 1,
						levelDifference = trainerPokemonLevel / wildPokemonLevel;

					if (levelDifference >= 4) {
						return 8;
					} else if (levelDifference >= 2) {
						return 4;
					} else if (levelDifference > 1) {
						return 2;
					}

					return 1;
				}.property('selectedTrainerPokemonLevel', 'selectedWildPokemon.level')
			}),
			lureball = this.createWithMixins({
				id: 7,
				name: 'Lure Ball',
				ballRate: function() {
					var isFishing = this.get('isFishing');
					return isFishing ? 3 : 1;
				}.property('isFishing')
			}),
			moonball = this.createWithMixins({
				id: 8,
				name: 'Moon Ball',
				ballRate: function() {
					var isMoonstone = this.get('selectedWildPokemon.moonstone');
					return (isMoonstone) ? 4 : 1;
				}.property('selectedWildPokemon.moonstone')
			}),
			friendball = this.create({id: 9,name: 'Friend Ball'}),
			loveball = this.createWithMixins({
				id: 10,
				name: 'Love Ball',
				ballRate: function() {
					var trainerPokemonId = this.get('selectedTrainerPokemon.id'),
						wildPokemonId = this.get('selectedWildPokemon.id'),
						trainerPokemonGender = this.get('selectedTrainerPokemonGender'),
						wildPokemonGender = this.get('selectedWildPokemonGender');

					if (trainerPokemonId === wildPokemonId &&
						trainerPokemonGender !== wildPokemonGender) {
						return 8;
					}
					return 1;

				}.property('selectedTrainerPokemon', 'selectedWildPokemon', 'selectedTrainerPokemonGender', 'selectedWildPokemonGender')
			}),
			heavyball = this.createWithMixins({
				id: 11,
				name: 'Heavy Ball',
				pokemonWeightModifier: function() {
					var weight = this.get('selectedWildPokemon.weight');

					if (weight > 903) {
						return 40;
					} else if (weight >  677.3) {
						return 30;
					} else if (weight > 451.1) {
						return 20;
					}

					return -20;
				}.property('selectedWildPokemon.weight')
			}),
			fastball = this.createWithMixins({
				id: 12,
				name: 'Fast Ball',
				ballRate: function() {
					var baseSpeed = this.get('selectedWildPokemon.baseSpeed');
					return (baseSpeed > 100) ? 4 : 1;
				}.property('selectedWildPokemon.baseSpeed')
			}),
			sportball = this.create({id: 13,name: 'Sport Ball', ballRate: 1.5}),
			premierball = this.create({id: 14,name: 'Premier Ball'}),
			repeatball = this.createWithMixins({
				id: 15,
				name: 'Repeat Ball',
				ballRate: function() {
					var hasBeenCaughtBefore = this.get('selectedWildPokemon.hasBeenCaughtBefore');
					return hasBeenCaughtBefore ? 3 : 1;
				}.property('selectedWildPokemon.hasBeenCaughtBefore')
			}),
			timerball = this.createWithMixins({
				id: 16,
				name: 'Timer Ball',
				ballRate: function() {

					var battleTurnsCount = this.get('battleTurnsCount'),
						newRate = (1 + (battleTurnsCount * 1229/4096) );

					return newRate < 4 ? newRate : 4;
				}.property('battleTurnsCount')
			}),
			nestball = this.createWithMixins({
				id: 17,
				name: 'Nest Ball',
				ballRate: function() {
					var selectedWildPokemonLevel = this.get('selectedWildPokemon.level'),
						newRate = ((41 - selectedWildPokemonLevel) / 10);

					return newRate > 1 ? newRate : 1;
				}.property('selectedWildPokemon.level')
			}),
			netball = this.createWithMixins({
				id: 18,
				name: 'Net Ball',
				ballRate: function() {
					var selectedWildPokemonTypes = this.get('selectedWildPokemon.types');

					if (selectedWildPokemonTypes.contains('water') || selectedWildPokemonTypes.contains('bug')) {
						return 3;
					}
					return 1;
				}.property('selectedWildPokemon.types')
			}),
			diveball = this.createWithMixins({
				id: 19,
				name: 'Dive Ball',
				ballRate: function() {
					var isFishing = this.get('isFishing'),
						isSurfing = this.get('isSurfing'),
						isUnderwater = this.get('isUnderwater');

					if (isFishing || isSurfing || isUnderwater) {
						return 3.5;
					}

					return 1;

				}.property('isFishing', 'isSurfing', 'isUnderwater')
			}),
			luxuryball = this.create({id: 20,name: 'Luxury Ball'}),
			healball = this.create({id: 21,name: 'Heal Ball'}),
			quickball = this.createWithMixins({
				id: 22,
				name: 'Quick Ball',
				ballRate: function() {

					var battleTurnsCount = parseInt(this.get('battleTurnsCount'), 10);
					return (battleTurnsCount === 1) ? 4 : 1;
				}.property('battleTurnsCount')
			}),
			duskball = this.createWithMixins({
				id: 23,
				name: 'Dusk Ball',
				ballRate: function() {
					var isDusk = this.get('isDusk');
					return isDusk ? 3.5 : 1;
				}.property('isDusk')
			});

		return [
			pokeball, greatball, ultraball, masterball, safariball, levelball, lureball, moonball, friendball,
			loveball, heavyball, fastball, sportball, premierball, repeatball, timerball, nestball, netball, diveball,
			luxuryball, healball, quickball, duskball
		];

	}
});

// Status Model
App.Status = Ember.Object.extend({
	name: '',
	value: 1
});
App.Status.reopenClass({
	all: function() {
		// Return a map of this.creates()
		return [
			{id: 1, name: 'None', value: 1},
			{id: 2, name: 'Sleep', value: 2.5},
			{id: 3, name: 'Frozen', value: 2.5},
			{id: 4, name: 'Paralyzed', value: 1.5},
			{id: 5, name: 'Poison', value: 1.5},
			{id: 6, name: 'Burn', value: 1.5}
		].map(function(status){
				return this.create(status)
			}, this);
	}
});

// Pokemon Models (will need some heavy rework soon)
App.Pokemon = DS.Model.extend({
	name: DS.attr('string'),
	baseHP: DS.attr('number'),
	baseSpeed: DS.attr('number'),
	weight: DS.attr('number'),
	types: DS.attr(),
	moonstone: DS.attr('boolean'),
	hasBeenCaughtBefore: false,
	level: DS.attr('number', {
		defaultValue: 1
	}),
	catchRate: DS.attr('number'),
	maxHP: function() {

		var baseHP = this.get('baseHP'),
			level = this.get('level');

		// Because this is against a pokemon in the wild, IV and EV stats are 0
		// and therefore not factored into the equation
		var numerator = ((2 * baseHP) + 100) * level,
			denominator = 100;

		return ~~(numerator / denominator + 10);
	}.property('baseHP', 'level')
});
App.PokemonAdapter = DS.RESTAdapter.extend({
	suffix: '.json',
	namespace: dataNamespace,

	pathForType: function(type) {
		return this._super(type) + this.get('suffix');
	}
});

// Globals are wrong, but I felt bad defining this giant array within the IndexRoute.
App.Levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
	30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
	58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
	86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];

