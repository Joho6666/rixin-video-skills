// 锐新三号 · neon teardown scene library (data-driven version of the client-approved 智能药盒拆解_配音版).
// One script JSON = one video. NeonVideo = 1920x1080, NeonVertical = 1080x1920 wrapper (same timing, same audio).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {LongCtx, LongTiming} from '../long/timing';
import {FONT, Icon, Robot, ease, pop} from '../long/common';
import {BG, TEAL, ORANGE, BLUE, TXT, DIM, DarkBg, SceneWrap, Tag, Head, Foot, NodeC, Box, Wire, Mono, Zig, Pill} from '../long/Teardown';

export const NFPS = 30;
const s = (sec: number) => Math.round(sec * NFPS);
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const COLORS: Record<string, string> = {teal: TEAL, orange: ORANGE, blue: BLUE};
const col = (c?: string, i = 0) => COLORS[c ?? ''] ?? [TEAL, ORANGE, BLUE, ORANGE, TEAL][i % 5];

export type NBeat = {id: string; text: string; say?: string};
export type NScene = {id: string; type: string; min?: number; sfx?: string; beats: NBeat[]; [k: string]: any};
export type NScript = {voDir: string; meta: {title: string; vTitle?: string; brand?: string}; scenes: NScene[]};

/* ---------- timing (identical rules to the approved cut) ---------- */
export const buildTiming = (script: NScript, vo: Record<string, number>, env: Record<string, number[]>) => {
  const LEAD = 0.25, GAP = 0.12, TAIL = 0.4;
  let cursor = 0;
  const beats: {id: string; text: string; from: number; dur: number}[] = [];
  const scenes = script.scenes.map((sc) => {
    const start = cursor;
    let t = start + s(LEAD);
    sc.beats.forEach((b) => { const d = s((vo[b.id] ?? 2) + GAP); beats.push({id: b.id, text: b.text, from: t, dur: d}); t += d; });
    const dur = Math.max(s(sc.min ?? 3), t + s(TAIL) - start);
    cursor = start + dur;
    return {sc, from: start, dur, beats: sc.beats.map((b) => (beats.find((x) => x.id === b.id)!.from - start))};
  });
  const tm: LongTiming = {pages: [], beats: beats.map((b, i) => ({id: b.id, from: b.from, dur: b.dur, page: 0, idx: i})), total: cursor, env, voDir: script.voDir};
  return {scenes, beats, total: cursor, tm};
};
export type NTiming = ReturnType<typeof buildTiming>;
/** Cue list for fcc-video/mix_music.py (VOICE=1). */
export const neonCues = (t: NTiming) => ({total: t.total / NFPS, shots: t.scenes.map((x, i) => ({from: x.from / NFPS, sfx: x.sc.sfx ?? (i === 0 ? 'boom' : x.sc.type === 'chapter' ? 'boom' : x.sc.type === 'outro' ? 'ping' : 'whoosh')}))});

type SP = {f: number; sc: NScene; b: number[]};
const Hl: React.FC<{t: string; c?: string}> = ({t, c = ORANGE}) => <>{t.split(/(【[^】]*】)/).filter(Boolean).map((r, i) => r.startsWith('【') ? <span key={i} style={{color: c}}>{r.slice(1, -1)}</span> : <span key={i}>{r}</span>)}</>;

