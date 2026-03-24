import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import CharSelect from './scenes/CharSelect.js';
import Game from './scenes/Game.js';
import GameOver from './scenes/GameOver.js';
import Victory from './scenes/Victory.js';

const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, CharSelect, Game, GameOver, Victory],
};

new Phaser.Game(config);
