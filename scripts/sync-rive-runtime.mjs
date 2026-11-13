import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('public/animation', { recursive: true });
await copyFile('node_modules/@rive-app/canvas/rive.wasm', 'public/animation/rive.wasm');
console.log('Synced the installed official Rive WASM runtime.');
