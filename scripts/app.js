App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {

    return this.store.findAll('pokemon');
  }
});

App.Pokemon = DS.Model.extend({
  name: DS.attr('string'),
  maxHP: DS.attr('string'),
  currentHP: DS.attr('string')
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
    }
  ]
});