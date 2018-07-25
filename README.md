# aframe-super-shooter-kit

[A-Frame](https://aframe.io) kit of components for making a simple WebVR
shooter minigame. From the creators of A-Frame, Supermedium, and Supercraft.

The kit is set of components and systems (under a single file) to provide a way
of building simple shooting experiences, where a "shooter" shoots "bullets"
that can hit "targets".

![diagram](https://user-images.githubusercontent.com/674727/43211842-cb6de9da-9032-11e8-94ff-8c4b6b8ac176.png)

* One bullet entity acts as a template for the instances of shot bullets.
* Shooter entity defines the source position and orientation of the bullets.
* Collisions among bullet's and target's bounding boxes are checked.

So we define which entities are bullets, shooters, and targets, and trigger and
listen to actions using events.

**[EXAMPLE: Supercraft Shooter](https://supermedium.github.io/supercraft-shooter/)** using
assets quickly put together in VR via [Supercraft](https://supermedium.com/supercraft/).

[Watch quick video of the Supercraft + Super Shooter Kit workflow!](https://www.youtube.com/watch?v=RW3enib2X94)

## API

### `shooter` component

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

#### Events

Events emitted on the target that we can listen to, to perhaps show an
explosion effect on target hit or die.

| Event Name | Description                                            |
|------------|--------------------------------------------------------|
| hit        | Target was hit by a bullet.                            |
| die        | Target ran out of healthPoints and has been destroyed. |

## Installation

### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <script src="https://aframe.io/releases/0.8.2/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-super-shooter-kit@^1.0.1/dist/aframe-super-shooter-kit.min.js"></script>
  <script>
    AFRAME.registerComponent('click-to-shoot', {
      init: function () {
        document.body.addEventListener('mousedown', () => {
          this.el.emit('shoot');
        });
      }
    });
  </script>
</head>

<body>
  <a-scene>
    <a-entity id="bulletTemplate" bullet geometry="primitive: sphere"></a-entity>
    <a-entity class="target" target geometry="primitive: box"></a-entity>
    <a-entity id="gun" shooter geometry="primitive: box" click-to-shoot></a-entity>
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