/* ---------- scene types ---------- */
const STitle: React.FC<SP> = ({f, sc}) => {
  const a = pop(f, 4, 12), b = ease(f, 16, 12), c = pop(f, 30, 14), line = ease(f, 40, 16);
  return (
    <>
      <Tag t={sc.tag ?? 'STM32 / GRADUATION PROJECT / TEARDOWN'} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 120, fontWeight: 900, color: ORANGE, transform: `scale(${a})`, textShadow: `0 0 40px ${ORANGE}66`}}>{sc.title}</div>
        <div style={{fontSize: 48, fontWeight: 900, color: TXT, marginTop: 18, opacity: b}}>{sc.sub}</div>
        {sc.question && <div style={{fontSize: 76, fontWeight: 900, color: ORANGE, marginTop: 26, opacity: Math.min(1, c), transform: `scale(${0.7 + 0.3 * c})`, letterSpacing: 10}}>{sc.question}</div>}
        <div style={{margin: '26px auto 0', width: 420 * line, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${TEAL})`, borderRadius: 2}} />
      </div>
    </>
  );
};

/** Product photo with numbered callouts. `img` under public/, `imgW` its pixel width, callout x/y in image pixels. */
const SKit: React.FC<SP> = ({f, sc}) => {
  const KS = 1360 / (sc.imgW ?? 1672), KX = 520, KY = 160;
  const ph = ease(f, 0, 14);
  const flash = interpolate(f, [0, 3, 12], [0, 0.8, 0], {extrapolateRight: 'clamp'});
  const items = sc.callouts as {t: string; sub: string; x: number; y: number; c?: string}[];
  const step = Math.min(92, 830 / Math.max(1, items.length));
  return (
    <>
      <AbsoluteFill style={{background: '#D9DDE2'}} />
      <Img src={staticFile(sc.img)} style={{position: 'absolute', left: KX, top: KY, width: 1360, opacity: ph, transform: `scale(${1.08 - 0.08 * ph})`, transformOrigin: '60% 50%'}} />
      {items.map((c, i) => {
        const at = s(1.6) + i * 9, p = ease(f, at, 10), ly = 150 + i * step;
        const px = KX + c.x * KS, py = KY + c.y * KS, cc = col(c.c, i);
        return (
          <React.Fragment key={c.t}>
            <Wire pts={[[440, ly + 22], [480, ly + 22], [px, py]]} c={cc} p={ease(f, at + 4, 10)} f={f} dot={false} w={2.5} />
            {p >= 1 && <div style={{position: 'absolute', left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: 9, background: cc, border: '3px solid #fff', boxShadow: `0 0 12px ${cc}`}} />}
            <div style={{position: 'absolute', left: 40, top: ly, width: 400, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, fontFamily: FONT}}>
              <div style={{fontSize: 28, fontWeight: 900, color: '#14202E', borderLeft: `6px solid ${cc}`, paddingLeft: 12}}>{c.t}</div>
              <div style={{fontSize: 19, fontWeight: 700, color: '#4E5D70', paddingLeft: 18, marginTop: 2}}>{c.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      {sc.label && <div style={{position: 'absolute', right: 40, top: 80, fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#fff', background: '#14202E', borderRadius: 10, padding: '8px 20px', opacity: ease(f, s(1.6), 10)}}>{sc.label}</div>}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </>
  );
};

/** Real project photo from the web, credited ("图源"). Photo right in a neon frame, points left. */
const SReal: React.FC<SP> = ({f, sc}) => {
  const p = ease(f, 2, 16);
  const pts = (sc.points ?? []) as string[];
  return (
    <>
      <Tag t={sc.tag ?? 'REAL PROJECT / REFERENCE'} />
      <Head t={sc.title} f={f} size={46} />
      <div style={{position: 'absolute', left: 820, top: 170, width: 1000, height: 640, borderRadius: 18, overflow: 'hidden', border: `3px solid ${TEAL}`, boxShadow: `0 0 36px ${TEAL}55`, opacity: p, transform: `scale(${0.95 + 0.05 * p})`, background: '#0A1018'}}>
        <Img src={staticFile(sc.img)} style={{width: '100%', height: '100%', objectFit: sc.fit ?? 'contain', transform: `scale(${1 + 0.04 * Math.min(1, f / 200)})`}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 16px', background: 'linear-gradient(0deg, rgba(0,0,0,0.75), transparent)', fontFamily: FONT, fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)'}}>图源：{sc.credit}</div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 230, width: 680}}>
        <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 800, color: TEAL, letterSpacing: 3, opacity: ease(f, 8, 10)}}>{sc.kicker ?? '真实作品参考'}</div>
        {pts.map((t, i) => (
          <div key={t} style={{display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 28, opacity: ease(f, 16 + i * 14, 10), transform: `translateX(${(1 - ease(f, 16 + i * 14, 10)) * -24}px)`}}>
            <div style={{width: 40, height: 40, borderRadius: 20, border: `2px solid ${ORANGE}`, color: ORANGE, fontFamily: FONT, fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 900, color: TXT, lineHeight: 1.35}}><Hl t={t} /></div>
          </div>
        ))}
      </div>
      {sc.foot && <Foot t={sc.foot} f={f} at={60} />}
    </>
  );
};

/** Five-layer ring: nodes[0] left, [1] centre (bigger), [2] top, [3] bottom, [4] right. */
const SLayers: React.FC<SP> = ({f, sc}) => {
  const n = (i: number) => pop(f, 8 + i * 10, 12), w = (i: number) => ease(f, 14 + i * 10, 12);
  const N = sc.nodes as {icon: string; t: string; sub?: string; c?: string}[];
  const P: [number, number, number?][] = [[300, 520], [790, 520, 70], [1180, 300], [1180, 760], [1600, 520]];
  return (
    <>
      <Tag t={sc.tag ?? 'SYSTEM / ARCHITECTURE EXPLODED VIEW'} />
      <Head t={sc.title} f={f} />
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(-70px)'}}>
        <Wire pts={[[360, 520], [760, 520]]} c={TEAL} p={w(0)} f={f} />
        <Wire pts={[[820, 470], [900, 330], [1120, 300]]} c={BLUE} p={w(1)} f={f} />
        <Wire pts={[[820, 570], [900, 720], [1120, 760]]} c={ORANGE} p={w(2)} f={f} />
        {N.length > 4 && <><Wire pts={[[1240, 300], [1460, 360], [1540, 470]]} c={BLUE} p={w(3)} f={f} /><Wire pts={[[1240, 760], [1460, 680], [1540, 570]]} c={ORANGE} p={w(3)} f={f} /></>}
        {N.slice(0, 5).map((nd, i) => <NodeC key={nd.t} x={P[i][0]} y={P[i][1]} r={P[i][2]} icon={nd.icon} t={nd.t} sub={nd.sub} c={col(nd.c, i)} p={n(i)} />)}
      </div>
      {sc.foot && <Foot t={sc.foot} f={f} at={70} />}
    </>
  );
};

/** 2–4 steps in a row with a loop-back wire and a note. */
const SFlow: React.FC<SP> = ({f, sc}) => {
  const st = sc.steps as {t: string; sub?: string; icon: string; c?: string}[];
  const X = st.map((_, i) => 330 + (i * (1590 - 330)) / Math.max(1, st.length - 1));
  return (
    <>
      <Tag t={sc.tag ?? 'FUNCTION / CLOSED LOOP'} />
      <Head t={sc.title} f={f} size={46} />
      {st.map((x, i) => {
        const at = 10 + i * 18, c = col(x.c, i);
        return (
          <React.Fragment key={x.t}>
            {i > 0 && <Wire pts={[[X[i - 1] + 85, 470], [X[i] - 85, 470]]} c={c} p={ease(f, at - 6, 10)} f={f} />}
            <NodeC x={X[i]} y={470} icon={x.icon} t={x.t} sub={x.sub} c={c} p={pop(f, at, 12)} glow={f > at + 14 && f < at + 30 ? 1 : 0} />
          </React.Fragment>
        );
      })}
      {sc.loop && <><Wire pts={[[X[X.length - 1], 640], [X[X.length - 1], 760], [X[0], 760], [X[0], 640]]} c={ORANGE} p={ease(f, 90, 24)} f={f} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 775, textAlign: 'center', fontFamily: FONT, fontSize: 24, fontWeight: 800, color: ORANGE, opacity: ease(f, 110, 10)}}>{sc.loop}</div></>}
      {sc.foot && <Foot t={sc.foot} f={f} at={120} />}
    </>
  );
};

const SChapter: React.FC<SP> = ({f, sc}) => {
  const a = ease(f, 0, 10), b = pop(f, 8, 12), line = ease(f, 22, 14);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontSize: 32, fontWeight: 800, color: DIM, opacity: a}}>{sc.small}</div>
      <div style={{fontSize: 110, fontWeight: 900, color: ORANGE, transform: `scale(${b})`, textShadow: `0 0 36px ${ORANGE}55`}}>{sc.big}</div>
      <div style={{fontSize: 52, fontWeight: 900, color: TXT, opacity: a}}>{sc.sub}</div>
      <div style={{margin: '24px auto 0', width: 360 * line, height: 4, background: TEAL, borderRadius: 2}} />
    </div>
  );
};

/** Signals → amp/driver box → MCU box with rows → formula. */
const SChain: React.FC<SP> = ({f, sc}) => {
  const ins = sc.inputs as {t: string; sub?: string; c?: string; wave?: 'small' | 'pulse' | 'flat'}[];
  const amp = sc.amp as {t: string; sub?: string} | undefined;
  const chip = sc.chip as {t: string; sub?: string; rows: string[]};
  const fm = sc.formula as {label?: string; expr: string; note?: string} | undefined;
  const ys = [330, 480, 630];
  return (
    <>
      <Tag t={sc.tag ?? '01 / SIGNAL ACQUISITION'} />
      <Head t={sc.title} f={f} size={46} />
      {ins.slice(0, 3).map((it, i) => {
        const c = col(it.c, [1, 0, 2][i]);
        const amplitude = it.wave === 'small' ? 6 : it.wave === 'flat' ? 0.1 : 12;
        const short = i === 0 && amp;
        return (
          <React.Fragment key={it.t}>
            <Pill x={120} y={ys[i]} t={it.t} sub={it.sub} c={c} p={pop(f, 6 + i * 6, 12)} w={230} />
            <Zig x={360} y={ys[i] + 35} w={short ? 220 : 520} c={c} f={f} p={ease(f, 12 + i * 6, 16)} amp={amplitude} />
          </React.Fragment>
        );
      })}
      {amp && <><Box x={590} y={318} w={250} h={94} c={ORANGE} p={pop(f, 24, 12)}>
        <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 900, color: ORANGE}}>{amp.t}</div>
        <div style={{fontFamily: FONT, fontSize: 17, fontWeight: 700, color: DIM}}>{amp.sub}</div>
      </Box><Wire pts={[[840, 365], [900, 365]]} c={ORANGE} p={ease(f, 30, 8)} f={f} /></>}
      <Box x={900} y={260} w={420} h={480} c={ORANGE} p={pop(f, 30, 14)}>
        <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 900, color: ORANGE}}>{chip.t}</div>
        <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DIM, marginBottom: 20}}>{chip.sub}</div>
        {chip.rows.map((t, i) => <div key={t} style={{width: 300, margin: '7px 0', padding: '10px 0', border: `2px solid ${TEAL}66`, borderRadius: 10, fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TXT, opacity: ease(f, 44 + i * 6, 8)}}>{t}</div>)}
      </Box>
      {fm && <><Wire pts={[[1320, 500], [1480, 500]]} c={TEAL} p={ease(f, 70, 10)} f={f} />
        <div style={{position: 'absolute', left: 1500, top: 420, opacity: ease(f, 76, 10)}}>
          <Mono size={22} color={DIM}>{fm.label}</Mono><Mono size={30} color={TEAL}>{fm.expr}</Mono>{fm.note && <Mono size={18} color={DIM}>{fm.note}</Mono>}
        </div></>}
    </>
  );
};

/** Decision ring: rows of mono rules inside a circle, input on the left, output on the right. */
const SRing: React.FC<SP> = ({f, sc}) => {
  const ring = ease(f, 6, 20);
  const rows = sc.rows as {t: string; c?: string}[];
  return (
    <>
      <Tag t={sc.tag ?? '02 / DECISION ENGINE'} />
      <Head t={sc.title} f={f} />
      <Wire pts={[[200, 560], [690, 560]]} c={TEAL} p={ease(f, 4, 14)} f={f} />
      <div style={{position: 'absolute', left: 230, top: 510, fontFamily: FONT, fontSize: 22, fontWeight: 800, color: DIM, opacity: ease(f, 10, 10)}}>{sc.input}</div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <circle cx={960} cy={560} r={260} fill="rgba(10,18,26,0.85)" stroke={ORANGE} strokeWidth={4} strokeDasharray={`${1634 * ring} 1700`} transform="rotate(-90 960 560)" />
        <circle cx={960} cy={560} r={228} fill="none" stroke={`${ORANGE}44`} strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${f * 0.8} 960 560)`} />
      </svg>
      <div style={{position: 'absolute', left: 760, top: 400, width: 400, textAlign: 'center'}}>
        <Mono size={18} color={DIM}>{sc.engine ?? 'DECISION ENGINE'}</Mono>
        {rows.map((r, i) => <div key={r.t} style={{marginTop: 22, opacity: ease(f, 20 + i * 14, 10)}}><Mono size={30} color={col(r.c, i === 0 ? 0 : 1)}>{r.t}</Mono></div>)}
        {sc.note && <div style={{marginTop: 22, opacity: ease(f, 66, 10)}}><Mono size={20} color={DIM}>{sc.note}</Mono></div>}
      </div>
      <Wire pts={[[1230, 560], [1700, 560]]} c={ORANGE} p={ease(f, 72, 14)} f={f} />
      {sc.output && <div style={{position: 'absolute', left: 1300, top: 590, opacity: ease(f, 80, 10)}}><Mono size={26} color={ORANGE}>{sc.output}</Mono></div>}
      {sc.foot && <Foot t={sc.foot} f={f} at={90} color={ORANGE} />}
    </>
  );
};

