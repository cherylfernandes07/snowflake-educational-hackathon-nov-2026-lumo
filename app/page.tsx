'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, BrainCircuit, Check, ExternalLink, ImagePlus, Mic, RotateCcw, Search, Settings2, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import LearningCompanion from '@/components/animation/LearningCompanion';
import Link from 'next/link';
import ThinkingChallenge from '@/components/thinking/ThinkingChallenge';
import ThinkingSummary from '@/components/thinking/ThinkingSummary';
import ParentTeacherView from '@/components/thinking/ParentTeacherView';
import DemoExperience from '@/components/thinking/DemoExperience';
import BrainNotebook from '@/components/thinking/BrainNotebook';
import { newBrain, restoreBrain, beliefFlags, teachBrain, evaluateTeaching, brainTransfer } from '@/lib/brain';
import { newThinkingSession, type ThinkingRecord } from '@/lib/thinking/challenges';
import { restoreThinkingSession } from '@/lib/thinking/session';
import { assess, missions, type Evidence } from '@/lib/curriculum';

type Phase = 'choose' | 'guess' | 'plan' | 'investigate' | 'explain' | 'reveal' | 'done';
type Attempt = { mission: number; explanation: string; demo: boolean; conclusion: string; score: number };
const demos = [
  'NASA explains that the Great Wall cannot be seen from the Moon with the unaided eye. Lots of likes do not make a claim true; we need evidence from experts.',
  'The National Weather Service explains that lightning can hit the same place repeatedly. Observations are evidence, unlike a popular saying.'
];
const labels = ['Make a guess', 'Find clues', 'Teach Lumo', 'See what changed'];

