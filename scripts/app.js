App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

Ember.TextSupport.reopen({
	attributeBindings: ["style"]
})

App.Router.map(function() {
	// TODO: Pokemon resource Route
});

App.IndexRoute = Ember.Route.extend({
	model: function() {
		return Ember.RSVP.hash ({
			pokeballs: this.store.find('pokeball'),
			pokemon: this.store.find('pokemon'),
			status: this.store.find('status'),
			levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
				30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
				58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
				86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
		});
	}
});

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
	}.observes('selectedLevel')
});

App.Pokemon = DS.Model.extend({
	name: DS.attr('string'),
	baseHP: DS.attr('number'),
	level: DS.attr('number', {
		defaultValue: 1
	}),
	catchRate: DS.attr('number'),
	pokeball: DS.hasMany('pokeball'),
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

App.Pokeball = DS.Model.extend({
	name: DS.attr('string'),
	ballRate: DS.attr('number'),
	currentHPPercent: DS.attr('number', {
		defaultValue: 100
	}),
	pokemon: DS.belongsTo('pokemon'),
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
	}.property('rate', 'currentHPPercent', 'currentStatus', 'pokemon', 'pokemon.maxHP', 'pokemon.level')
});

App.Status = DS.Model.extend({
	name: DS.attr('string'),
	value: DS.attr('number')
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

App.Pokeball.reopenClass({
	FIXTURES : [
		{
			id: 1,
			name: 'PokeBall',
			ballRate: 1
		},
		{
			id: 2,
			name: 'Great Ball',
			ballRate: 1.5
		},
		{
			id: 3,
			name: 'Ultra Ball',
			ballRate: 2
		},
		{
			id: 4,
			name: 'Safari Ball',
			ballRate: 1.5
		},
		{
			id: 5,
			name: 'Master Ball',
			ballRate: 255
		},
		{
			id: 6,
			name: 'Level Ball',
			ballRate: 255
		},
		{
			id: 7,
			name: 'Lure Ball',
			ballRate: 255
		},
		{
			id: 8,
			name: 'Moon Ball',
			ballRate: 255
		},
		{
			id: 9,
			name: 'Friend Ball',
			ballRate: 255
		},
		{
			id: 10,
			name: 'Love Ball',
			ballRate: 255
		},
		{
			id: 11,
			name: 'Heavy Ball',
			ballRate: 255
		},
		{
			id: 12,
			name: 'Fast Ball',
			ballRate: 255
		},
		{
			id: 13,
			name: 'Sport Ball',
			ballRate: 255
		},
		{
			id: 14,
			name: 'Premier Ball',
			ballRate: 255
		},
		{
			id: 15,
			name: 'Repeat Ball',
			ballRate: 255
		},
		{
			id: 16,
			name: 'Timer Ball',
			ballRate: 255
		},
		{
			id: 17,
			name: 'Nest Ball',
			ballRate: 255
		},
		{
			id: 18,
			name: 'Net Ball',
			ballRate: 255
		},
		{
			id: 19,
			name: 'Dive Ball',
			ballRate: 255
		},
		{
			id: 20,
			name: 'Luxury Ball',
			ballRate: 255
		},
		{
			id: 21,
			name: 'Heal Ball',
			ballRate: 255
		},
		{
			id: 22,
			name: 'Quick Ball',
			ballRate: 255
		},
		{
			id: 23,
			name: 'Dusk Ball',
			ballRate: 255
		},
		{
			id: 24,
			name: 'Cherish Ball',
			ballRate: 255
		},
		{
			id: 25,
			name: 'Park Ball',
			ballRate: 255
		}
	]
});

App.Status.reopenClass({
	FIXTURES: [
		{
			id: 1,
			name: 'None',
			value: 1
		},
		{
			id: 2,
			name: 'Sleep',
			value: 2.5
		},
		{
			id: 3,
			name: 'Frozen',
			value: 2.5
		},
		{
			id: 4,
			name: 'Paralyzed',
			value: 1.5
		},
		{
			id: 5,
			name: 'Poison',
			value: 1.5
		},
		{
			id: 6,
			name: 'Burn',
			value: 1.5
		}
	]
});

// 2 for sleep and freeze, 1.5 for paralyze, poison, or burn, and 1 otherwise