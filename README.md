# aframe-super-shooter-kit

[A-Frame](https://aframe.io) kit of components for making a simple WebVR
shooter minigame. From the creators of A-Frame, Supermedium, and Supercraft.

![screenshot](https://user-images.githubusercontent.com/674727/43233052-499cf788-9074-11e8-98bb-3823e30ef13d.jpg)

**[PLAY](https://supermedium.github.io/aframe-super-shooter-kit/examples/supercraft/)**

The kit is set of simple and easy to use components to provide a way of
building simple shooting experiences, where a "shooter" shoots "bullets" that
can hit "targets". A large chunk of the game can be handled at just the
declarative A-Frame layer in HTML.

1. One `bullet` entity acts as a template for the instances of shot bullets.
2. Entity with `shooter` component attached (e.g., a gun) spawns bullets on
`shoot` event from its position.
3. Collisions among bullet's and `target`'s bounding boxes are checked.
4. Health and life of targets are calculated (`hit` and `die` events).

So we define which entities are bullets, shooters, and targets, and then wire
up the game using controls and progress the game with events.

![diagram](https://user-images.githubusercontent.com/674727/43211842-cb6de9da-9032-11e8-94ff-8c4b6b8ac176.png)

[Video of Supercraft + Super Shooter Kit workflow](https://www.youtube.com/watch?v=RW3enib2X94)

## API

### `shooter` component

The `shooter` component should be attached to a controller for gun. But it can
also be attached to the camera to support 2D / desktop or normal smartphone if
wired to mouse or touch.

| Property         | Description                                                                                                                                          | Default Value |
| --------         | -----------                                                                                                                                          | ------------- |
| activeBulletType | Name of current active bullet the shooter is firing.                                                                                                 | 'normal'      |
| bulletTypes      | Array of possible bullet names.                                                                                                                      | ['normal']    |
| cycle            | A flag to tell when swapping to the `next` or `prev` bullet type, cycle to the first or last type when reaching the last or first type respectively. | false         |

#### Events

These events can be triggered with `entity.emit(eventName)`.

| Event Name     | Effect                                                      |
|----------------|-------------------------------------------------------------|
| shoot        | Shoot a bullet.                                             |
| changebullet | Swap bullet type (either `prev`, `next`, or name of bullet. |

### `bullet` component

| Property     | Description                                                               | Default Value |
|--------------|---------------------------------------------------------------------------|---------------|
| damagePoints | How many health points to remove from target when hitting target.         | 1.0           |
| maxTime      | Life time of bullet in seconds. When elapsed, the bullet will be removed. | 1.0           |
| name         | Name of the bullet type.                                                  | normal        |
| poolSize     | How many copies of this bullet can be on screen at once.                  | 10            |
| speed        | Speed of bullet in meters per second.                                     | 1.0           |

### `target` component

| Property     | Description                                                                                                                                                                                                                          | Default Value |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| active       | Whether this target is included in collision tests.                                                                                                                                                                                  | true          |
| healthPoints | Number of hit or health points of the target. When a bullet hits this target, its health points will decrease by the bullet's damage points. When the target reaches 0 health points, then the event 'die' is emitted on the target. | 1             |
| static       | Whether this object does not ever move or change shape. If set to false, then the bounding box is recalculated continuously.                                                                                                         | true          |

#### Members

Component members can be accessed by like `entity.components.target.lastBulletHit`:

| Member        | Description                                                                                                                                   |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| lastBulletHit | Reference object to the last bullet object3D that hit the target. Useful for attaining the position of where the bullet contacted the target. |

#### Events

Events emitted on the target that we can listen to, to perhaps show an
explosion effect on target hit or die.

| Event Name | Description                                            |
|------------|--------------------------------------------------------|
| hit        | Target was hit by a bullet.                            |
| die        | Target ran out of healthPoints and has been destroyed. |

## With Supercraft Assets

[Supercraft](https://supermedium.com/supercraft) is an A-Frame WebVR
application that lets you build low-poly VR assets inside of VR with your
hands, and export them to Web or JSON! With the shooter kit providing dead-easy
components, A-Frame letting you do things in just HTML, and ability to create
good assets without modeling experience, WebVR development is made simple.

The advantage of the Supercraft JSON exports alongside
[aframe-supercraft-loader](https://www.npmjs.com/package/aframe-supercraft-loader)
and [aframe-supercraft-thing](https://www.npmjs.com/package/aframe-supercraft-thing)
is that they are tailored for A-Frame resulting in extremely small file sizes
and performant through geometry merging.

All 3D assets in this scene are delivered within a single 190KB JSON file:
[Supercraft Shooter](https://supermedium.github.io/supercraft-shooter). All
the assets in the game were done using Supercraft in **45 minutes**, and the
code is just dozens of lines of Javascript and HTML. Game created in an
afternoon.

An extremely cool workflow is using the `supercraft-loader` to "live-reload"
assets.  The Supercraft JSON is hosted on the Web via name; we just need to do
`supercraft-loader="name: my-supercraft-site"`, and whenever we publish an update
to `my-supercraft-site` within Supercraft, the scene will automatically have
access to the fresh new assets.

And `supercraft-thing-loader` can be used to pick individual objects out of a
Supercraft scene of objects. You can create all your assets in one scene, make
sure they have good scale relative to one another, tweak them all at once!

**[VIDEO](https://www.youtube.com/watch?v=RW3enib2X94)**

## Installation

### Browser

See the [Supercraft Shooter example source
code](https://github.com/supermedium/aframe-super-shooter-kit/tree/master/examples/supercraft).

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>A-Frame Super Shooter Kit - Basic</title>
  <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
  <script src="../../dist/aframe-super-shooter-kit.min.js"></script>
  <script>
    /**
     * Click mouse to shoot.
     */
    AFRAME.registerComponent('click-to-shoot', {
      init: function () {
        document.body.addEventListener('mousedown', () => { this.el.emit('shoot'); });
      }
    });

    /**
     * Change color when hit.
     */
    AFRAME.registerComponent('hit-handler', {
      dependencies: ['material'],

      init: function () {
        var color;
        var el = this.el;

        color = new THREE.Color();
        color.set('#666');
        el.components.material.material.color.copy(color);
        el.addEventListener('hit', () => {
          color.addScalar(0.05);
          el.components.material.material.color.copy(color);
        });

        el.addEventListener('die', () => {
          color.setRGB(1, 0, 0);
          el.components.material.material.color.copy(color);
        });
      }
    });
  </script>
</head>

<body>
  <a-scene background="color: #DADADA">
    <a-entity id="bulletTemplate" bullet geometry="primitive: sphere; radius: 0.1" material="color: orange"></a-entity>

    <a-entity class="target" target="healthPoints: 10" geometry="primitive: box" material="color: teal" position="0 0 -4" hit-handler></a-entity>

    <a-entity id="gun" shooter geometry="primitive: box; width: 0.1; height: 0.1; depth: 0.3" material="color: red" click-to-shoot position="0 0 -1"></a-entity>

    <a-camera id="camera" position="-1 0 0" shooter click-to-shoot></a-camera>
  </a-scene>
</body>
```

### npm

Install via npm:

```bash
npm install aframe-super-shooter-kit
```

Then require and use.

```js
require('aframe');
require('aframe-super-shooter-kit');
```