export default function Home() {
  const [thinking, setThinking] = useState(newThinkingSession);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [adultView, setAdultView] = useState(false);
  const [sampleDemo, setSampleDemo] = useState(false);
  const [robotBrain, setRobotBrain] = useState(newBrain);
  const beliefs = useMemo(() => beliefFlags(robotBrain), [robotBrain]);
  const [phase, setPhase] = useState<Phase>('choose');
  const [mission, setMission] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [theme, setTheme] = useState('');
  const [themeNote, setThemeNote] = useState('');
  const [query, setQuery] = useState<string>(missions[0].query);
  const [sources, setSources] = useState<Evidence[]>([]);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [searchMode, setSearchMode] = useState('');
  const [reading, setReading] = useState('');
  const [text, setText] = useState('');
  const [guess, setGuess] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [responseMode, setResponseMode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [muted, setMuted] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [settings, setSettings] = useState(false);
  const [brain, setBrain] = useState(false);
  const [presenter, setPresenter] = useState(false);
  const [upload, setUpload] = useState(false);
  const [customClaim, setCustomClaim] = useState('');
  const [customSources, setCustomSources] = useState<Evidence[]>([]);
  const [customMode, setCustomMode] = useState('');
  const [image, setImage] = useState('');
  const [customText, setCustomText] = useState('');
  const [customReply, setCustomReply] = useState('');
  const [ready, setReady] = useState(false);
  const recognition = useRef<{ stop: () => void } | null>(null);
  const m = missions[mission];
  const step = phase === 'guess' ? 0 : phase === 'plan' || phase === 'investigate' ? 1 : phase === 'explain' ? 2 : 3;
  const lastAttempt = attempts.filter(a => a.mission === mission).at(-1);
  const latestLesson = lastAttempt?.conclusion==='false' ? robotBrain.beliefs.find(b=>b.status==='correct'&&b.studentEvidence?.explanation===lastAttempt.explanation) : undefined;

  useEffect(() => {
    try {
      const read = (key:string) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
      const s = read('clumsy-v2');
      const savedThinking = restoreThinkingSession(read('lumo-thinking-v1'));
      if (s && (Array.isArray(s.attempts) && s.attempts.length || s.phase && s.phase !== 'choose') && !savedThinking.before) { savedThinking.baselineUnavailable = true; if(savedThinking.active==='before')savedThinking.active=null; }
      setThinking(savedThinking);
      if (s && ['choose','guess','plan','investigate','explain','reveal','done'].includes(s.phase) && [0,1].includes(s.mission)) {
        setPhase(s.phase); setMission(s.mission); setRobotBrain(restoreBrain(s.brain, s.beliefs));
        setAttempts(s.attempts || []); setSelected(s.selected || null); setSources(s.sources || []);
        setQuery(missions[s.mission as 0 | 1].query);
      }
    } catch { /* A new adventure is always available if storage fails. */ }
    setReady(true);
    return () => recognition.current?.stop();
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem('clumsy-v2', JSON.stringify({ phase, mission, beliefs, brain:robotBrain, attempts, selected, sources })); } catch {}
  }, [ready, phase, mission, beliefs, robotBrain, attempts, selected, sources]);

  useEffect(() => {
    if (ready) try { localStorage.setItem('lumo-thinking-v1', JSON.stringify(thinking)); } catch {}
  }, [ready, thinking]);

  const speech = phase === 'choose' ? 'Hey, I’m Lumo! Be my fact-checking buddy? Pick something you’re curious about.'
    : phase === 'guess' ? (attempts.length ? brainTransfer(robotBrain) : 'I found this claim online. Lots of people shared it… does that make it true?')
    : phase === 'plan' ? 'How could we find out? You’re in charge!'
    : phase === 'investigate' ? 'Let’s hunt for a clue. Who knows a lot about this topic?'
    : phase === 'explain' ? (feedback || 'You found a clue! What does it tell us? Explain it to me in your own words.')
    : phase === 'reveal' ? (latestLesson ? `You taught me: ${latestLesson.correctBelief}` : 'Let’s compare our thinking with the evidence.')
    : 'Thanks, teacher! My best new trick? Asking “what’s the evidence?”';
  useEffect(() => {
    let active = true;
    setSpeaking(false);
    if (!thinking.active && !adultView && !sampleDemo && !muted && !listening && 'speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(speech); u.rate = .94; u.onstart = () => { if (active) setSpeaking(true); }; u.onend = () => { if (active) setSpeaking(false); }; u.onerror = () => { if (active) setSpeaking(false); }; speechSynthesis.speak(u); }
    return () => { active = false; if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  }, [speech, muted, listening, thinking.active, adultView, sampleDemo]);

  function start(index: number) {
    recognition.current?.stop(); setListening(false);
    if (!thinking.before && !thinking.baselineUnavailable && attempts.length === 0) {
      setThinking(t => ({ ...t, active:'before', pendingMission:index })); return;
    }
    if (!thinking.before && attempts.length) setThinking(t => ({ ...t, baselineUnavailable:true }));
    beginMission(index);
  }
  function finishAdventure() {
    recognition.current?.stop(); setListening(false);
    if (!thinking.after) { setThinking(t => ({ ...t, active:'after' })); return; }
    setPhase('done');
  }
  function finishThinking(record: ThinkingRecord) {
    if (thinking.active === 'before') {
      const pending = thinking.pendingMission;
      setThinking(t => ({ ...t, before:record, active:null })); beginMission(pending);
    } else { setThinking(t => ({ ...t, after:record, active:null })); setPhase('done'); }
  }
  function skipThinking() {
    if (thinking.active === 'before') {
      const pending = thinking.pendingMission;
      setThinking(t => ({ ...t, baselineUnavailable:true, active:null })); beginMission(pending);
    } else { setThinking(t => ({ ...t, active:null })); setPhase('done'); }
  }
  function beginMission(index: number) {
    setMission(index); setPhase('guess'); setQuery(missions[index].query); setSources([]); setSelected(null);
    setText(''); setGuess(''); setConclusion(''); setFeedback(''); setNotice(''); setSearchMode(''); setReading('');
  }
  function reset() {
    recognition.current?.stop(); setListening(false); setThinking(newThinkingSession()); setSkillsOpen(false); setPhase('choose'); setMission(0); setRobotBrain(newBrain()); setAdultView(false); setSampleDemo(false);
    setAttempts([]); setSources([]); setSelected(null); setText(''); setNotice(''); setSettings(false); setBrain(false);
    setUpload(false); setImage(''); setCustomClaim(''); setCustomSources([]); setCustomText(''); setCustomReply(''); setThemeNote('');
  }
  function suggestTheme() {
    if (/space|moon|wall|planet|astronaut|china/i.test(theme)) start(0);
    else if (/weather|storm|lightning|thunder|rain|nature/i.test(theme)) start(1);
    else { setThemeNote(`“${theme.trim()}” sounds fun! Explore it below, or pick a ready-to-play adventure.`); setCustomClaim(''); setCustomSources([]); setCustomMode(''); setCustomReply(''); setUpload(true); }
  }
  async function search(custom = false) {
    setBusy(true); setNotice('');
    if(custom) setThinking(t => ({ ...t, baselineUnavailable:t.before ? t.baselineUnavailable : true }));
    try {
      const r = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: custom ? (customClaim || theme) : query, mission, custom }) });
      const d = await r.json();
      if (custom) { setCustomSources(d.sources || []); setCustomMode(d.mode || d.error); }
      else { setSources(d.sources || []); setSearchMode(d.mode || d.error); }
    } catch {
      if (custom) setCustomMode('Search unavailable. No evidence established yet.');
      else { setSources([m.source]); setSearchMode('Preloaded official clue · search unavailable'); }
    } finally { setBusy(false); }
  }
  async function inspect(source: Evidence) {
    setReading('Opening our clue…');
    try { const r = await fetch('/api/source', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: source.url }) }); const d = await r.json(); setReading(`${d.mode}\n\n${d.content || d.error}`); }
    catch { setReading('Couldn’t open the clue here. Use the source link to read it.'); }
  }
  async function teach(demo = false) {
    const explanation = demo ? demos[mission] : text;
    const choice = demo ? 'false' : conclusion;
    if (!explanation.trim() || !choice || !selected) { setNotice('Choose your answer and tell me what your clue shows.'); return; }
    const a = assess(explanation);
    const teaching = evaluateTeaching(explanation, mission, choice, selected);
    setBusy(true); setNotice('');
    if (a.score < 3 || (choice === 'false' && !teaching.supported)) {
      const hint = a.evidence ? 'What does that source show about our claim? Try “My source says… so I think…”' : 'Tell me something from your clue. What did the source say?';
      try {
        const r = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: explanation, beliefs, brain:robotBrain, mission, evidence: [selected] }) });
        const d = await r.json(); setFeedback(d.reply || hint); setResponseMode(d.mode || 'Practice hint');
      } catch { setFeedback(hint); setResponseMode('Curated practice hint'); }
      setBusy(false); return;
    }
    setResponseMode(`${demo ? 'Demonstration input · ' : ''}Verified answer · explanation rubric`);
    setAttempts(v => [...v, { mission, explanation, demo, conclusion: choice, score: a.score }]);
    setRobotBrain(b => teachBrain(b, explanation, mission, choice, selected));
    setPhase('reveal'); setBusy(false);
  }
  function microphone() {
    if (listening) { recognition.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const C = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!C) { setNotice('This browser can’t hear me yet. Type your thoughts instead.'); return; }
    const r = new C(); recognition.current = r; r.lang = 'en-US'; r.interimResults = true;
    r.onresult = (e: any) => setText(Array.from(e.results).map((v: any) => v[0].transcript).join(' '));
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setNotice('Check microphone permission, or type instead.'); };
    try { r.start(); setListening(true); } catch { setNotice('Couldn’t start the microphone. You can type instead.'); }
  }
  async function analyze(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(file.type)) { setNotice('Choose a PNG, JPEG or WebP under 5 MB.'); return; }
    setBusy(true); setNotice('');
    const reader = new FileReader();
    reader.onerror = () => { setBusy(false); setNotice('Couldn’t read the file. Try another image.'); };
    reader.onload = async () => {
      setImage(String(reader.result));
      try { const r = await fetch('/api/vision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: reader.result }) }); const d = await r.json(); setCustomClaim(d.claims?.[0] || ''); setNotice(d.error || d.uncertainty || 'I spotted a claim! It still needs checking.'); }
      catch { setNotice('Couldn’t read that image. Type the claim instead.'); }
      finally { setBusy(false); }
    };
    reader.readAsDataURL(file);
  }

  return <div className="world">
    <header className="topbar">
      <button className="brand" disabled={!!thinking.active} onClick={() => setBrain(true)} aria-label="Lumo’s notebook"><span className="brand-mark"><BrainCircuit size={22}/></span> Lumo<span className="brand-dot">.</span></button>
      <span className="top-caption">Little robot. Big questions.</span>
      {!thinking.active && <div className="tools">{(adultView||sampleDemo)&&<button className="text-button" onClick={() => {setAdultView(false);setSampleDemo(false);}}>Student View <ArrowRight size={15}/></button>}<button className="round-button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn speech on' : 'Mute speech'}>{muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button><button className="round-button" aria-label="Settings" onClick={() => setSettings(!settings)}><Settings2 size={20}/></button></div>}
      {!thinking.active && settings && <div className="settings-popover"><button onClick={() => setPresenter(!presenter)}><Sparkles size={16}/> Presenter mode <b>{presenter ? 'On' : 'Off'}</b></button><button onClick={() => { setBrain(true); setSettings(false); }}><BrainCircuit size={16}/> Lumo’s notebook</button><button onClick={() => { setUpload(true); setSettings(false); setNotice(''); }}><ImagePlus size={16}/> Bring your own claim</button><button onClick={() => { setSkillsOpen(true); setSettings(false); }}><BrainCircuit size={16}/> Lumo Thinking Skills</button><button onClick={() => { setAdultView(true); setSettings(false); }}><BrainCircuit size={16}/> Parent/Teacher View</button><button onClick={() => { setSampleDemo(true); setSettings(false); }}><Sparkles size={16}/> Run 90-second sample demo</button><Link className="settings-link" href="/animation-lab"><Sparkles size={16}/> Animation playground</Link><button disabled={busy} onClick={reset}><RotateCcw size={16}/> Start over</button></div>}
    </header>

    {!thinking.active && !adultView && !sampleDemo && phase !== 'choose' && phase !== 'done' && <div className="journey"><button aria-label="Back to themes" onClick={() => setPhase('choose')}><ArrowLeft size={18}/></button><div className="journey-dots">{labels.map((l,i) => <span key={l} className={i <= step ? 'lit' : ''} title={l}/>)}</div><span>{labels[step]}</span><button aria-label="Open notebook" onClick={() => setBrain(true)}><BrainCircuit size={19}/></button></div>}

    <main className={`playground ${thinking.active || adultView || sampleDemo ? 'thinking-mode' : ''} ${phase === 'choose' ? 'welcome' : ''}`}>
      {adultView ? <ParentTeacherView session={thinking} brain={robotBrain} practice={attempts}/> : sampleDemo ? <DemoExperience/> : thinking.active ? <ThinkingChallenge key={thinking.active} kind={thinking.active} draft={thinking.active === 'before' ? thinking.beforeDraft : thinking.afterDraft} onDraft={draft => setThinking(t => ({ ...t, [t.active === 'before' ? 'beforeDraft' : 'afterDraft']:draft }))} onComplete={finishThinking} onSkip={skipThinking}/> : phase === 'choose' ? <>
        <div className="welcome-character"><span className="hello-tag">YOUR NEW FACT-CHECKING BUDDY</span><LearningCompanion coreState={speaking ? 3 : 0} emotion={2} gesture={1} speaking={speaking}/><span className="doodle doodle-one">?</span><span className="doodle doodle-two">✧</span></div>
        <div className="welcome-copy"><span className="eyebrow">YOU’RE THE TEACHER</span><h1>My brain needs<br/>a human like you.</h1><p>I find big claims. You help me check them.<br/>What should we explore?</p>
          <div className="theme-choices"><button className="theme-card space" onClick={() => start(0)}><span className="theme-art">🪐</span><span>Space<small>A view from the Moon</small></span><ArrowRight size={19}/></button><button className="theme-card weather" onClick={() => start(1)}><span className="theme-art">⚡</span><span>Wild weather<small>A shocking mystery</small></span><ArrowRight size={19}/></button></div>
          <form className="theme-input" onSubmit={e => { e.preventDefault(); if (theme.trim()) suggestTheme(); }}><input aria-label="Suggest a theme" placeholder="Or suggest something you’re curious about…" value={theme} onChange={e => setTheme(e.target.value)} maxLength={160}/><button aria-label="Explore my theme" disabled={!theme.trim()}><ArrowRight size={19}/></button></form>
        </div>
      </> : phase === 'done' ? <section className="celebration"><span className="eyebrow">HIGH FIVE, HUMAN!</span><h1>You made my brain<br/>a little brighter.</h1><LearningCompanion coreState={speaking ? 3 : 6} emotion={2} gesture={1} speaking={speaking}/><p>We checked {new Set(attempts.map(a => a.mission)).size} {new Set(attempts.map(a => a.mission)).size === 1 ? 'claim' : 'claims'} together.</p><div className="learned-sticker"><Check size={19}/> {beliefs.evidence ? 'Look for evidence before believing a claim.' : 'Compare your answer with the evidence.'}</div><details><summary>Practice notebook (with Lumo’s help)</summary>{attempts.map((a,i) => <div className="attempt" key={i}><b>{missions[a.mission].title}</b><p>{a.explanation}</p><small>{a.demo ? 'Demonstration input · independent reasoning not assessed' : `Coached practice rubric: ${a.score}/3 · ${a.conclusion === 'false' ? 'conclusion matches evidence' : 'conclusion needs another look'}`}</small></div>)}<p className="fine-print">A simple practice rubric, not a measure of mastery.</p></details><ThinkingSummary session={thinking} onTryFinal={() => setThinking(t => ({ ...t, active:'after' }))}/><button className="primary" onClick={() => { setPhase('choose'); setTheme(''); }}>Another adventure <ArrowRight size={18}/></button><button className="text-button" onClick={reset}>Start fresh</button></section> : <>
        <section className="companion"><div className="speech-bubble" aria-live="polite"><span>LUMO</span><p>{busy ? 'Hunting for clues…' : speech}</p></div><LearningCompanion coreState={listening ? 1 : busy ? 2 : speaking ? 3 : phase === 'reveal' ? (lastAttempt?.conclusion === 'false' ? 5 : 7) : phase === 'investigate' ? 4 : phase === 'explain' ? 1 : phase === 'plan' ? 2 : 7} emotion={phase === 'reveal' ? 2 : phase === 'explain' ? 2 : 1} gesture={phase === 'investigate' ? 4 : phase === 'reveal' ? 2 : 0} speaking={speaking}/><span className="companion-caption">{phase === 'reveal' ? 'One curious brain, growing.' : 'Powered by curiosity. And you.'}</span></section>
        <section className="activity" key={phase}>
          {phase === 'guess' && <><span className="eyebrow">I FOUND SOMETHING…</span><div className={`claim-illustration ${mission === 1 ? 'storm' : ''}`}><span>{mission === 0 ? '🌖' : '🌩️'}</span><i>✦</i><b>{mission === 0 ? 'SPACE FILES' : 'WEATHER FILES'}</b></div><div className="claim-meta"><span className="status unknown">? NOT VERIFIED</span><small>Fictional practice claim</small></div><h1 className="claim-heading">{m.claim}</h1><p className="prompt">What’s your first hunch?</p><div className="answer-choices">{[['true','Sounds true'],['false','Sounds false'],['unsure','I’m not sure']].map(([value,label]) => <button className={guess === value ? 'chosen' : ''} key={value} onClick={() => setGuess(value)}>{label}</button>)}</div><button className="primary" disabled={!guess} onClick={() => setPhase('plan')}>Let’s find out <ArrowRight size={18}/></button></>}
          {phase === 'plan' && <><span className="eyebrow">PICK OUR NEXT MOVE</span><h1>Where’s the proof?</h1><div className="plan-choices"><button onClick={() => setNotice('Likes show that something is popular. They don’t show whether it’s true. Try another move!')}><span>♡</span>Count the likes<ArrowRight size={18}/></button><button onClick={() => { setPhase('investigate'); setNotice(''); }}><span><Search size={25}/></span>Find a source that knows<ArrowRight size={18}/></button><button onClick={() => setNotice('Even a confident robot can be wrong. Let’s find some evidence!')}><span>✧</span>Trust a confident robot<ArrowRight size={18}/></button></div></>}
          {phase === 'investigate' && <><span className="eyebrow">CLUE HUNT</span><h1>Let’s ask the experts.</h1><p className="short-claim">“{m.claim}”</p><form className="search-box" onSubmit={e => { e.preventDefault(); void search(); }}><Search size={18}/><input aria-label="Search for a clue" value={query} onChange={e => setQuery(e.target.value)}/><button className="primary" disabled={busy}>Search</button></form>
          {!sources.length && <div className="empty-clues"><span>🔎</span><p>Your first clue is one search away.</p></div>}
          {searchMode && <small className="service-label">{searchMode}</small>}{sources.length>0&&<p className="source-caution">A source can know a lot. Does its evidence fit this claim?</p>}
          <div className="clue-list">{sources.map(s => <article className={`clue-card ${selected?.url === s.url ? 'selected' : ''}`} key={s.url}><small>{s.publisher}{s.date ? ` · ${s.date.slice(0,10)}` : ''}</small><h2>{s.title}</h2><p>{s.excerpt.slice(0,220)}</p><div><button className="text-button" onClick={() => { setSelected(s); void inspect(s); }}>{selected?.url === s.url ? <Check size={16}/> : <Search size={16}/>} {selected?.url === s.url ? 'Clue collected' : 'Read this clue'}</button><a aria-label={`Open ${s.title}`} href={s.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/></a></div></article>)}</div>
          {reading && <details className="reading" open><summary>Inside the source</summary><p>{reading}</p></details>}{selected && <button className="primary" onClick={() => { setPhase('explain'); setNotice(''); }}>I’ve got a clue! <ArrowRight size={18}/></button>}
          {presenter && <button className="demo-button" onClick={() => { setSources([m.source]); setSelected(m.source); setSearchMode('Preloaded official clue · presenter mode'); }}>Load official demo clue</button>}</>}
          {phase === 'explain' && <><span className="eyebrow">YOUR TURN, TEACHER</span><h1>Connect the dots.</h1><div className="collected-source"><Check size={17}/><span>Your clue: {selected?.publisher}</span><a href={selected?.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/></a></div><details className="reading"><summary>Look at my clue again</summary><p>{selected?.excerpt}</p></details><p className="prompt">So, is our claim true?</p><div className="answer-choices">{[['true','True'],['false','False'],['unsure','Not enough proof']].map(([v,l]) => <button className={conclusion === v ? 'chosen' : ''} key={v} onClick={() => setConclusion(v)}>{l}</button>)}</div><label htmlFor="explanation">What did your clue show you?</label><div className="composer"><textarea id="explanation" value={text} maxLength={4000} onChange={e => setText(e.target.value)} placeholder="My source says… so I think…" rows={3}/><button className={listening ? 'mic listening' : 'mic'} aria-label={listening ? 'Stop microphone' : 'Speak to Lumo'} onClick={microphone}><Mic size={18}/>{listening ? 'Listening…' : 'Say it out loud'}</button></div><button className="primary" disabled={busy || !text.trim() || !conclusion} onClick={() => void teach()}>Teach Lumo <Sparkles size={18}/></button>{responseMode && <small className="service-label">{responseMode}</small>}{presenter && <button className="demo-button" disabled={busy} onClick={() => void teach(true)}>Use a demonstration explanation</button>}</>}
          {phase === 'reveal' && <><span className="eyebrow">MYSTERY SOLVED</span><span className="status incorrect"><X size={15}/> INCORRECT CLAIM</span><h1>{m.answer}</h1><p className="reveal-detail">{m.detail}</p><a className="source-link" href={m.source.url} target="_blank" rel="noopener noreferrer">{m.source.publisher} · See the evidence <ExternalLink size={14}/></a><div className="learned-sticker"><Check size={21}/><span><small>{lastAttempt?.conclusion === 'false' ? 'YOU CONNECTED THE CLUES' : 'HERE’S WHAT TO REMEMBER'}</small>{beliefs.evidence ? 'Evidence beats a popular guess.' : 'Check what the source actually shows.'}</span></div>{lastAttempt?.conclusion === 'false' && robotBrain.beliefs.filter(b => b.status==='correct' && b.studentEvidence?.explanation===lastAttempt.explanation).slice(0,1).map(b=><div className="brain-change" key={`${b.id}-${b.studentEvidence?.taughtAt}`}><small>YOU CHANGED MY THINKING</small><p className="old-rule">× INCORRECT: {b.originalBelief}</p><p className="new-rule">✓ CORRECT: {b.correctBelief}</p></div>)}{responseMode && <small className="service-label">{responseMode}</small>}<button className="primary" onClick={() => { if (!attempts.some(a => a.mission === 1 - mission)) start(1 - mission); else finishAdventure(); }}>{attempts.some(a => a.mission === 1 - mission) ? 'See our adventure' : 'Try my new brain'} <ArrowRight size={18}/></button><button className="text-button" onClick={finishAdventure}>Finish for now</button></>}
          {notice && <p className="notice" role="status">{notice}</p>}
        </section>
      </>}
    </main>
    {!thinking.active && !adultView && !sampleDemo && <footer><span>Curiosity is your superpower.</span><button onClick={() => { setUpload(true); setNotice(''); }}>Bring your own mystery <ImagePlus size={15}/></button></footer>}

    {!thinking.active && !adultView && !sampleDemo && skillsOpen && <div className="modal-backdrop" onClick={() => setSkillsOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-label="Thinking Skills notebook" onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Close Thinking Skills" onClick={() => setSkillsOpen(false)}><X/></button><ThinkingSummary session={thinking} onTryFinal={attempts.length ? () => { setSkillsOpen(false); setThinking(t => ({...t,active:'after'})); } : undefined}/></section></div>}
    {!thinking.active && !adultView && !sampleDemo && brain && <div className="modal-backdrop" onClick={() => setBrain(false)}><section className="notebook modal" role="dialog" aria-modal="true" aria-label="Lumo’s notebook" onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Close notebook" onClick={() => setBrain(false)}><X/></button><BrainCircuit size={32}/><BrainNotebook brain={robotBrain}/></section></div>}
    {!thinking.active && !adultView && !sampleDemo && upload && <div className="modal-backdrop" onClick={() => setUpload(false)}><section className="modal explorer" role="dialog" aria-modal="true" aria-label="Your own mystery" onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Close explorer" onClick={() => setUpload(false)}><X/></button><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h2>A mystery of your own.</h2>{themeNote && <p>{themeNote}</p>}<p>Type a claim or bring a screenshot. Leave out names and personal details.</p><label className="file-label"><ImagePlus size={18}/> Add a screenshot<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => void analyze(e.target.files?.[0])}/></label>{image && <img className="image-preview" src={image} alt="Your screenshot"/>}<label htmlFor="custom-claim">What should we investigate?</label><input id="custom-claim" placeholder={theme || 'A claim you’re curious about…'} value={customClaim} onChange={e => setCustomClaim(e.target.value)}/><button className="primary" disabled={busy || !(customClaim || theme).trim()} onClick={() => void search(true)}>Find clues <Search size={17}/></button>{notice && <p className="notice">{notice}</p>}{customMode && <small className="service-label">{customMode}</small>}{customSources.map(s => <article className="clue-card" key={s.url}><small>{s.publisher}</small><h2>{s.title}</h2><p>{s.excerpt.slice(0,300)}</p><a href={s.url} target="_blank" rel="noopener noreferrer">Read the source <ExternalLink size={14}/></a></article>)}{customSources.length > 0 && <><label htmlFor="custom-explanation">What do you think of these clues?</label><textarea id="custom-explanation" value={customText} onChange={e => setCustomText(e.target.value)}/><button className="primary" disabled={busy || !customText.trim()} onClick={async () => { setBusy(true); try { const r = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: customText, customClaim: customClaim || theme, beliefs, brain:robotBrain, evidence: customSources }) }); const d = await r.json(); setCustomReply(`${d.reply} (${d.mode})`); } catch { setCustomReply('Which source has relevant expertise? What evidence does it offer? Curated hint.'); } finally { setBusy(false); } }}>Ask Lumo <ArrowRight size={17}/></button>{customReply && <p className="notice">{customReply}</p>}</>}<p className="fine-print">? NOT VERIFIED · We need enough evidence before giving this a verdict. Ready-to-play adventures have verified answer keys.</p></section></div>}
  </div>;
}