/** Pin → driver → device table (≤4 rows). */
const SPins: React.FC<SP> = ({f, sc}) => {
  const rows = sc.rows as {pin: string; pinSub?: string; mid: string; out: string; c?: string}[];
  return (
    <>
      <Tag t={sc.tag ?? '03 / DRIVE & OUTPUT'} />
      <Head t={sc.title} f={f} />
      {rows.slice(0, 4).map((r, i) => {
        const y = 230 + i * 165, at = 8 + i * 12, c = col(r.c, [1, 0, 2, 2][i]);
        return (
          <React.Fragment key={r.pin + i}>
            <Wire pts={[[480, y + 40], [760, y + 40]]} c={c} p={ease(f, at + 6, 10)} f={f} />
            <Wire pts={[[1140, y + 40], [1380, y + 40]]} c={c} p={ease(f, at + 12, 10)} f={f} />
            <Box x={280} y={y} w={200} h={80} c={BLUE} p={pop(f, at, 12)}>
              <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 900, color: TXT}}>{r.pin}</div>
              {r.pinSub && <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 700, color: DIM}}>{r.pinSub}</div>}
            </Box>
            <Box x={760} y={y} w={380} h={80} c={c} p={pop(f, at + 6, 12)}><div style={{fontFamily: FONT, fontSize: 26, fontWeight: 900, color: TXT}}>{r.mid}</div></Box>
            <Pill x={1380} y={y + 5} t={r.out} c={c} p={pop(f, at + 12, 12)} w={260} />
          </React.Fragment>
        );
      })}
      {sc.foot && <Foot t={sc.foot} f={f} at={70} />}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 118, textAlign: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DIM, opacity: ease(f, 74, 10)}}>{sc.note ?? '引脚为常见示例接法，以实际原理图为准'}</div>
    </>
  );
};

