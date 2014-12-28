App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

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

		/**
		 * The original implementation used DS.FixtureAdapter to fetch the data. This was not the correct approach,
		 * as the DS.FixtureAdapter was meant to represent what would/should be a persistance record.
		 */
		var store = this.store;

		/**
		 * Ember is very promise driven, and comes with RSVP as a helper method.  What this really says is:
		 * "Once I have fetched all of these promises, return a hash of everything". Once we remove the this.store,
		 * we will no longer need RSVP.hash, but its useful to know about.
		 */
		return Ember.RSVP.hash ({
			pokeballs: App.Pokeball.all(),
			pokemon: store.find('pokemon'),
			status: App.Status.all(),
			levels: App.Levels
		});
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
	currentHPPercent: 100,
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
	currentStatusObserver: function() {
		var currentStatus = this.get('currentStatus'),
			pokeballs = this.get('model.pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set('currentStatus', currentStatus);
		});
	}.observes('currentStatus'),
	currentHPPercentObserver: function(){
		var hpPercent = this.get('currentHPPercent'),
			pokeballs = this.get('model.pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set('currentHPPercent', hpPercent);
		});

	}.observes('currentHPPercent'),
	selectedPokemonObserver: function() {
		var thePokemonToSet = this.get('selectedPokemon'),
			pokeballs = this.get('model.pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set('pokemon', thePokemonToSet);
		});

	}.observes('selectedPokemon'),
	selectedLevelObserver: function() {
		var selectedLevel = this.get('selectedLevel') || 1,
			pokemonList = this.get('model.pokemon');

		pokemonList.forEach( function( pokemon ) {
			pokemon.set('level', selectedLevel);
		});
	}.observes('selectedLevel'),

	isCaveObserver: function() {

		var isCave = this.get('isCave'),
			pokeballs = this.get('model.pokeballs');

		pokeballs.forEach( function( pokeball ) {
			pokeball.set('isCave', isCave);
		});

	}.observes('isCave')
});

// Components

/**
 * BattleAttributeCheckboxComponent binds to {{battle-attribute-checkbox }}, which is bound to:
 *  script type="text/x-handlebars" id="components/battle-attribute-checkbox"
 */
App.BattleAttributeCheckboxComponent = Ember.Component.extend({});

// Model Definitions

// Pokeball Model
App.Pokeball = Ember.Object.extend({
	name: '',
	ballRate: 1,
	currentHPPercent: 100,
	isCave: false,
	catchRate: function() {

		var pokemon = this.get('pokemon');

		if (!pokemon) {
			return '';
		}

		var hpMax = pokemon.get('maxHP'),
			hpPercent = parseInt(this.get('currentHPPercent'), 10),
			hpCurrent = ((hpPercent === 1) ? 1 : hpMax * hpPercent / 100),
			currentStatus = this.get('currentStatus'),
			statusRate = (currentStatus && currentStatus.get('value')) || 1,
			pokemonCatchRate = pokemon.get('catchRate'),
			ballRate = this.get('ballRate');

		var numerator = ((3 * hpMax - 2 * hpCurrent) * pokemonCatchRate * ballRate),
			denominator = ( 3 * hpMax),
			shakeRate = (numerator/denominator) * statusRate,
			catchProbability;

		shakeRate = shakeRate < 255 ? shakeRate : 255;
		catchProbability = (((65536 / (255/shakeRate)^0.1875) / 65536));

		return (catchProbability * 100).toFixed(2);
	}.property('ballRate', 'currentHPPercent', 'currentStatus', 'pokemon', 'pokemon.maxHP', 'pokemon.level')
});
App.Pokeball.reopenClass({
	all: function () {

		var pokeball = this.create({id: 1, name: 'PokeBall'}),
			greatball = this.create({id: 2, name: 'Great Ball', ballRate: 1.5}),
			ultraball = this.create({
				id: 3,
				name: 'Ultra Ball',
				ballRate: 2
			}),
			safariball = this.create({
				id: 4,
				name: 'Safari Ball',
				ballRate: 1.5
			}),
			masterball = this.create({
				id: 5,
				name: 'Master Ball',
				ballRate: 255
			}),
			levelball = this.create({
				id: 6,
				name: 'Level Ball'
			}),
			lureball = this.create({
				id: 7,
				name: 'Lure Ball'
			}),
			moonball = this.create({
				id: 8,
				name: 'Moon Ball'
			}),
			friendball = this.create({
				id: 9,
				name: 'Friend Ball'
			}),
			loveball = this.create({
				id: 10,
				name: 'Love Ball'
			}),
			heavyball = this.create({
				id: 11,
				name: 'Heavy Ball'
			}),
			fastball = this.create({
				id: 12,
				name: 'Fast Ball'
			}),
			sportball = this.create({
				id: 13,
				name: 'Sport Ball'
			}),
			premierball = this.create({
				id: 14,
				name: 'Premier Ball'
			}),
			repeatball = this.create({
				id: 15,
				name: 'Repeat Ball'
			}),
			timerball = this.create({
				id: 16,
				name: 'Timer Ball'
			}),
			nestball = this.create({
				id: 17,
				name: 'Nest Ball'
			}),
			netball = this.create({
				id: 18,
				name: 'Net Ball'
			}),
			diveball = this.create({
				id: 19,
				name: 'Dive Ball'
			}),
			luxuryball = this.create({
				id: 20,
				name: 'Luxury Ball'
			}),
			healball = this.create({
				id: 21,
				name: 'Heal Ball'
			}),
			quickball = this.create({
				id: 22,
				name: 'Quick Ball'
			}),
			duskball = this.createWithMixins({
				id: 23,
				name: 'Dusk Ball',
				ballRate: function() {
					var isCave = this.get('isCave');
					return isCave ? 3.5 : 1;
				}.property('isCave')
			}),
			cherishball = this.create({
				id: 24,
				name: 'Cherish Ball'
			}),
			parkball  = this.create({
				id: 25,
				name: 'Park Ball'
			});

		return [
			pokeball, greatball, ultraball, safariball, masterball, levelball, lureball, moonball, friendball, loveball,
			heavyball, fastball, sportball, premierball, repeatball, timerball, nestball, netball, diveball,
			luxuryball, healball, quickball, duskball, cherishball, parkball
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
App.Pokemon.reopenClass({
	FIXTURES : [
		{
			id: 1,
			name: 'Bulbasaur',
			catchRate: 45,
			baseHP: 45
		},
		{
			id: 2,
			name: 'Ivysaur',
			catchRate: 45,
			baseHP: 60
		},
		{
			id: 3,
			name: 'Venasaur',
			catchRate: 45,
			baseHP: 80
		},
		{
			id: 19,
			name: 'Rattata',
			catchRate: 255,
			baseHP: 30
		},
		{
			id: 150,
			name: 'Mewtwo',
			catchRate: 3,
			baseHP: 106
		}
	]
});

// Globals are wrong, but I felt bad defining this giant array within the IndexRoute.
App.Levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
	30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
	58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
	86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];