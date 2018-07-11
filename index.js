/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * shooter component
 */

AFRAME.registerComponent('shooter', {
  schema: {
    bullets: {type: 'array', default:['normal']},
    useBullet: {type: 'string', default: 'normal'},
    cycle: {default: false}
  },

  init: function () {
    this.el.addEventListener('shoot', this.onShoot.bind(this));
    this.el.addEventListener('changebullet', this.onChangeBullet.bind(this));
    this.bulletSystem = this.el.sceneEl.systems['bullet'];
  },

  onShoot: function (evt) {
    this.bulletSystem.shoot(this.data.useBullet, this.el.object3D);
  },

  onChangeBullet: function (evt) {
    var idx;
    if (evt.detail == 'next'){
      idx = this.bullets.indexOf(this.data.useBullet);
      if (idx === -1) return;
      idx = this.data.cycle ? (idx + 1) % this.bullets.length : Math.min(this.bullets.length - 1, idx + 1);
      this.data.useBullet = this.bullets[idx];
    }
    else if (evt.detail == 'prev'){
      idx = this.bullets.indexOf(this.data.useBullet);
      if (idx === -1) return;
      idx = this.data.cycle ? (idx - 1) % this.bullets.length : Math.max(0, idx - 1);
      this.data.useBullet = this.bullets[idx];
    }
    else {
      this.data.useBullet = evt.detail;
    }
  }
});

/**
 * bullet component
 */

AFRAME.registerComponent('bullet', {
  dependencies: ['material'],
  schema: {
    name: {default: 'normal', type: 'string'},
    life: {default: 1.0, type: 'float'},
    speed: {default: 1.0, type: 'float'}, // meter / sec
    maxTime: {default: 1.0, type: 'float'}, // secs
    cacheSize: {default: 10, type: 'int', min: 0},
  },

  init: function () {
    var self = this;
    this.el.addEventListener('object3dset', function (evt) {
      self.system.registerBullet(self);
    });
  }

});

/**
 * bullet system
 */


AFRAME.registerSystem('bullet', {
  init: function () {
    var container = document.createElement('a-entity');
    container.id = "_bullet-container";
    this.el.sceneEl.appendChild(container);
    
    this.container = container.object3D;
    this.containerID = container.object3D.id;
    this.cache = {};
    this.targets = [];
  },

  registerBullet: function (bulletComponent) {
    var model;
    var b;
    var data;
    model = bulletComponent.el.object3D;
    if (!model) return;

    model.visible = false; // !!
    data = bulletComponent.data;
    // initialize cache and bullets
    this.cache[data.name] = [];
    for (var i = 0; i < data.cacheSize; i++) {
      b = model.clone();
      b.direction = new THREE.Vector3(0, 0, -1);
      b.speed = data.speed;
      b.name = data.name + i;
      b.time = 0;
      b.maxTime = data.maxTime * 1000;
      b.life = data.life;
      b.visible = false;
      this.cache[data.name].push(b);
    }
  },

  registerTarget: function (comp) {
    var obj = comp.el.object3D;
    this.targets.push(comp.el);
    if (comp.data.static) {
      // precalculate bounding box
      obj.bb = new THREE.Box3().setFromObject(obj);
    }
  },

  shoot: function (bulletName, gun) {
    var oldest = 0;
    var oldesttime = 0;
    var cache = this.cache[bulletName];
    if (cache === undefined) return null;

    // find available bullet and initialize it
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].visible === false) {
        return this.shootBullet(cache[i], gun);
      }
      else if (cache[i].time > oldesttime){
        oldest = i;
        oldesttime = cache[i].time;
      }
    }

    // all bullets are active, cache is full, get oldest bullet
    return this.shootBullet(cache[oldest], gun);
  },

  shootBullet: function (bullet, gun) {
    bullet.visible = true;
    bullet.time = 0;
    gun.getWorldPosition(bullet.position);
    gun.getWorldDirection(bullet.direction);
    bullet.direction.multiplyScalar(-bullet.speed);
    this.container.add(bullet);
    return bullet;
  },

  tick: function (time, delta) {
    var bullet;
    var v = new THREE.Vector3();
    for (var i = 0; i < this.container.children.length; i++) {
      bullet = this.container.children[i];
      if (!bullet.visible) { continue; }
      bullet.time += delta;
      if (bullet.time >= bullet.maxTime) {
        this.killBullet(bullet);
        continue;
      }
      v.copy(bullet.direction).multiplyScalar(delta / 850);
      bullet.position.add(v);

      // colisions
      var tbb = new THREE.Box3();
      var bbb = new THREE.Box3().setFromObject(bullet);
      var hit;
      var targetObj;
      for (var t = 0; t < this.targets.length; t++) {
        if (!this.targets[t].components.target.data.active) { continue; }
        targetObj = this.targets[t].object3D;
        if (!targetObj.visible) { continue; }
        hit = false;
        if (targetObj['bb']){
          hit = targetObj.bb.intersectsBox(bbb);
        }
        else {
          tbb.setFromObject(targetObj);
          hit = tbb.intersectsBox(bbb);         
        }
        if (hit) {
          this.killBullet(bullet);
          this.targets[t].components.target.modifyLife(-bullet.life);
          //this.el.emit('hit', {bullet: bullet, target: this.targets[t], position: bullet.position});
          this.targets[t].emit('hit', {bullet: bullet, target: this.targets[t], position: bullet.position});
          break;
        }
      }
    }
  },

  killBullet: function (bullet) {
    bullet.visible = false;
  }

});

/**
 * target component
 */

AFRAME.registerComponent('target', {
  schema: {
    static: {default: true},
    life: {default: 0, type: 'float'},
    active: {default: true}
  },
  init: function () {
    var self = this;
    this.el.addEventListener('object3dset', function (evt) {
      self.el.sceneEl.systems.bullet.registerTarget(self);
    });
  },

  update: function (oldData) {
    this.life = this.data.life;
  },

  modifyLife: function (life) {
    if (!this.data.active) return;
    this.life += life;
    if (this.life <= 0) {
      this.el.emit('die');
    }
  }
});