/** Servo PWM: pulse width 0.5→1.5 ms drives the dial to 90°. */
const SPwm: React.FC<SP> = ({f, sc}) => {
  const width = interpolate(f, [20, 50, 70, 100], [0.5, 0.5, 1.5, 1.5], {...CL, easing: Easing.inOut(Easing.cubic)});
  const angle = (width - 0.5) * 90, px = 46, x0 = 200, yH = 380, yL = 520;
  const d: string[] = [`M${x0} ${yL}`];
  for (let k = 0; k < 2; k++) { const b = x0 + k * 20 * px * 0.6; d.push(`L${b} ${yL} L${b} ${yH} L${b + width * px} ${yH} L${b + width * px} ${yL}`); }
  d.push(`L${x0 + 2 * 20 * px * 0.6} ${yL}`);
  return (
    <>
      <Tag t="CIRCUIT DEEP DIVE / COMPONENT LEVEL" />
      <Head t={sc.title ?? '舵机怎么知道要转多少度？看脉宽'} f={f} size={44} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={d.join(' ')} fill="none" stroke={TEAL} strokeWidth={4} strokeDasharray={`${3000 * ease(f, 4, 16)} 3000`} />
        <line x1={x0} y1={600} x2={x0 + 20 * px * 0.6} y2={600} stroke={DIM} strokeWidth={2} opacity={ease(f, 16, 8)} />
        <text x={x0 + 10 * px * 0.6} y={636} textAnchor="middle" fontFamily="Consolas" fontSize={24} fill={DIM} opacity={ease(f, 16, 8)}>周期 20 ms (50 Hz)</text>
      </svg>
      <div style={{position: 'absolute', left: x0 - 10, top: 320, opacity: ease(f, 18, 8)}}><Mono size={28} color={ORANGE}>高电平 {width.toFixed(1)} ms</Mono></div>
      <div style={{position: 'absolute', left: 1320, top: 300, width: 400, height: 400}}>
        <svg width={400} height={400}>
          <path d="M60 300 A140 140 0 0 1 340 300" fill="none" stroke={`${ORANGE}55`} strokeWidth={3} strokeDasharray="6 8" />
          <rect x={150} y={270} width={100} height={70} rx={10} fill="#1B4DB3" stroke={BLUE} strokeWidth={3} />
          <g transform={`rotate(${angle - 90} 200 300)`}><rect x={192} y={170} width={16} height={130} rx={8} fill="#fff" /><circle cx={200} cy={300} r={16} fill="#fff" stroke={DIM} strokeWidth={3} /></g>
          {[0, 90, 180].map((a) => <text key={a} x={200 + Math.cos(Math.PI - a * Math.PI / 180) * 170} y={300 - Math.sin(a * Math.PI / 180) * 170 + 8} textAnchor="middle" fontFamily="Consolas" fontSize={22} fill={DIM}>{a}°</text>)}
        </svg>
        <div style={{textAlign: 'center', marginTop: -10}}><Mono size={34} color={ORANGE}>{Math.round(angle)}°</Mono></div>
      </div>
      <Foot t="0.5 ms → 0°  ·  1.5 ms → 90°  ·  2.5 ms → 180°" f={f} at={30} />
      {sc.note && <div style={{position: 'absolute', left: 0, right: 0, bottom: 118, textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 700, color: DIM, opacity: ease(f, 40, 10)}}>{sc.note}</div>}
    </>
  );
};

