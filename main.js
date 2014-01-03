function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['ember'], function(Ember) { return factory(Ember); });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ember'));
  } else {
    (root.mb || (root.mb = {})).VCRProxy = factory(root.Ember);
  }
}(this, function(Ember) {

  "use strict";

  var get = Ember.get, set = Ember.set,
      setProperties = Ember.setProperties;

  // Record changes to an ObjectProxy and allow them to be stepped through
  // or jumped to.
  var VCRProxy = Ember.Mixin.create({
    transforms: null,
    playbackTransformIndex: null,
    
    // Convenience function.
    playbackTransformDescription: Ember.computed(function(){
      var index = this.get('playbackTransformIndex');
      if (index !== null && this.transforms) {
        if (this.transforms[index]) {
          return this.transforms[index][0];
        } else if (index === -1) {
          return 'Original values';
        }
      }
      return null;
    }).property('playbackTransformIndex').readOnly(),

    // Throw away the transforms after the current time being shown,
    // and reset the playback variables.
    cancelPlayback: function(){
      var playbackTransformIndex = this.get('playbackTransformIndex');
      if (playbackTransformIndex === null) return;
      this.transforms = this.transforms.slice(0, playbackTransformIndex-1);
      this.set('playbackTransformIndex', null);
    },
 
    // When a property is set, cancel playback then store the
    // change. Then pass the value to the parent.
    setUnknownProperty: function(key, value) {
      this.cancelPlayback();
      if (!this.transforms) this.transforms = [];
      this.transforms.push(
        [new Date(), key, value, this.get('content.'+key)]
      );
      
      return this._super.apply(this, arguments);
    },
   
    // If in playback, return that offset. If not return
    // the last offset.
    currentIndex: function(){
      var playbackTransformIndex = this.get('playbackTransformIndex');
      if (playbackTransformIndex !== null) {
        return playbackTransformIndex;
      } else {
        return this.transforms.length-1;
      }
    },
    
    // Step the history relative to the current position.
    step: function(steps){
      if (!this.transforms) return;
      return this.jump(this.currentIndex()+steps);
    },
    
    // Jump to a specific offset in the history.
    jump: function(targetIndex){
      if (!this.transforms) return;
      
      var changedProperties = {},
          currentIndex = this.currentIndex(),
          i, key, value, newIndex;
      
      // Go up, start on the next index
      if (targetIndex > currentIndex) {
        for (i = currentIndex+1; i <= targetIndex; i++) {
          if (!this.transforms[i]) break;
          set(
            changedProperties,
            this.transforms[i][1],
            this.transforms[i][2]
          );
          newIndex = i;
        }
      // Go down, start at the current offset
      } else if (targetIndex < currentIndex) {
        for (i = currentIndex; i > targetIndex; i--) {
          if (!this.transforms[i]) break;
          set(
            changedProperties,
            this.transforms[i][1],
            this.transforms[i][3]
          );
          // The previous index is where we really are
          newIndex = i-1;
        }
      }
      
      // Only update if there is data to update with.
      if (newIndex !== undefined && newIndex !== currentIndex) {
        setProperties(this.get('content'), changedProperties);      
        // And set the playback index to our current position.
        this.set('playbackTransformIndex', newIndex);
        return true;
      }
      
      return false;
    }
  });
  
  VCRProxy.ORIGINAL_STATE = -1;
  
  return VCRProxy;

});
