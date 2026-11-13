import { useEffect, useRef, useState, useCallback } from 'react';

export default function LumaBlob() {
  const [volume, setVolume] = useState(0);
  const [listening, setListening] = useState(false);
  const [wobble, setWobble] = useState({ r1: 50, r2: 50 });
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);

  const loop = useCallback(() => {
    if (!analyserRef.current) return;
    rafRef.current = requestAnimationFrame(loop);

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = Math.min(data.reduce((a, b) => a + b, 0) / data.length, 80);

    const t = Date.now() / 1000;
    setVolume(avg);
    setWobble({
      r1: 50 + avg * 0.3 + Math.sin(t * 2.1) * avg * 0.08,
      r2: 50 - avg * 0.2 + Math.cos(t * 1.7) * avg * 0.06,
    });
  }, []);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      loop();
    } catch (e) {
      console.error('Mic blocked', e);
    }
  }, [loop]);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    setListening(false);
    setVolume(0);
    setWobble({ r1: 50, r2: 50 });
  }, []);

  useEffect(() => () => stopMic(), [stopMic]);

  const scale = 1 + volume * 0.01;
  const glow = volume * 1.2;
  const { r1, r2 } = wobble;

  const blobStyle = listening
    ? {
        transform: `scale(${scale})`,
        borderRadius: `${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%`,
        boxShadow: `0 0 ${glow + 20}px rgba(124,111,255,0.6), 0 0 ${glow * 2 + 40}px rgba(124,111,255,0.25)`,
        animation: 'none',
      }
    : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Blob */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: '#7c6fff',
          transition: 'box-shadow 0.1s ease',
          animation: listening ? 'none' : 'breathe 3s ease-in-out infinite',
          ...blobStyle,
        }}
      />

      {/* Status */}
      <p style={{ color: listening ? '#7c6fff' : '#6b6888', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {listening ? 'listening…' : 'idle'}
      </p>

      {/* Button */}
      <button
        onClick={listening ? stopMic : startMic}
        style={{
          padding: '10px 24px',
          borderRadius: 100,
          border: `1.5px solid ${listening ? '#f472b6' : '#6b6888'}`,
          background: 'transparent',
          color: listening ? '#f472b6' : 'inherit',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {listening ? '🔴 Stop' : '🎤 Start listening'}
      </button>

      {/* Breathing animation */}
      <style>{`
        @keyframes breathe {
          0%,100% { transform: scale(1); border-radius: 50%; }
          50%      { transform: scale(1.06); border-radius: 46% 54% 54% 46% / 50%; }
        }
      `}</style>
    </div>
  );
}