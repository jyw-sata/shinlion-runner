import Phaser from 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // --- Progress bar ---
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const barW = 400, barH = 30;
    const barX = (W - barW) / 2, barY = H / 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRect(barX, barY, barW, barH);
    const fill = this.add.graphics();
    const loadText = this.add.text(W / 2, barY - 40, 'Loading...', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.load.on('progress', (v) => {
      fill.clear();
      fill.fillStyle(0x4ade80, 1);
      fill.fillRect(barX + 4, barY + 4, (barW - 8) * v, barH - 8);
    });
    this.load.on('complete', () => {
      bg.destroy(); fill.destroy(); loadText.destroy();
    });

    // --- Load sprite frames ---
    const sprites = {
      polar: { run: 10, idle: 8, hurt: 6, dead: 10, jump: 5 },
      teddy: { run: 10, idle: 8, hurt: 6, dead: 10, jump: 5 },
    };
    for (const [char, anims] of Object.entries(sprites)) {
      for (const [anim, count] of Object.entries(anims)) {
        for (let i = 0; i < count; i++) {
          this.load.image(`${char}_${anim}_${i}`, `sprites/${char}/${anim}/${i}.png`);
        }
      }
    }
  }

  create() {
    // --- Create animations for both characters ---
    const animDefs = [
      { key: 'run',  count: 10, rate: 12, repeat: -1 },
      { key: 'idle', count: 8,  rate: 8,  repeat: -1 },
      { key: 'hurt', count: 6,  rate: 10, repeat: 0  },
      { key: 'dead', count: 10, rate: 8,  repeat: 0  },
      { key: 'jump', count: 5,  rate: 10, repeat: 0  },
    ];

    for (const char of ['polar', 'teddy']) {
      for (const def of animDefs) {
        const frames = [];
        for (let i = 0; i < def.count; i++) {
          frames.push({ key: `${char}_${def.key}_${i}` });
        }
        this.anims.create({
          key: `${char}_${def.key}`,
          frames,
          frameRate: def.rate,
          repeat: def.repeat,
        });
      }
    }

    // --- Create procedural textures ---
    this.createProceduralAssets();

    this.scene.start('CharSelect');
  }

  createProceduralAssets() {
    // Rock obstacle
    const rockG = this.add.graphics();
    rockG.fillStyle(0x666666);
    rockG.fillRoundedRect(0, 0, 60, 50, 8);
    rockG.fillStyle(0x555555);
    rockG.fillRoundedRect(5, 5, 20, 15, 4);
    rockG.fillStyle(0x777777);
    rockG.fillRoundedRect(30, 10, 15, 12, 3);
    rockG.generateTexture('rock', 60, 50);
    rockG.destroy();

    // Barrier obstacle
    const barrierG = this.add.graphics();
    barrierG.fillStyle(0xcc3333);
    barrierG.fillRect(0, 10, 70, 8);
    barrierG.fillStyle(0xffffff);
    barrierG.fillRect(0, 10, 14, 8);
    barrierG.fillRect(28, 10, 14, 8);
    barrierG.fillRect(56, 10, 14, 8);
    barrierG.fillStyle(0x888888);
    barrierG.fillRect(5, 0, 6, 30);
    barrierG.fillRect(58, 0, 6, 30);
    barrierG.generateTexture('barrier', 70, 30);
    barrierG.destroy();

    // Bread item (앙버터)
    const breadG = this.add.graphics();
    breadG.fillStyle(0xdaa520);
    breadG.fillEllipse(20, 16, 36, 28);
    breadG.fillStyle(0xf5deb3);
    breadG.fillEllipse(20, 12, 28, 18);
    breadG.generateTexture('bread_butter', 40, 32);
    breadG.destroy();

    // Bread item (휘낭시에)
    const finG = this.add.graphics();
    finG.fillStyle(0xc8a030);
    finG.fillRect(2, 6, 36, 20);
    finG.fillStyle(0xe8c860);
    finG.fillRect(4, 8, 32, 14);
    finG.generateTexture('bread_financier', 40, 32);
    finG.destroy();

    // Bread item (소금빵)
    const saltG = this.add.graphics();
    saltG.fillStyle(0xd4a040);
    saltG.fillEllipse(20, 16, 34, 26);
    saltG.fillStyle(0xfff8dc);
    saltG.fillCircle(12, 10, 3);
    saltG.fillCircle(22, 8, 2);
    saltG.fillCircle(28, 12, 3);
    saltG.generateTexture('bread_salt', 40, 32);
    saltG.destroy();

    // Sparkle bread (booster)
    const sparkleG = this.add.graphics();
    sparkleG.fillStyle(0xffd700);
    sparkleG.fillEllipse(22, 18, 40, 32);
    sparkleG.fillStyle(0xffff00);
    sparkleG.fillEllipse(22, 14, 30, 20);
    // sparkle marks
    sparkleG.lineStyle(2, 0xffffff);
    sparkleG.lineBetween(0, 4, 6, 10);
    sparkleG.lineBetween(38, 4, 32, 10);
    sparkleG.lineBetween(10, 0, 14, 8);
    sparkleG.lineBetween(30, 0, 28, 8);
    sparkleG.generateTexture('bread_sparkle', 44, 36);
    sparkleG.destroy();

    // Energy icon
    const eG = this.add.graphics();
    eG.fillStyle(0xff4444);
    eG.fillTriangle(12, 0, 0, 16, 24, 16);
    eG.fillTriangle(0, 10, 12, 24, 24, 10);
    eG.generateTexture('heart', 24, 24);
    eG.destroy();
  }
}
