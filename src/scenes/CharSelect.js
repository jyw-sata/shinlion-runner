import Phaser from 'phaser';

export default class CharSelect extends Phaser.Scene {
  constructor() {
    super('CharSelect');
  }

  create() {
    const W = 720, H = 1280;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d5a8e, 0x2d5a8e, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    this.add.text(W / 2, 160, '신라이언 러너', {
      fontSize: '56px', fontFamily: 'Arial', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, 240, '캐릭터를 선택하세요', {
      fontSize: '28px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    // Polar bear card
    this.createCharCard(W / 2 - 150, 500, 'polar', '북극곰');
    // Teddy bear card
    this.createCharCard(W / 2 + 150, 500, 'teddy', '테디베어');

    // Instructions
    this.add.text(W / 2, 900, '좌우 스와이프로 이동\n장애물을 피하고 빵을 모아라!', {
      fontSize: '22px', fontFamily: 'Arial', color: '#cccccc',
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, 1020, '120초 생존하면 승리!', {
      fontSize: '26px', fontFamily: 'Arial', color: '#4ade80',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Controls info
    this.add.text(W / 2, 1120, '🎮 키보드: ← → 방향키  |  📱 터치: 좌우 스와이프', {
      fontSize: '18px', fontFamily: 'Arial', color: '#999999',
    }).setOrigin(0.5);
  }

  createCharCard(x, y, charKey, label) {
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x2a2a4a, 0.9);
    card.fillRoundedRect(x - 120, y - 140, 240, 360, 20);
    card.lineStyle(3, 0xFFD700, 0.6);
    card.strokeRoundedRect(x - 120, y - 140, 240, 360, 20);

    // Character sprite with idle animation
    const sprite = this.add.sprite(x, y, `${charKey}_idle_0`);
    sprite.setScale(1.2);
    sprite.play(`${charKey}_idle`);

    // Label
    this.add.text(x, y + 120, label, {
      fontSize: '30px', fontFamily: 'Arial', color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Select button
    const btnG = this.add.graphics();
    btnG.fillStyle(0x4ade80, 1);
    btnG.fillRoundedRect(x - 80, y + 155, 160, 45, 12);

    const btnText = this.add.text(x, y + 177, '선택', {
      fontSize: '24px', fontFamily: 'Arial', color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Interactive zone
    const hitZone = this.add.zone(x, y + 177, 160, 45).setInteractive();
    hitZone.on('pointerover', () => {
      btnG.clear();
      btnG.fillStyle(0x6bff9e, 1);
      btnG.fillRoundedRect(x - 80, y + 155, 160, 45, 12);
    });
    hitZone.on('pointerout', () => {
      btnG.clear();
      btnG.fillStyle(0x4ade80, 1);
      btnG.fillRoundedRect(x - 80, y + 155, 160, 45, 12);
    });
    hitZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('Game', { character: charKey });
      });
    });

    // Also allow clicking the whole card
    const cardZone = this.add.zone(x, y + 40, 240, 360).setInteractive();
    cardZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('Game', { character: charKey });
      });
    });
  }
}
