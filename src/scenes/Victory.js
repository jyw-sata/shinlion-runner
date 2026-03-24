import Phaser from 'phaser';

export default class Victory extends Phaser.Scene {
  constructor() {
    super('Victory');
  }

  init(data) {
    this.charKey = data.character || 'polar';
    this.finalScore = data.score || 0;
    this.maxCombo = data.maxCombo || 0;
  }

  create() {
    const W = 720, H = 1280;

    // Bright background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2a5e, 0x1a2a5e, 0x2d8a5e, 0x2d8a5e, 1);
    bg.fillRect(0, 0, W, H);

    // Confetti-like particles (simple graphics)
    for (let i = 0; i < 40; i++) {
      const cx = Phaser.Math.Between(20, W - 20);
      const cy = Phaser.Math.Between(50, H - 200);
      const color = Phaser.Utils.Array.GetRandom([0xFFD700, 0xFF6B6B, 0x4ade80, 0x6b88ff, 0xff69b4]);
      const confetti = this.add.rectangle(cx, cy, Phaser.Math.Between(6, 14), Phaser.Math.Between(6, 14), color);
      confetti.setAngle(Phaser.Math.Between(0, 360));
      confetti.setAlpha(0.7);
      this.tweens.add({
        targets: confetti,
        y: cy + Phaser.Math.Between(100, 300),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Title
    this.add.text(W / 2, 180, '🎉 승리! 🎉', {
      fontSize: '60px', fontFamily: 'Arial', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, 260, '120초 생존 성공!', {
      fontSize: '30px', fontFamily: 'Arial', color: '#4ade80',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Jumping character
    const sprite = this.add.sprite(W / 2, 480, `${this.charKey}_jump_0`);
    sprite.setScale(2.2);
    sprite.play(`${this.charKey}_jump`);

    // Loop jump animation
    sprite.on('animationcomplete', () => {
      this.time.delayedCall(300, () => {
        if (sprite.active) sprite.play(`${this.charKey}_jump`);
      });
    });

    // Bouncing effect
    this.tweens.add({
      targets: sprite,
      y: 440,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Stats panel
    const panel = this.add.graphics();
    panel.fillStyle(0x222244, 0.85);
    panel.fillRoundedRect(W / 2 - 200, 650, 400, 200, 16);

    this.add.text(W / 2, 700, `최종 점수: ${this.finalScore}`, {
      fontSize: '32px', fontFamily: 'Arial', color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(W / 2, 760, `최대 콤보: ${this.maxCombo}`, {
      fontSize: '26px', fontFamily: 'Arial', color: '#ff8c00',
    }).setOrigin(0.5);

    this.add.text(W / 2, 810, '축하합니다! 🐻', {
      fontSize: '26px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    // Play again button
    const btnG = this.add.graphics();
    btnG.fillStyle(0x4ade80, 1);
    btnG.fillRoundedRect(W / 2 - 120, 930, 240, 60, 14);
    this.add.text(W / 2, 960, '다시 플레이', {
      fontSize: '28px', fontFamily: 'Arial', color: '#000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.zone(W / 2, 960, 240, 60).setInteractive().on('pointerdown', () => {
      this.scene.start('Game', { character: this.charKey });
    });

    // Character select button
    const btn2G = this.add.graphics();
    btn2G.fillStyle(0x6b88ff, 1);
    btn2G.fillRoundedRect(W / 2 - 120, 1020, 240, 60, 14);
    this.add.text(W / 2, 1050, '캐릭터 선택', {
      fontSize: '28px', fontFamily: 'Arial', color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.zone(W / 2, 1050, 240, 60).setInteractive().on('pointerdown', () => {
      this.scene.start('CharSelect');
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
