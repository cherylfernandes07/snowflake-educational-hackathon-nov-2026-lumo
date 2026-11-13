import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clampInput, numericNames, defaults, characterEvents, inputSpec } from '../lib/animation/contract';
import { rms, smoothEnvelope, amplitudeToMouth, createMouthDriver } from '../lib/animation/mouth-driver';

test('every numeric contract input clamps, rounds enums, and rejects non-finite values', () => {
  for (const name of numericNames) {
    const spec = inputSpec[name];
    assert.equal(clampInput(name, -999), spec.min);
    assert.equal(clampInput(name, 999), spec.max);
    assert.equal(clampInput(name, NaN), defaults[name]);
  }
  assert.equal(clampInput('coreState', 2.8), 3);
  assert.equal(clampInput('lookX', .27), .27);
  assert.ok(!characterEvents.includes('core_idle_done'));
  assert.ok(characterEvents.includes('core_learn_done'));
});

test('mouth envelope removes DC, rejects noise, clamps, and uses fast attack / slow release', () => {
  assert.equal(rms(new Float32Array([.5,.5,.5])), 0);
  assert.ok(Math.abs(rms(new Float32Array([.5,-.5])) - .5) < .0001);
  assert.equal(amplitudeToMouth(.005), 0);
  assert.equal(amplitudeToMouth(100), 1);
  assert.equal(smoothEnvelope(.4,.8,0), .4);
  assert.ok(smoothEnvelope(0,1,35) > .6);
  assert.ok(smoothEnvelope(1,0,35) > .7);
});

test('mouth driver follows a connected analyser, eases after silence, overrides, and disposes', async () => {
  const oldRequest = globalThis.requestAnimationFrame;
  const oldCancel = globalThis.cancelAnimationFrame;
  let id = 0, now = performance.now(), amplitude = .12;
  const queue = new Map<number, FrameRequestCallback>();
  globalThis.requestAnimationFrame = fn => { queue.set(++id, fn); return id; };
  globalThis.cancelAnimationFrame = i => { queue.delete(i); };
  const values: number[] = [];
  const analyser = {
    context: { state:'running' }, fftSize:32,
    getFloatTimeDomainData(samples: Float32Array) { samples.forEach((_, i) => { samples[i] = i % 2 ? amplitude : -amplitude; }); },
  } as unknown as AnalyserNode;
  const tick = (frames:number) => { for (let i=0;i<frames;i++) { now += 16.67; const callbacks=[...queue.values()]; queue.clear(); callbacks.forEach(fn => fn(now)); } };
  const driver = createMouthDriver({ analyser, onMouthOpen:v => values.push(v) });
  try {
    await driver.start(); tick(20);
    assert.ok(values.at(-1)! > .8);
    amplitude = 0; tick(80);
    assert.equal(values.at(-1), 0);
    driver.setMouthOpen(.4); tick(40);
    assert.equal(values.at(-1), .4);
    assert.ok(values.every(v => v >= 0 && v <= 1));
    driver.setMouthOpen(9); tick(40); assert.equal(values.at(-1),1);
    driver.stop(); tick(100); assert.equal(values.at(-1),0); assert.equal(queue.size,0);
    driver.dispose(); driver.dispose(); assert.equal(queue.size,0);
    await assert.rejects(driver.start(), /disposed/);
  } finally { driver.dispose(); globalThis.requestAnimationFrame = oldRequest; globalThis.cancelAnimationFrame = oldCancel; }
});

test('motion sheets cover exactly eight cores and seven overlays and stay under 200 words each', () => {
  const document = readFileSync(new URL('../docs/animation/03-motion-sheets.md', import.meta.url), 'utf8');
  const sheets = document.split(/^## /m).slice(1);
  assert.equal(sheets.length,15);
  sheets.forEach(sheet => assert.ok(sheet.trim().split(/\s+/).length < 200, sheet.split('\n')[0]));
});
