import Ember from 'ember';
import Pokeball from '../models/pokeball';
import Status from '../models/status';
import ENV from 'pokemon-catch-rate/config/environment';

export default Ember.Controller.extend({
  levels: function(){
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
      58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,
      86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
  }.property(),
  pokeballs: function(){
    return Pokeball.all();
  }.property(),
  status: function(){
    return Status.all();
  }.property(),
  currentHPPercent: 100,
  battleTurnsCount: 1,
  genderList: ['♂', '♀'],
  hasLoadedData: false,
  pokemonSprite: function() {
    if (this.get('selectedWildPokemon.id')) {
      return ENV.baseURL + 'assets/images/pokemon/' +this.get('selectedWildPokemon.id') + '.png';
    }
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
