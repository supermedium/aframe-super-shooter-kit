/**
 * Enemy component.
 * Handle enemy animation and dying behavior.
 * Favor using threejs `object3D` property of entities rather than `setAttribute()`
 * for optimization.
 */
AFRAME.registerComponent('enemy', {
  schema: {
    // 1: behind bushes
    // 2: behind trees
    // 3: behind clouds
    type: {default: 1}
  },

  /**
   * Initialize listeners and component variables.
   * Find and link with the explosion object associated.
   */
  init: function () {
    var el = this.el;
    var explosionScale;

    this.hidingPos = 0;           // Save rest y position when enemy is hidden.
    this.timeout = null;          // Timeout for waiting for the next appearance.
    this.tweenAppear = null;      // Tween for appearing animation.
    this.tweenDisappear = null;   // Tween for hiding animation.
    this.vulnerable = false;      // Cannot be shoot when it's hiding.

    // Link with explosion object.
    // Hide explosion object and set scale depending on type of enemy (further == bigger).
    this.explosion = document.getElementById(`${this.el.id}expl`).object3D;
    this.explosion.visible = false;
    explosionScale = this.data.type * 2.2;
    this.explosion.scale.set(explosionScale, explosionScale, explosionScale);

    el.addEventListener('run', this.run.bind(this));
    el.addEventListener('stop', this.stop.bind(this));
    el.addEventListener('hit', this.die.bind(this));
  },

  /**
   * Game start. When start message is shot.
   */
  run: function () {
    var lift;

    // Create tweens if not created yet.
    if (this.tweenAppear === null) {
      // Save hidingPos (default position on the Supercraft site).
      this.hidingPos = this.el.object3D.position.y;

      // Depending the type of enemy, the further it is, the higher it has to rise.
      lift = this.data.type * 1.2;
      this.tweenAppear = new TWEEN.Tween(this.el.object3D.position)
        .to({y: this.hidingPos + lift}, 500)
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(this.endAppear.bind(this));

      this.tweenDisappear = new TWEEN.Tween(this.el.object3D.position)
        .to({y: this.hidingPos}, 200)
        .delay(1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(this.endDisappear.bind(this));
    }

    // Hide start message.
    document.getElementById('startMessage').object3D.visible = false;
    this.appear();
  },

  /**
   * Animate and move in.
   */
  appear: function () {
    this.tweenAppear.start();
    this.el.querySelector('[sound]').components.sound.playSound();
  },

  /**
   * Handle appearance animation finished.
   */
  endAppear: function () {
    this.vulnerable = true;
    // We can start the disappear tween right away because it has a delay and it will hold a
    // sec.
    this.tweenDisappear.start();
  },

  /**
   * Handle hiding animation is finished.
   */
  endDisappear: function () {
    this.vulnerable = false;
    // Set next appearance to a random value of seconds between 1 and 4.
    this.timeout = setTimeout(this.appear.bind(this),
                              1000 + Math.floor(Math.random() * 3000));
  },

  /**
   * Stop tweens and timeouts.
   */
  stop: function () {
    this.tweenAppear.stop();
    this.tweenDisappear.stop();
    clearTimeout(this.timeout);
    this.vulnerable = false;
  },

  /**
   * Enemy was killed (this is called via `die` event thrown by the bullets when collide).
   */
  die: function (evt) {
    var el = this.el;

    if (!this.vulnerable) { return; }  // I'm hidden!

    this.stop();

    // Hide enemy, return it to hiding position.
    el.object3D.visible = false;
    el.object3D.position.y = this.hidingPos;

    // Play explosion sound.
    document.getElementById('commonExplosion').components.sound.playSound();

    // Show explosion on the hit position and make it look to center of stage.
    this.explosion.position.copy(this.el.components.target.lastBulletHit.position);
    this.explosion.lookAt(0, 1.6, 0);
    this.explosion.visible = true;

    // Wait 300 ms to hide explosion.
    setTimeout(() => {
      this.explosion.visible = false;
      this.el.object3D.visible = true;
      // After a random number of secs (2-5), appear again.
      setTimeout(this.appear.bind(this),
                 2000 + Math.floor(Math.random() * 3000));
    }, 300);
  }
});
