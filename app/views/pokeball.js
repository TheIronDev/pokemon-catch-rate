import Ember from 'ember';
import ENV from 'pokemon-catch-rate/config/environment';

export default Ember.View.extend({
  templateName: 'pokeball',
  tagName: 'li',
  classNames: ['pokeball'],
  spriteStyle: function(){
    var spriteUrl = ENV.baseURL + 'assets/images/pokeballs.png';
    return 'background: url(' + spriteUrl + ') no-repeat;background-size: 15em;';
  }.property(),

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
