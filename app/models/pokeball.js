import Ember from 'ember';

var PokeballModel = Ember.Object.extend({
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
PokeballModel.reopenClass({
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


export default PokeballModel;
