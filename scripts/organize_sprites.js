import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');

const characters = {
  polar: {
    base: path.join(ROOT, 'public/assets/character/polar/FAT ANIMAL POLAR/Animation PNG/POLAR/NUDE'),
    prefix: 'FA_PANDA',
  },
  teddy: {
    base: path.join(ROOT, 'public/assets/character/teddy/FAT ANIMAL TEDDY/Animation PNG/TEDDY/NUDE'),
    prefix: 'FA_TEDDY',
  },
};

const animations = [
  { name: 'run',  folder: '04-Run',         sub: null,          fileKey: 'Run',     max: 10 },
  { name: 'idle', folder: '01-Idle/01-Idle', sub: null,          fileKey: 'Idle',    max: 8  },
  { name: 'hurt', folder: '07-Hurt/01-Hurt', sub: null,          fileKey: 'Hurt',    max: 6  },
  { name: 'dead', folder: '08-Dead',         sub: null,          fileKey: 'Dead',    max: 10 },
  { name: 'jump', folder: '06-Jump/01-Jump_Up', sub: null,       fileKey: 'Jump_UP', max: 5  },
];

let copied = 0;

for (const [charKey, charInfo] of Object.entries(characters)) {
  for (const anim of animations) {
    const srcDir = path.join(charInfo.base, anim.folder);
    const dstDir = path.join(ROOT, 'public/sprites', charKey, anim.name);

    fs.mkdirSync(dstDir, { recursive: true });

    for (let i = 0; i < anim.max; i++) {
      const srcName = `${charInfo.prefix}_${anim.fileKey}_${String(i).padStart(3, '0')}.png`;
      const srcPath = path.join(srcDir, srcName);
      const dstPath = path.join(dstDir, `${i}.png`);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, dstPath);
        copied++;
      } else {
        console.warn(`Missing: ${srcPath}`);
      }
    }
  }
}

console.log(`Done! Copied ${copied} sprite frames.`);
