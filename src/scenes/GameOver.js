import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.charKey = data.character || 'polar';
    this.finalScore = data.score || 0;
    this.maxCombo = data.maxCombo || 0;
    this.elapsed = data.elapsed || 0;
  }

  create() {
    const W = 720, H = 1280;

    // Dark overlay
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x2a1010, 0x2a1010, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, 200, 'GAME OVER', {
      fontSize: '64px', fontFamily: 'Arial', color: '#ff4444',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    // Dead character
    const sprite = this.add.sprite(W / 2, 480, `${this.charKey}_dead_0`);
    sprite.setScale(2.0);
    sprite.play(`${this.charKey}_dead`);

    // Stats panel
    const panel = this.add.graphics();
    panel.fillStyle(0x222222, 0.8);
    panel.fillRoundedRect(W / 2 - 200, 650, 400, 250, 16);

    this.add.text(W / 2, 690, `생존 시간: ${this.elapsed}초`, {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(W / 2, 740, `점수: ${this.finalScore}`, {
      fontSize: '28px', fontFamily: 'Arial', color: '#FFD700',
    }).setOrigin(0.5);

    this.add.text(W / 2, 790, `최대 콤보: ${this.maxCombo}`, {
      fontSize: '24px', fontFamily: 'Arial', color: '#ff8c00',
    }).setOrigin(0.5);

    this.add.text(W / 2, 850, '에너지가 바닥났습니다!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#ff6666',
    }).setOrigin(0.5);

    // Retry button
    const btnG = this.add.graphics();
    btnG.fillStyle(0x4ade80, 1);
    btnG.fillRoundedRect(W / 2 - 120, 960, 240, 60, 14);
    this.add.text(W / 2, 990, '다시 도전', {
      fontSize: '28px', fontFamily: 'Arial', color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.zone(W / 2, 990, 240, 60).setInteractive().on('pointerdown', () => {
      this.scene.start('Game', { character: this.charKey });
    });

    // Character select button
    const btn2G = this.add.graphics();
    btn2G.fillStyle(0x6b88ff, 1);
    btn2G.fillRoundedRect(W / 2 - 120, 1050, 240, 60, 14);
    this.add.text(W / 2, 1080, '캐릭터 선택', {
      fontSize: '28px', fontFamily: 'Arial', color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.zone(W / 2, 1080, 240, 60).setInteractive().on('pointerdown', () => {
      this.scene.start('CharSelect');
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
