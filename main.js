+function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['ember'], function(Ember) { return factory(Ember); });
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ember'));
  } else {
    (root.mb || (root.mb = {})).VCRProxy = factory(root.Ember);
  }
}(this, function(Ember) {

  "use strict";

  // Record changes to an ObjectProxy and allow them to be stepped through
  // or jumped to.
  //
  // For an example, see http://emberjs.jsbin.com/EJEcoxO/7/edit?html,js,output

  var get = Ember.get, set = Ember.set,
      setProperties = Ember.setProperties;

  function empty(obj) {
    var key;
    for (key in obj) if (obj.hasOwnProperty(key)) return false;
    return true;
  }

  return Ember.Mixin.create({
    transforms: null,
    playbackTransformIndex: null,
    playbackBuffer: null,

    // Throw away the transforms after the current time being shown,
    // and reset the playback variables.
    cancelPlayback: function(){
      var playbackTransformIndex = this.playbackTransformIndex;
      if (playbackTransformIndex === null) return;
      this.transforms = this.transforms.slice(0, playbackTransformIndex);
      this.setProperties({
        playbackTransformIndex: null,
        playbackBuffer: null
      });
    },

    // If there is a playback buffer, read values from that. If
    // not, pass to the parent.
    unknownProperty: function(key) {
      var buffer = this.playbackBuffer;
      return buffer && buffer.hasOwnProperty(key) ? buffer[key] : this._super(key);
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
      if (this.playbackTransformIndex !== null) {
        return this.playbackTransformIndex;
      } else {
        return this.transforms.length - 1;
      }
    },

    // Step the history relative to the current position.
    step: function(steps){  
      return this.jump(this.currentIndex()+steps);
    },

    // Jump to a specific offset in the history.
    jump: function(targetIndex){
      if (!this.transforms) return;

      var changedProperties = {},
          currentIndex = this.currentIndex(),
          i, key, value, newIndex;

      // Go up
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
      // Go down
      } else if (targetIndex < currentIndex) {
        for (i = currentIndex; i > targetIndex; i--) {
          if (!this.transforms[i]) break;
          set(
            changedProperties,
            this.transforms[i][1],
            this.transforms[i][3]
          );
          newIndex = i-1;
        }
      }

      // Only update if there is data to update with.
      if (newIndex !== undefined) this.updateBuffer(changedProperties, newIndex);

      // Return true if a change happened.
      return newIndex !== undefined && newIndex !== currentIndex;
    },

    updateBuffer: function(changedProperties, newIndex) {
      var key;

      // Notify that all these properties will change.
      for (key in changedProperties) {
        if (!changedProperties.hasOwnProperty(key)) continue;
        this.propertyWillChange(key);
      }

      // Update or set the playback buffer
      if (this.playbackBuffer) setProperties(this.playbackBuffer, changedProperties);
      else this.playbackBuffer = changedProperties;

      // And set the playback index to our current position.
      this.playbackTransformIndex = newIndex;

      // Notify that all these properties did change.
      for (key in changedProperties) {
        if (!changedProperties.hasOwnProperty(key)) continue;
        this.propertyDidChange(key);
      }

    }
  });

});

