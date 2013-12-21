ember-vcr-proxy
============

Record changes to an ObjectProxy and allow them to be stepped through or
jumped to. The underlying content is modified as the proxy steps or jumps,
and as soon as a new value is set any invalid history is discarded.

[Try it out in this JSBin](http://emberjs.jsbin.com/EJEcoxO/12/edit?html,js,output).

Usage
------------

This project is published on bower. Either `bower install ember-vcr-proxy` or
download the `main.js` file.

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

