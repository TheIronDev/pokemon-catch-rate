App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

App.Router.map(function() {
	// TODO: Pokemon resource Route
});

App.IndexRoute = Ember.Route.extend({
	setupController: function(controller, indexModel) {
		controller.set('model', indexModel);
	}
});

App.IndexController = Ember.Controller.extend({
	selectedPokemonId: 1,
	selectedLevel: 1,
	levels: [1,2,3,4,5],
	selectedPokemon: function(selectedPokemonId) {

		var pokemonId = this.get('selectedPokemonId'),
			store = this.store,
			id = 1,
			max = App.Pokeball.FIXTURES.length;

		for (id,max; id<= max;id++) {
			store.update('pokeball', {
				id: id,
				pokemon: pokemonId
			});
		}
		return store.find('pokemon', this.get('selectedPokemonId'));
	}.property('selectedPokemonId'),
	pokemon: function() {
		return this.store.find('pokemon');
	}.property(),
	pokeballs: function() {
		return this.store.find('pokeball');
	}.property()
});

App.Pokemon = DS.Model.extend({
	name: DS.attr('string'),
	maxHP: DS.attr('string'),
	catchRate: DS.attr('number'),
	pokeball: DS.hasMany('pokeball')
});

App.Pokeball = DS.Model.extend({
	name: DS.attr('string'),
	rate: DS.attr('number'),
	pokemon: DS.belongsTo('pokemon')
});

App.Pokemon.reopenClass({
	FIXTURES : [
		{
			id: 1,
			name: 'Bublasaur',
			catchRate: 45,
			maxHP: 100
		},
		{
			id: 2,
			name: 'Ivysaur',
			catchRate: 45,
			maxHP: 100
		},
		{
			id: 3,
			name: 'Venasaur',
			catchRate: 45,
			maxHP: 100
		}
	]
});

App.Pokeball.reopenClass({
	FIXTURES : [
		{
			id: 1,
			name: 'PokeBall',
			rate: 1
		},
		{
			id: 2,
			name: 'Great Ball',
			rate: 1.5
		},
		{
			id: 3,
			name: 'Ultra Ball',
			rate: 2
		}
	]
});