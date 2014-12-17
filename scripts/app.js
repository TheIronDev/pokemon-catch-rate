App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

App.Router.map(function() {
  // put your routes here
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
    return this.store.find('pokemon', this.get('selectedPokemonId'));
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
  maxHP: DS.attr('string')
});

App.Pokeball = DS.Model.extend({
  name: DS.attr('string'),
  rate: DS.attr('number')
});

App.Pokemon.reopenClass({
  FIXTURES : [
    {
      id: 1,
      name: 'Bublasaur',
      maxHP: 100
    },
    {
      id: 2,
      name: 'Ivysaur',
      maxHP: 100
    },
    {
      id: 3,
      name: 'Venasaur',
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