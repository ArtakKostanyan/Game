 import GameScene from './scenes/gameScene.js';
 import { initializeSocketEvents } from './sockets/socketEvents.js';
 initializeSocketEvents();

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
