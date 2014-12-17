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
  selectedPokemon: 2,
  selectedLevel: 1,
  levels: [1,2,3,4,5],
  pokemon: function() {
    return this.store.findAll('pokemon');
  }.property(),
  pokeballs: function() {
    return this.store.findAll('pokeball');
  }.property()
});

App.Pokemon = DS.Model.extend({
  name: DS.attr('string'),
  maxHP: DS.attr('string'),
  currentHP: DS.attr('string'),
  pokeball: DS.hasMany('pokeball', {async: true})
});

App.Pokeball = DS.Model.extend({
  name: DS.attr('string'),
  rate: DS.attr('number'),
  pokemon: DS.belongsTo('pokemon', {async: true})
});

App.Pokemon.reopenClass({
  FIXTURES : [
    {
      id: 1,
      name: 'Bublasaur',
      currentHP: 50,
      maxHP: 100
    },
    {
      id: 2,
      name: 'Ivysaur',
      currentHP: 90,
      maxHP: 100
    },
    {
      id: 3,
      name: 'Venasaur',
      currentHP: 1,
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