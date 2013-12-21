ember-vcr-proxy
============

Record changes to an ObjectProxy and allow them to be stepped through or
jumped to. The underlying content is modified as the proxy steps or jumps,
and as soon as a new value is set any invalid history is discarded.

<a class="jsbin-embed" href="http://emberjs.jsbin.com/EJEcoxO/12/embed?output">Ember Starter Kit</a><script src="http://static.jsbin.com/js/embed.js"></script>

Usage
------------

``` JavaScript
App.IndexController = Ember.ObjectController.extend(VCRProxy, {
  actions: {
    back: function(){
      this.step(-1);
    },
    forward: function(){
      this.step(1);
    },
    // replay as an animation
    replay: function(){
      this.jump(VCRProxy.ORIGINAL_STATE);
      var controller = this;
      function nextTick(){
        if (controller.step(1)) window.requestAnimationFrame(function(){
          window.Ember.run(null, nextTick);
        });
      }
      nextTick();
    }
  }
});
```

Contributing
------------

After cloning this repo, install dependencies:

```sh
$ npm install
$ bower install
```

Fire up the grunt watcher:

```sh
$ grunt
```

Then in a different tab run your tests with testem:

```sh
$ testem
```

