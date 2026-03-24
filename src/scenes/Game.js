import Phaser from 'phaser';

const W = 720;
const H = 1280;
const LANE_COUNT = 5;
const GAME_DURATION = 120; // seconds
const BASE_SPEED = 3;
const BOOST_MULTIPLIER = 1.6;
const BOOST_DURATION = 4000; // ms
const BOOST_INTERVAL = 20000; // ms
const ENERGY_MAX = 100;
const ENERGY_TRAP = -10;
const ENERGY_BREAD = 5;
const INVINCIBILITY_MS = 1500;
const SPAWN_INTERVAL_MIN = 600;
const SPAWN_INTERVAL_MAX = 1200;

// Perspective parameters
const VP_X = W / 2;       // vanishing point X
const VP_Y = H * 0.25;    // vanishing point Y
const TRACK_BOTTOM = H - 80;
const TRACK_TOP = VP_Y + 100;
const LANE_WIDTH_BOTTOM = 100;

// Bread types
const BREAD_TYPES = ['bread_butter', 'bread_financier', 'bread_salt'];
const BREAD_NAMES = { bread_butter: '앙버터', bread_financier: '휘낭시에', bread_salt: '소금빵', bread_sparkle: '✨빵' };

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.charKey = data.character || 'polar';
  }

  create() {
    // State
    this.energy = ENERGY_MAX;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.elapsed = 0;
    this.currentLane = 2; // center lane (0-4)
    this.targetLane = 2;
    this.isMoving = false;
    this.isBoosting = false;
    this.isInvincible = false;
    this.isHurt = false;
    this.isDead = false;
    this.speedMultiplier = 1;
    this.lastBoostTime = 0;
    this.spawnTimer = 0;
    this.obstacles = [];
    this.items = [];
    this.trackStripes = [];
    this.gameOver = false;

    // Draw background layers
    this.createBackground();

    // Draw track
    this.createTrack();

    // Character
    this.createCharacter();

    // UI
    this.createUI();

    // Input
    this.setupInput();

    // Start timer event
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onSecondTick,
      callbackScope: this,
      loop: true,
    });

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ===================== BACKGROUND =====================
  createBackground() {
    // Sky gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xc8e6ff, 0xc8e6ff, 1);
    sky.fillRect(0, 0, W, VP_Y + 50);

    // Distant mountains / hills
    this.hills = this.add.graphics();
    this.drawHills(0);

    // Trees layer
    this.treesLayer = this.add.graphics();
    this.treeOffset = 0;
    this.drawTrees(0);
  }

  drawHills(offset) {
    const g = this.hills;
    g.clear();
    g.fillStyle(0x5a8a3c, 0.8);
    const hillY = VP_Y + 30;
    for (let i = -1; i < 6; i++) {
      const cx = i * 180 + ((offset * 0.1) % 180);
      g.fillEllipse(cx, hillY + 20, 200, 80);
    }
    g.fillStyle(0x3d6b2e, 0.6);
    for (let i = -1; i < 6; i++) {
      const cx = i * 200 + 80 + ((offset * 0.15) % 200);
      g.fillEllipse(cx, hillY + 40, 160, 60);
    }
  }

  drawTrees(offset) {
    const g = this.treesLayer;
    g.clear();
    const treeY = VP_Y + 80;
    for (let i = -1; i < 10; i++) {
      const tx = i * 90 + ((offset * 0.3) % 90);
      // trunk
      g.fillStyle(0x6b4226);
      g.fillRect(tx + 8, treeY, 10, 30);
      // foliage
      g.fillStyle(0x2e7d32);
      g.fillTriangle(tx + 13, treeY - 25, tx - 5, treeY + 5, tx + 31, treeY + 5);
      g.fillStyle(0x388e3c);
      g.fillTriangle(tx + 13, treeY - 40, tx, treeY - 10, tx + 26, treeY - 10);
    }
  }

  // ===================== TRACK =====================
  createTrack() {
    this.trackGraphics = this.add.graphics();
    this.stripePhase = 0;

    // Create track stripe pool
    for (let i = 0; i < 20; i++) {
      this.trackStripes.push({ t: i / 20 });
    }
  }

  drawTrack(speed) {
    const g = this.trackGraphics;
    g.clear();

    // Road surface (trapezoid from vanishing point)
    const roadWidthTop = 120;
    const roadWidthBot = LANE_COUNT * LANE_WIDTH_BOTTOM + 60;

    g.fillStyle(0x555555);
    g.beginPath();
    g.moveTo(VP_X - roadWidthTop / 2, TRACK_TOP);
    g.lineTo(VP_X + roadWidthTop / 2, TRACK_TOP);
    g.lineTo(VP_X + roadWidthBot / 2, TRACK_BOTTOM + 80);
    g.lineTo(VP_X - roadWidthBot / 2, TRACK_BOTTOM + 80);
    g.closePath();
    g.fillPath();

    // Sidewalk edges
    g.fillStyle(0x777777);
    g.beginPath();
    g.moveTo(VP_X - roadWidthTop / 2 - 10, TRACK_TOP);
    g.lineTo(VP_X - roadWidthTop / 2, TRACK_TOP);
    g.lineTo(VP_X - roadWidthBot / 2, TRACK_BOTTOM + 80);
    g.lineTo(VP_X - roadWidthBot / 2 - 20, TRACK_BOTTOM + 80);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(VP_X + roadWidthTop / 2, TRACK_TOP);
    g.lineTo(VP_X + roadWidthTop / 2 + 10, TRACK_TOP);
    g.lineTo(VP_X + roadWidthBot / 2 + 20, TRACK_BOTTOM + 80);
    g.lineTo(VP_X + roadWidthBot / 2, TRACK_BOTTOM + 80);
    g.closePath();
    g.fillPath();

    // Lane dividers
    g.lineStyle(1, 0x888888, 0.3);
    for (let lane = 1; lane < LANE_COUNT; lane++) {
      const fracTop = (lane / LANE_COUNT - 0.5);
      const fracBot = (lane / LANE_COUNT - 0.5);
      const topX = VP_X + fracTop * roadWidthTop;
      const botX = VP_X + fracBot * roadWidthBot;
      g.lineBetween(topX, TRACK_TOP, botX, TRACK_BOTTOM + 80);
    }

    // Moving stripes (center dashes)
    this.stripePhase = (this.stripePhase + speed * 0.02) % 1;
    g.lineStyle(3, 0xFFFFFF, 0.4);
    for (let i = 0; i < 15; i++) {
      let t = ((i / 15) + this.stripePhase) % 1;
      // Non-linear perspective: closer stripes are more spread out
      const perspT = t * t;
      const y = TRACK_TOP + (TRACK_BOTTOM - TRACK_TOP) * perspT;
      const nextT = ((i / 15 + 0.03) + this.stripePhase) % 1;
      const nextPerspT = nextT * nextT;
      const y2 = TRACK_TOP + (TRACK_BOTTOM - TRACK_TOP) * nextPerspT;
      if (y2 > y && y > TRACK_TOP) {
        g.lineBetween(VP_X, y, VP_X, Math.min(y2, TRACK_BOTTOM));
      }
    }
  }

  // ===================== CHARACTER =====================
  createCharacter() {
    const startX = this.getLaneX(this.currentLane, 1.0);
    this.player = this.add.sprite(startX, TRACK_BOTTOM - 30, `${this.charKey}_run_0`);
    this.player.setScale(1.1);
    this.player.play(`${this.charKey}_run`);

    // Shadow
    this.shadow = this.add.ellipse(startX, TRACK_BOTTOM + 5, 70, 20, 0x000000, 0.3);
  }

  getLaneX(lane, depthT) {
    // depthT: 0 = vanishing point, 1 = bottom
    const t = depthT || 1.0;
    const roadWidth = Phaser.Math.Linear(120, LANE_COUNT * LANE_WIDTH_BOTTOM + 60, t);
    const laneWidth = roadWidth / LANE_COUNT;
    return VP_X - roadWidth / 2 + laneWidth * (lane + 0.5);
  }

  // ===================== UI =====================
  createUI() {
    // Energy bar background
    this.add.graphics()
      .fillStyle(0x000000, 0.5)
      .fillRoundedRect(20, 20, 300, 35, 8);
    this.energyBar = this.add.graphics();
    this.drawEnergyBar();

    this.add.image(40, 37, 'heart').setScale(1.2);

    // Energy text
    this.energyText = this.add.text(175, 37, '100%', {
      fontSize: '18px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    this.scoreText = this.add.text(W - 30, 25, 'Score: 0', {
      fontSize: '24px', fontFamily: 'Arial', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0);

    // Timer
    this.timerText = this.add.text(W - 30, 58, `${GAME_DURATION}s`, {
      fontSize: '22px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0);

    // Combo display
    this.comboText = this.add.text(W / 2, 120, '', {
      fontSize: '36px', fontFamily: 'Arial', color: '#FF6B6B',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Boost indicator
    this.boostText = this.add.text(W / 2, 180, '⚡ BOOST ⚡', {
      fontSize: '30px', fontFamily: 'Arial', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
  }

  drawEnergyBar() {
    this.energyBar.clear();
    const pct = Phaser.Math.Clamp(this.energy / ENERGY_MAX, 0, 1);
    let color = 0x4ade80;
    if (pct < 0.3) color = 0xff4444;
    else if (pct < 0.6) color = 0xffa500;
    this.energyBar.fillStyle(color, 1);
    this.energyBar.fillRoundedRect(55, 24, 255 * pct, 27, 6);
  }

  // ===================== INPUT =====================
  setupInput() {
    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch / pointer
    this.input.on('pointerdown', (pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeStartTime = pointer.downTime;
    });
    this.input.on('pointerup', (pointer) => {
      if (this.swipeStartX === undefined) return;
      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      const dt = pointer.upTime - this.swipeStartTime;
      if (dt < 500 && Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) this.moveLeft();
        else this.moveRight();
      } else if (dt < 200 && Math.abs(dx) < 30) {
        // Tap: move based on which half
        if (pointer.x < W / 2) this.moveLeft();
        else this.moveRight();
      }
    });
  }

  moveLeft() {
    if (this.isDead || this.isMoving) return;
    if (this.targetLane > 0) {
      this.targetLane--;
      this.tweenToLane();
    }
  }

  moveRight() {
    if (this.isDead || this.isMoving) return;
    if (this.targetLane < LANE_COUNT - 1) {
      this.targetLane++;
      this.tweenToLane();
    }
  }

  tweenToLane() {
    this.isMoving = true;
    const targetX = this.getLaneX(this.targetLane, 1.0);
    this.tweens.add({
      targets: [this.player, this.shadow],
      x: targetX,
      duration: 150,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentLane = this.targetLane;
        this.isMoving = false;
      },
    });
  }

  // ===================== SPAWNING =====================
  spawnObstacle() {
    // Pick random lane(s), guarantee at least 1 open lane
    const lanes = [];
    const numObstacles = Phaser.Math.Between(1, 3);
    const available = [0, 1, 2, 3, 4];
    Phaser.Utils.Array.Shuffle(available);

    for (let i = 0; i < numObstacles && i < LANE_COUNT - 1; i++) {
      lanes.push(available[i]);
    }

    for (const lane of lanes) {
      const isRock = Math.random() > 0.5;
      const textureKey = isRock ? 'rock' : 'barrier';
      const obs = this.add.image(this.getLaneX(lane, 0.0), TRACK_TOP, textureKey);
      obs.setScale(0.3);
      obs.setAlpha(0.5);
      obs.setData('lane', lane);
      obs.setData('t', 0); // depth parameter 0..1
      obs.setData('type', 'obstacle');
      this.obstacles.push(obs);
    }
  }

  spawnItem() {
    const lane = Phaser.Math.Between(0, LANE_COUNT - 1);
    // 10% chance sparkle bread
    const isSparkle = Math.random() < 0.1;
    const textureKey = isSparkle ? 'bread_sparkle' : Phaser.Utils.Array.GetRandom(BREAD_TYPES);
    const item = this.add.image(this.getLaneX(lane, 0.0), TRACK_TOP, textureKey);
    item.setScale(0.3);
    item.setAlpha(0.5);
    item.setData('lane', lane);
    item.setData('t', 0);
    item.setData('type', isSparkle ? 'sparkle' : 'bread');
    item.setData('textureKey', textureKey);
    this.items.push(item);
  }

  // ===================== GAME LOGIC =====================
  onSecondTick() {
    if (this.gameOver) return;
    this.elapsed++;
    const remaining = GAME_DURATION - this.elapsed;
    this.timerText.setText(`${remaining}s`);

    if (remaining <= 10) {
      this.timerText.setColor('#ff4444');
    }

    // Auto-boost every BOOST_INTERVAL
    if (this.elapsed * 1000 - this.lastBoostTime >= BOOST_INTERVAL && !this.isBoosting) {
      this.activateBoost();
    }

    // Win condition
    if (this.elapsed >= GAME_DURATION) {
      this.winGame();
    }
  }

  activateBoost() {
    if (this.isBoosting) return;
    this.isBoosting = true;
    this.speedMultiplier = BOOST_MULTIPLIER;
    this.lastBoostTime = this.elapsed * 1000;

    // Camera zoom effect
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.08,
      duration: 300,
      yoyo: false,
      ease: 'Sine.easeOut',
    });

    // Show boost text
    this.boostText.setAlpha(1);
    this.tweens.add({
      targets: this.boostText,
      scaleX: 1.2, scaleY: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 3,
    });

    this.time.delayedCall(BOOST_DURATION, () => {
      this.isBoosting = false;
      this.speedMultiplier = 1;
      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1.0,
        duration: 500,
        ease: 'Sine.easeIn',
      });
      this.boostText.setAlpha(0);
    });
  }

  hitObstacle() {
    if (this.isInvincible || this.isDead) return;

    this.combo = 0;
    this.energy += ENERGY_TRAP;
    this.drawEnergyBar();
    this.energyText.setText(`${Math.max(0, Math.round(this.energy))}%`);

    // Camera shake
    this.cameras.main.shake(200, 0.015);

    // Flash red
    this.player.setTint(0xff0000);
    this.time.delayedCall(200, () => this.player.clearTint());

    // Hurt animation
    this.isHurt = true;
    this.player.play(`${this.charKey}_hurt`);
    this.player.once('animationcomplete', () => {
      if (!this.isDead) {
        this.isHurt = false;
        this.player.play(`${this.charKey}_run`);
      }
    });

    // Invincibility
    this.isInvincible = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.player.setAlpha(1);
        this.isInvincible = false;
      },
    });

    // Check death
    if (this.energy <= 0) {
      this.energy = 0;
      this.dieGame();
    }
  }

  collectItem(item) {
    const type = item.getData('type');
    const textureKey = item.getData('textureKey');

    if (type === 'sparkle') {
      this.score += 50;
      this.activateBoost();
      this.showFloatText(item.x, item.y, '+50 ⚡', '#FFD700');
    } else {
      this.energy = Math.min(ENERGY_MAX, this.energy + ENERGY_BREAD);
      this.score += 10;
      this.showFloatText(item.x, item.y, `+${ENERGY_BREAD}%`, '#4ade80');
    }

    this.drawEnergyBar();
    this.energyText.setText(`${Math.round(this.energy)}%`);
    this.scoreText.setText(`Score: ${this.score}`);

    // Combo
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.checkCombo();

    item.destroy();
  }

  checkCombo() {
    let label = '';
    if (this.combo >= 20) label = '🔥 AWESOME! 🔥';
    else if (this.combo >= 10) label = '⭐ GREAT! ⭐';
    else if (this.combo >= 5) label = '👍 NICE!';

    if (label) {
      this.comboText.setText(label);
      this.comboText.setAlpha(1);
      this.tweens.add({
        targets: this.comboText,
        alpha: 0,
        y: 90,
        duration: 1200,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.comboText.y = 120;
        },
      });
    }
  }

  showFloatText(x, y, msg, color) {
    const ft = this.add.text(x, y, msg, {
      fontSize: '22px', fontFamily: 'Arial', color,
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: ft,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => ft.destroy(),
    });
  }

  dieGame() {
    if (this.isDead) return;
    this.isDead = true;
    this.gameOver = true;
    this.player.play(`${this.charKey}_dead`);
    this.gameTimer.remove();

    this.time.delayedCall(1500, () => {
      this.scene.start('GameOver', {
        character: this.charKey,
        score: this.score,
        maxCombo: this.maxCombo,
        elapsed: this.elapsed,
      });
    });
  }

  winGame() {
    if (this.isDead) return;
    this.gameOver = true;
    this.gameTimer.remove();

    this.time.delayedCall(500, () => {
      this.scene.start('Victory', {
        character: this.charKey,
        score: this.score,
        maxCombo: this.maxCombo,
      });
    });
  }

  // ===================== UPDATE LOOP =====================
  update(time, delta) {
    if (this.gameOver) return;

    const speed = BASE_SPEED * this.speedMultiplier;
    const dt = delta / 16.67; // normalize to 60fps

    // Keyboard input
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.moveLeft();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.moveRight();

    // Scroll background
    this.treeOffset += speed * dt;
    this.drawHills(this.treeOffset);
    this.drawTrees(this.treeOffset);

    // Draw track
    this.drawTrack(speed * dt);

    // Spawn logic
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      // Decide what to spawn
      if (Math.random() < 0.6) {
        this.spawnObstacle();
      }
      if (Math.random() < 0.5) {
        this.spawnItem();
      }
      this.spawnTimer = Phaser.Math.Between(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
      // Speed up spawning over time
      const timeFactor = Math.max(0.5, 1 - this.elapsed / (GAME_DURATION * 2));
      this.spawnTimer *= timeFactor;
    }

    // Move obstacles forward (perspective)
    this.updateEntities(this.obstacles, speed, dt, true);
    this.updateEntities(this.items, speed, dt, false);
  }

  updateEntities(list, speed, dt, isObstacle) {
    for (let i = list.length - 1; i >= 0; i--) {
      const ent = list[i];
      let t = ent.getData('t');
      t += speed * 0.003 * dt;
      ent.setData('t', t);

      if (t > 1.1) {
        ent.destroy();
        list.splice(i, 1);
        continue;
      }

      // Perspective position
      const perspT = t * t; // quadratic for perspective feel
      const lane = ent.getData('lane');
      const x = this.getLaneX(lane, perspT);
      const y = TRACK_TOP + (TRACK_BOTTOM - TRACK_TOP) * perspT;
      const scale = Phaser.Math.Linear(0.3, 1.0, perspT);
      const alpha = Phaser.Math.Linear(0.4, 1.0, Math.min(perspT * 2, 1));

      ent.setPosition(x, y);
      ent.setScale(scale);
      ent.setAlpha(alpha);

      // Collision check (only when close to player)
      if (perspT > 0.75 && perspT < 1.0) {
        const playerLane = this.isMoving ? this.targetLane : this.currentLane;
        if (lane === playerLane) {
          if (isObstacle) {
            this.hitObstacle();
            ent.destroy();
            list.splice(i, 1);
          } else {
            this.collectItem(ent);
            list.splice(i, 1);
          }
        }
      }
    }
  }
}
