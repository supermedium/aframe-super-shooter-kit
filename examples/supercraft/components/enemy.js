/**
  ENEMY component. It handles enemy animation as well as dying behaviour.
  We favor using threejs `object3D` property of entities rather than `setAttribute()` for performance reasons.
  */

AFRAME.registerComponent('enemy', {
  schema: {
    type: {default: 1} // 1: behind bushes, 2: behind trees, 3: behind clouds
  },

  // initialize listeners and component variables. Also, find and link with the explosion object associated

  init: function () {
    this.timeout = null;          // timeout for waiting for the next appearance
    this.tweenAppear = null;      // tween for appearing animation
    this.tweenDisappear = null;   // tween for hiding animation
    this.hidingPos = 0;           // save rest y position (when enemy is hidden)
    this.vulnerable = false;      // it cannot be shoot when it's hiding 

    // link with explosion object, hide it and set the scale depending on the type of enemy (the further, the bigger)
    this.explosion = this.el.sceneEl.querySelector(`#${this.el.id}expl`).object3D;
    this.explosion.visible = false;
    var explosionScale = this.data.type * 2.2;
    this.explosion.scale.set(explosionScale, explosionScale, explosionScale);

    this.el.addEventListener('run', this.run.bind(this));
    this.el.addEventListener('stop', this.stop.bind(this));
    this.el.addEventListener('hit', this.die.bind(this));
  },

  // called when start message is shot
  run: function () {
    // create tweens if they are not created yet
    if (this.tweenAppear == null) {
      this.hidingPos = this.el.object3D.position.y; // save hidingPos (default position on the Supercraft scene)
      var lift = this.data.type * 1.2; // depending the type of enemy, the further it is, the higher it has to rise
      this.tweenAppear = new TWEEN.Tween(this.el.object3D.position).to({ y: this.hidingPos + lift  }, 500).easing(TWEEN.Easing.Elastic.Out).onComplete(this.endAppear.bind(this));
      this.tweenDisappear = new TWEEN.Tween(this.el.object3D.position).to({ y: this.hidingPos }, 200).delay(1000).easing(TWEEN.Easing.Cubic.Out).onComplete(this.endDisappear.bind(this));
    }
    // hide start message
    document.getElementById('start-message').object3D.visible = false;

    this.appear();
  },

  // start appearance
  appear: function () {
    this.tweenAppear.start();
    this.el.querySelector('[sound]').components.sound.playSound();
  },
  // appearance animation is finished
  endAppear: function () {
    this.vulnerable = true;
    this.tweenDisappear.start(); // we can start disappear tween right away because it has a delay and it will hold a sec.
  },
  // hiding animation is finished
  endDisappear: function () {
    this.vulnerable = false;
    // set next appearance to a random value of seconds between 1 and 4
    this.timeout = setTimeout( this.appear.bind(this), 1000 + Math.floor(Math.random() * 3000));
  },
  // guy was shot, stop tweens and timeouts
  stop: function () {
    this.tweenAppear.stop();
    this.tweenDisappear.stop();
    clearTimeout(this.timeout);
    this.vulnerable = false;
  },
  // guy was shot (this is called via `die` event thrown by the bullets when collide)
  die: function (evt) {
    if (!this.vulnerable) return; // I'm hidden!
    this.stop();
    // hide enemy, return it to hiding position
    this.el.object3D.visible = false;
    this.el.object3D.position.y = this.hidingPos;
    // play explosion sound
    document.getElementById('common-explosion').components.sound.playSound();
    // show explosion on the hit position and make it look to center of stage
    this.explosion.position.copy(evt.detail.position);
    this.explosion.lookAt(0, 1.6, 0);
    this.explosion.visible = true;
    // wait 300 ms to hide explosion...
    setTimeout(() => {
      this.explosion.visible = false; 
      this.el.object3D.visible = true;
      // ...and after a random number of secs (2-5), appear again 
      setTimeout(this.appear.bind(this), 2000 + Math.floor(Math.random() * 3000));
    }, 300);
  }
});
