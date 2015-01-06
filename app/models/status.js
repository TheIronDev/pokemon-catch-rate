import Ember from 'ember';

var StatusModel = Ember.Object.extend({
  name: '',
  value: 1
});
StatusModel.reopenClass({
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
        return this.create(status);
      }, this);
  }
});

export default StatusModel;