/** Numbered cause→effect chain, optional Wheatstone bridge diagram on the left. */
const SChainList: React.FC<SP> = ({f, sc}) => {
  const p = ease(f, 4, 18), bend = 6 * Math.sin(f / 8) * ease(f, 30, 10);
  const chain = sc.chain as string[], hi = sc.hi ?? -1;
  return (
    <>
      <Tag t={sc.tag ?? 'CIRCUIT DEEP DIVE / COMPONENT LEVEL'} />
      <Head t={sc.title} f={f} size={44} />
      {sc.diagram === 'bridge' && <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080} opacity={p}>
        <g transform="translate(330 250)" stroke={TEAL} strokeWidth={4} fill="none">
          <path d="M150 0 L0 150 L150 300 L300 150 Z" />
          {[[75, 75, -45], [225, 75, 45], [75, 225, 45], [225, 225, -45]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-34} y={-12} width={68} height={24} fill={BG} stroke={i % 3 === 0 ? ORANGE : TEAL} /></g>)}
          <circle cx={150} cy={0} r={8} fill={TEAL} /><circle cx={150} cy={300} r={8} fill={TEAL} /><circle cx={0} cy={150} r={8} fill={ORANGE} /><circle cx={300} cy={150} r={8} fill={ORANGE} />
        </g>
        {[['E+', 470, 230], ['E−', 470, 590], ['A+', 300, 410], ['A−', 650, 410]].map(([t, x, y]) => <text key={t as string} x={x as number} y={y as number} fontFamily="Consolas" fontSize={26} fill={DIM}>{t}</text>)}
        <g transform="translate(260 700)"><path d={`M0 0 L440 ${bend} L440 ${bend + 50} L0 50 Z`} fill="#AEB7C2" />
          <path d={`M220 ${bend / 2 - 40} L220 ${bend / 2 - 8}`} stroke={ORANGE} strokeWidth={5} /><path d={`M208 ${bend / 2 - 22} L220 ${bend / 2 - 6} L232 ${bend / 2 - 22}`} stroke={ORANGE} strokeWidth={5} fill="none" /></g>
      </svg>}
      <div style={{position: 'absolute', left: sc.diagram ? 1000 : 520, top: 250, display: 'flex', flexDirection: 'column', gap: 18}}>
        {chain.map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ease(f, 20 + i * 10, 10)}}>
            <div style={{width: 40, height: 40, borderRadius: 20, background: i === hi ? ORANGE : `${TEAL}33`, border: `2px solid ${i === hi ? ORANGE : TEAL}`, color: TXT, fontFamily: FONT, fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 900, color: i === hi ? ORANGE : TXT}}>{t}</div>
          </div>
        ))}
      </div>
      {sc.foot && <Foot t={sc.foot} f={f} at={74} />}
    </>
  );
};

