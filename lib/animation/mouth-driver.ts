/** Audio-amplitude mouth driver. Browser-only creation/start; envelope math is testable. */
export function rms(samples: Float32Array): number {
  if (!samples.length) return 0;
  let mean = 0; for (const sample of samples) mean += sample; mean /= samples.length;
  let total = 0; for (const sample of samples) total += (sample - mean) ** 2;
  return Math.sqrt(total / samples.length);
}
export function smoothEnvelope(current: number, target: number, dtMs: number): number {
  const tau = target > current ? 35 : 140;
  return current + (target - current) * (1 - Math.exp(-Math.max(0, dtMs) / tau));
}
export function amplitudeToMouth(amplitude: number): number {
  // Small noise floor, then gentle compression. Not phoneme recognition.
  return Math.min(1, Math.max(0, Math.sqrt(Math.max(0, amplitude - .012)) * 3));
}
type AudioGraph = { context: AudioContext; analyser: AnalyserNode; source: MediaElementAudioSourceNode };
const mediaGraphs = new WeakMap<HTMLAudioElement, AudioGraph>();
function graphFor(audio: HTMLAudioElement): AudioGraph {
  const cached = mediaGraphs.get(audio); if (cached) { if (cached.context.state === 'closed') throw new Error('Use a fresh audio element after disposing its audio graph.'); return cached; }
  const context = new AudioContext();
  const analyser = context.createAnalyser(); analyser.fftSize = 1024;
  const source = context.createMediaElementSource(audio);
  source.connect(analyser); analyser.connect(context.destination);
  const graph = { context, analyser, source }; mediaGraphs.set(audio, graph); return graph;
}
export type MouthDriverOptions = {
  audio?: HTMLAudioElement;
  analyser?: AnalyserNode;
  onMouthOpen: (value: number) => void;
};
/** One active driver per element. start() must be called from a user gesture. */
export function createMouthDriver(options: MouthDriverOptions) {
  let frame = 0, generation = 0, disposed = false;
  let mode: 'auto' | 'manual' | 'closing' = 'closing';
  let value = 0, manualTarget = 0, lastTime = 0, lastSound = 0;
  let analyser = options.analyser;
  let ownedGraph: AudioGraph | undefined;
  let samples = new Float32Array(analyser?.fftSize || 1024);
  const cancel = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
  const loop = (time: number) => {
    frame = 0;
    const dt = lastTime ? Math.min(100, time - lastTime) : 16.67; lastTime = time;
    let target = mode === 'manual' ? manualTarget : 0;
    if (mode === 'auto' && analyser) {
      if (samples.length !== analyser.fftSize) samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      const amplitude = rms(samples);
      if (amplitude > .012) lastSound = time;
      target = amplitudeToMouth(amplitude);
      if (time - lastSound >= 300 || (options.audio && (options.audio.paused || options.audio.ended))) target = 0;
    }
    value = smoothEnvelope(value, target, dt);
    if (Math.abs(value - target) < .001) value = target;
    options.onMouthOpen(value);
    if (mode !== 'closing' || value > 0) frame = requestAnimationFrame(loop);
  };
  const ensureFrame = () => { if (!frame && !disposed) { lastTime = 0; frame = requestAnimationFrame(loop); } };
  return {
    async start() {
      if (disposed) throw new Error('Mouth driver has been disposed.');
      const token = ++generation;
      if (!analyser) {
        if (!options.audio) throw new Error('Provide an HTMLAudioElement or a connected AnalyserNode.');
        const graph = graphFor(options.audio); ownedGraph = graph; await graph.context.resume(); analyser = graph.analyser;
      } else {
        // A supplied graph belongs to the caller; resume it without rewiring it.
        if (analyser.context.state === 'suspended') await (analyser.context as AudioContext).resume();
      }
      if (token !== generation || disposed) return;
      mode = 'auto'; lastSound = performance.now(); ensureFrame();
    },
    stop() { generation++; mode = 'closing'; ensureFrame(); },
    /** Manual override stays active until start(). Values still interpolate per frame. */
    setMouthOpen(v: number) {
      generation++; manualTarget = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
      mode = 'manual'; ensureFrame();
    },
    dispose() { if (disposed) return; generation++; disposed = true; cancel(); value = 0; options.onMouthOpen(0); if (ownedGraph) { ownedGraph.source.disconnect(); ownedGraph.analyser.disconnect(); void ownedGraph.context.close(); } },
  };
}