/** Two upgrade cards on a light background. art: 'rfid' | 'notify' | an icon name. */
const SUpgrade: React.FC<SP> = ({f, sc}) => {
  const W2 = '#1F5BD8';
  const cards = sc.cards as {title: string; bullets: string[]; art?: string; panel?: string; rows?: [string, string, string][]}[];
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #F6F9FF, #E9F0FC)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontSize: 54, fontWeight: 900, color: W2, opacity: ease(f, 2, 10)}}>{sc.title}</div>
      {sc.sub && <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#22324A', opacity: ease(f, 8, 10)}}>{sc.sub}</div>}
      {cards.slice(0, 2).map((c, i) => {
        const p = pop(f, 14 + i * 16, 14);
        return (
          <div key={c.title} style={{position: 'absolute', left: 170 + i * 820, top: 230, width: 760, height: 700, boxSizing: 'border-box', border: `3px solid ${W2}`, borderRadius: 18, background: '#fff', overflow: 'hidden', boxShadow: '0 18px 40px rgba(31,91,216,0.15)', opacity: Math.min(1, p * 1.3), transform: `translateY(${(1 - Math.min(1, p)) * 40}px)`}}>
            <div style={{background: W2, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 900, padding: '14px 24px'}}>升级方向 0{i + 1} &nbsp;{c.title}</div>
            <div style={{height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F6FD'}}>
              {c.art === 'notify' ? (
                <div style={{width: 300, background: '#fff', borderRadius: 26, border: '4px solid #22324A', padding: 18, boxShadow: '0 10px 24px rgba(0,0,0,0.1)'}}>
                  {c.panel && <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 900, color: '#22324A', marginBottom: 12}}>{c.panel}</div>}
                  {(c.rows ?? []).map(([t, st, cc]) => <div key={t} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 12px', margin: '8px 0', borderRadius: 12, background: '#F2F6FD', fontFamily: FONT, fontSize: 20, fontWeight: 800}}><span style={{color: '#22324A'}}>{t}</span><span style={{color: cc}}>{st}</span></div>)}
                </div>
              ) : c.art === 'rfid' ? (
                <svg width={420} height={300} viewBox="0 0 420 300"><rect x={30} y={60} width={220} height={150} rx={18} fill="#fff" stroke={W2} strokeWidth={5} /><path d="M70 135 h40 M70 110 h80 M70 160 h60" stroke={W2} strokeWidth={8} strokeLinecap="round" />
                  {[0, 1, 2].map((k) => <path key={k} d={`M${290 + k * 28} ${100 - k * 14} a ${60 + k * 30} ${60 + k * 30} 0 0 1 0 ${70 + k * 28 * 2}`} fill="none" stroke={ORANGE} strokeWidth={7} opacity={0.4 + 0.6 * ((Math.floor(f / 6) + k) % 3 === 0 ? 1 : 0.3)} />)}</svg>
              ) : <Icon name={c.art ?? 'chip'} size={180} color={W2} />}
            </div>
            <div style={{padding: '18px 30px'}}>{c.bullets.map((b2, k) => <div key={b2} style={{fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#22324A', margin: '10px 0', opacity: ease(f, 30 + i * 16 + k * 6, 8)}}>• {b2}</div>)}</div>
          </div>
        );
      })}
    </>
  );
};

const SOutro: React.FC<SP> = ({f, sc}) => {
  const a = pop(f, 6, 12), b = ease(f, 26, 12);
  return (
    <>
      <Robot pose={f < 40 ? 'wave' : 'cheer'} since={0} x={260} bottom={930} h={700} glow />
      <div style={{position: 'absolute', left: 900, top: 230, fontFamily: FONT}}>
        <div style={{fontSize: 92, fontWeight: 900, color: BLUE, transform: `scale(${a})`, transformOrigin: '0 50%', textShadow: `0 0 30px ${BLUE}66`}}>{sc.title ?? '关注锐新科技'}</div>
        <div style={{fontSize: 44, fontWeight: 900, color: TXT, marginTop: 10, opacity: b}}>{sc.sub ?? '一分钟拆透一个单片机项目'}</div>
        <div style={{width: 640 * ease(f, 34, 14), height: 3, background: ORANGE, margin: '30px 0'}} />
        <div style={{fontSize: 34, fontWeight: 900, color: ORANGE, opacity: ease(f, 44, 10)}}>下期我们讲：{sc.next}</div>
        {(sc.items as string[]).map((t, i) => <div key={t} style={{fontSize: 32, fontWeight: 800, color: TXT, marginTop: 16, opacity: ease(f, 56 + i * 10, 10)}}><span style={{color: TEAL}}>▸ </span>{t}</div>)}
      </div>
    </>
  );
};

export const SCENE_TYPES: Record<string, React.FC<SP>> = {
  title: STitle, kit: SKit, real: SReal, layers: SLayers, flow: SFlow, chapter: SChapter, chain: SChain, ring: SRing,
  pins: SPins, pwm: SPwm, chainlist: SChainList, upgrade: SUpgrade, outro: SOutro,
};

/* ---------- compositions ---------- */
const Narration: React.FC<{t: NTiming; voDir: string}> = ({t, voDir}) => <>{t.beats.map((b) => <Sequence key={b.id} from={b.from} durationInFrames={b.dur}><Audio src={staticFile(`${voDir}/${b.id}.mp3`)} /></Sequence>)}</>;

const Subtitle: React.FC<{t: NTiming; f: number}> = ({t, f}) => {
  const b = t.beats.find((x) => f >= x.from && f < x.from + x.dur);
  if (!b) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 95, opacity: ease(f, b.from, 5)}}>
      <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff', background: 'rgba(5,10,16,0.78)', border: '1px solid rgba(47,224,184,0.35)', borderRadius: 12, padding: '8px 26px', letterSpacing: 1}}>{b.text.replace(/[【】]/g, '')}</div>
    </div>
  );
};

/** 16:9 cut. `noSub` hides the subtitle (the vertical wrapper draws a bigger one). */
export const NeonVideo: React.FC<{script: NScript; t: NTiming; noSub?: boolean; noAudio?: boolean}> = ({script, t, noSub, noAudio}) => {
  const f = useCurrentFrame();
  const idx = t.scenes.findIndex((x) => f >= x.from && f < x.from + x.dur);
  return (
    <LongCtx.Provider value={t.tm}>
      <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
        <DarkBg f={f} />
        {!noAudio && <Narration t={t} voDir={script.voDir} />}
        {t.scenes.map((x) => {
          const C = SCENE_TYPES[x.sc.type];
          return <Sequence key={x.sc.id} from={x.from} durationInFrames={x.dur}><SceneWrap f={f - x.from} dur={x.dur}><C f={f - x.from} sc={x.sc} b={x.beats} /></SceneWrap></Sequence>;
        })}
        {!noSub && <Subtitle t={t} f={f} />}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 90}}>
          {t.scenes.map((x, i) => <div key={x.sc.id} style={{width: i === idx ? 34 : 14, height: 4, borderRadius: 2, background: i === idx ? ORANGE : 'rgba(124,138,156,0.4)'}} />)}
        </div>
        <div style={{position: 'absolute', right: 36, top: 26, fontFamily: FONT, fontSize: 22, fontWeight: 900, color: 'rgba(124,138,156,0.7)', zIndex: 90}}>@{script.meta.brand ?? '锐新科技'}</div>
      </AbsoluteFill>
    </LongCtx.Provider>
  );
};
