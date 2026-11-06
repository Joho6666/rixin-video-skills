// 锐新三号 · native 9:16 layouts (1080x1920). Same script / timing / narration as the 16:9 cut, every scene re-laid out
// top-to-bottom for phones: bigger type, stacked diagrams, big subtitle band. Per-scene `v: {...}` overrides fields for this cut only.
// Safe zones: tag/brand y<110 · head 140-300 · content 320-1470 · subtitle 1510-1700 · brand strip 1760 · progress 1880.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {LongCtx} from '../long/timing';
import {FONT, Icon, Robot, ease, pop} from '../long/common';
import {BG, TEAL, ORANGE, BLUE, TXT, DIM, SceneWrap, Wire, Mono} from '../long/Teardown';
import type {NScene, NScript, NTiming} from './Neon';

const W = 1080;
const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const COLORS: Record<string, string> = {teal: TEAL, orange: ORANGE, blue: BLUE};
const col = (c?: string, i = 0) => COLORS[c ?? ''] ?? [TEAL, ORANGE, BLUE, ORANGE, TEAL][i % 5];
const Hl: React.FC<{t: string; c?: string}> = ({t, c = ORANGE}) => <>{t.split(/(【[^】]*】)/).filter(Boolean).map((r, i) => r.startsWith('【') ? <span key={i} style={{color: c}}>{r.slice(1, -1)}</span> : <span key={i}>{r}</span>)}</>;
type SP = {f: number; sc: NScene};

/* ---------- shared vertical bits ---------- */
const VBg: React.FC<{f: number}> = ({f}) => {
  const x = interpolate(f % 300, [0, 300], [-600, 1700]);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #0F1A24 0%, ${BG} 72%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(47,224,184,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(47,224,184,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px'}} />
      <div style={{position: 'absolute', left: x, top: -300, width: 110, height: 2600, transform: 'rotate(14deg)', background: 'linear-gradient(90deg, transparent, rgba(47,224,184,0.10), transparent)', filter: 'blur(8px)'}} />
      <div style={{position: 'absolute', left: x - 800, top: -300, width: 50, height: 2600, transform: 'rotate(14deg)', background: 'linear-gradient(90deg, transparent, rgba(61,139,255,0.08), transparent)', filter: 'blur(6px)'}} />
    </AbsoluteFill>
  );
};
const VTag: React.FC<{t: string; dark?: boolean}> = ({t, dark}) => <div style={{position: 'absolute', left: 44, top: 52, fontFamily: 'Consolas, monospace', fontSize: 20, letterSpacing: 3, color: dark ? 'rgba(40,52,70,0.6)' : 'rgba(124,138,156,0.8)'}}>{t}</div>;
const VHead: React.FC<{t: string; f: number; y?: number; size?: number; color?: string}> = ({t, f, y = 150, size = 66, color = TXT}) => {
  const p = ease(f, 2, 12);
  return <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color, lineHeight: 1.25, opacity: p, transform: `translateY(${(1 - p) * -16}px)`}}>{t.split(/\n/).map((l, i) => <div key={i}><Hl t={l} /></div>)}</div>;
};
const VFoot: React.FC<{t?: string; f: number; at: number; y?: number; color?: string}> = ({t, f, at, y = 1400, color = TEAL}) => t ? (
  <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', fontFamily: FONT, fontSize: 38, fontWeight: 900, color, lineHeight: 1.3, opacity: ease(f, at, 12)}}>{t}</div>
) : null;
const Circle: React.FC<{x: number; y: number; r: number; icon: string; c: string; p: number; glow?: number}> = ({x, y, r, icon, c, p, glow = 0}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `4px solid ${c}`, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 0 ${16 + glow * 28}px ${c}${glow > 0.5 ? 'AA' : '55'}`, opacity: Math.min(1, p * 1.4), transform: `scale(${0.5 + 0.5 * Math.min(1, p)})`}}><Icon name={icon} size={r * 1.05} color={c} /></div>
);
const VBox: React.FC<{x: number; y: number; w: number; h: number; c: string; p: number; children?: React.ReactNode}> = ({x, y, w, h, c, p, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', border: `3px solid ${c}`, borderRadius: 20, background: 'rgba(10,18,26,0.88)', boxShadow: `0 0 26px ${c}44`,
    opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * Math.min(1, p)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{children}</div>
);
const T: React.FC<{s: number; c?: string; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({s, c = TXT, w = 900, children, style}) => <div style={{fontFamily: FONT, fontSize: s, fontWeight: w, color: c, lineHeight: 1.3, ...style}}>{children}</div>;

/* ---------- scenes ---------- */
const VTitle: React.FC<SP> = ({f, sc}) => {
  const a = pop(f, 4, 12), b = ease(f, 16, 12), c = pop(f, 30, 14), line = ease(f, 40, 16);
  const q = (sc.vQuestion ?? sc.question ?? '') as string;
  return (
    <>
      <VTag t={sc.tag ?? 'STM32 / TEARDOWN'} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 520, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 40, fontWeight: 800, color: TEAL, letterSpacing: 8, opacity: b}}>一口气拆解</div>
        <div style={{fontSize: 170, fontWeight: 900, color: ORANGE, lineHeight: 1.15, marginTop: 10, transform: `scale(${a})`, textShadow: `0 0 50px ${ORANGE}66`}}>{sc.title}</div>
        <div style={{margin: '30px auto', width: 520 * line, height: 5, background: `linear-gradient(90deg, ${BLUE}, ${TEAL})`, borderRadius: 3}} />
        <div style={{fontSize: 50, fontWeight: 900, color: TXT, opacity: b}}>{sc.vSub ?? sc.sub}</div>
        {q && <div style={{fontSize: 84, fontWeight: 900, color: TXT, marginTop: 70, lineHeight: 1.25, opacity: Math.min(1, c), transform: `scale(${0.7 + 0.3 * c})`}}>
          {q.split('\n').map((l, i) => <div key={i}><Hl t={l} /></div>)}
        </div>}
      </div>
    </>
  );
};

/** Photo full width on top with numbered pins; numbered legend in two columns below. */
const VKit: React.FC<SP> = ({f, sc}) => {
  const imgW = sc.imgW ?? 1672, imgH = sc.imgH ?? imgW * 9 / 16, k = W / imgW, top = 250, h = imgH * k;
  const ph = ease(f, 0, 14), flash = interpolate(f, [0, 3, 12], [0, 0.8, 0], {extrapolateRight: 'clamp'});
  const items = sc.callouts as {t: string; sub: string; x: number; y: number; c?: string}[];
  const rows = Math.ceil(items.length / 2), rowH = Math.min(130, (1470 - (top + h + 50)) / rows);
  return (
    <>
      <AbsoluteFill style={{background: '#D9DDE2'}} />
      <VTag t={sc.tag ?? 'HARDWARE / BILL OF PARTS'} dark />
      <div style={{position: 'absolute', left: 50, right: 50, top: 120, textAlign: 'center', opacity: ease(f, 4, 10)}}><T s={52} c="#14202E">{sc.vLabel ?? sc.label}</T></div>
      <div style={{position: 'absolute', left: 0, top, width: W, height: h, overflow: 'hidden', opacity: ph}}>
        <Img src={staticFile(sc.img)} style={{width: W, height: h, objectFit: 'cover', transform: `scale(${1.08 - 0.08 * ph})`}} />
      </div>
      {items.map((c, i) => {
        const at = 30 + i * 9, p = ease(f, at, 10), cc = col(c.c, i);
        const px = c.x * k, py = top + c.y * k;
        const lx = 40 + (i % 2) * 510, ly = top + h + 50 + Math.floor(i / 2) * rowH;
        return (
          <React.Fragment key={c.t}>
            <div style={{position: 'absolute', left: px - 22, top: py - 22, width: 44, height: 44, borderRadius: 22, background: cc, border: '3px solid #fff', boxShadow: `0 0 14px ${cc}`, color: '#fff',
              fontFamily: FONT, fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, at, 10)})`}}>{i + 1}</div>
            <div style={{position: 'absolute', left: lx, top: ly, width: 490, display: 'flex', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
              <div style={{flex: 'none', width: 44, height: 44, borderRadius: 22, background: cc, color: '#fff', fontFamily: FONT, fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <div><T s={34} c="#14202E">{c.t}</T><T s={25} w={700} c="#4E5D70">{c.sub}</T></div>
            </div>
          </React.Fragment>
        );
      })}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </>
  );
};

const VReal: React.FC<SP> = ({f, sc}) => {
  const p = ease(f, 2, 16), pts = (sc.points ?? []) as string[];
  return (
    <>
      <VTag t={sc.tag ?? 'REAL PROJECT / REFERENCE'} />
      <VHead t={sc.title} f={f} y={130} />
      <div style={{position: 'absolute', left: 40, top: 270, width: 1000, height: 680, borderRadius: 22, overflow: 'hidden', border: `4px solid ${TEAL}`, boxShadow: `0 0 40px ${TEAL}55`, opacity: p, transform: `scale(${0.95 + 0.05 * p})`, background: '#0A1018'}}>
        <Img src={staticFile(sc.img)} style={{width: '100%', height: '100%', objectFit: sc.fit ?? 'cover', transform: `scale(${1 + 0.05 * Math.min(1, f / 200)})`}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px', background: 'linear-gradient(0deg, rgba(0,0,0,0.8), transparent)', fontFamily: FONT, fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.9)'}}>图源：{sc.credit}</div>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1000}}>
        {pts.map((t, i) => {
          const q = ease(f, 16 + i * 14, 10);
          return (
            <div key={t} style={{display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 34, opacity: q, transform: `translateX(${(1 - q) * -24}px)`}}>
              <div style={{flex: 'none', width: 56, height: 56, borderRadius: 28, border: `3px solid ${ORANGE}`, color: ORANGE, fontFamily: FONT, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <T s={44}><Hl t={t} /></T>
            </div>
          );
        })}
      </div>
    </>
  );
};

/** Layers as a vertical stack on a glowing spine; the controller layer (index 1) is highlighted. */
const VLayers: React.FC<SP> = ({f, sc}) => {
  const N = (sc.nodes as {icon: string; t: string; sub?: string; c?: string}[]).slice(0, 5);
  const y0 = 400, gap = Math.min(225, 1000 / Math.max(1, N.length - 1)), X = 190;
  return (
    <>
      <VTag t={sc.tag ?? 'SYSTEM / ARCHITECTURE'} />
      <VHead t={sc.title} f={f} />
      <Wire pts={[[X, y0], [X, y0 + gap * (N.length - 1)]]} c={TEAL} p={ease(f, 8, 40)} f={f} w={4} />
      {N.map((n, i) => {
        const y = y0 + i * gap, at = 8 + i * 10, c = col(n.c, i), main = i === 1;
        return (
          <React.Fragment key={n.t}>
            <Circle x={X} y={y} r={main ? 82 : 66} icon={n.icon} c={c} p={pop(f, at, 12)} glow={main ? 1 : 0} />
            <div style={{position: 'absolute', left: 310, top: y - 62, width: 720, opacity: ease(f, at + 4, 10), transform: `translateX(${(1 - ease(f, at + 4, 10)) * 30}px)`}}>
              <T s={main ? 58 : 50} c={main ? ORANGE : TXT}>{n.t}</T>
              {n.sub && <T s={32} w={700} c={DIM}>{n.sub}</T>}
            </div>
          </React.Fragment>
        );
      })}
      <VFoot t={sc.foot} f={f} at={70} y={1420} />
    </>
  );
};

/** Steps top-to-bottom with a loop-back wire on the left. */
const VFlow: React.FC<SP> = ({f, sc}) => {
  const st = sc.steps as {t: string; sub?: string; icon: string; c?: string}[];
  const y0 = 420, gap = Math.min(270, 860 / Math.max(1, st.length - 1)), X = 250;
  const yl = y0 + gap * (st.length - 1);
  return (
    <>
      <VTag t={sc.tag ?? 'FUNCTION / CLOSED LOOP'} />
      <VHead t={sc.vTitle ?? sc.title} f={f} size={58} />
      {st.map((x, i) => {
        const y = y0 + i * gap, at = 10 + i * 18, c = col(x.c, i);
        return (
          <React.Fragment key={x.t}>
            {i > 0 && <Wire pts={[[X, y - gap + 82], [X, y - 82]]} c={c} p={ease(f, at - 6, 10)} f={f} w={4} />}
            <Circle x={X} y={y} r={76} icon={x.icon} c={c} p={pop(f, at, 12)} glow={f > at + 14 && f < at + 30 ? 1 : 0} />
            <div style={{position: 'absolute', left: 370, top: y - 60, width: 670, opacity: ease(f, at + 4, 10)}}>
              <T s={50}>{x.t}</T>{x.sub && <T s={32} w={700} c={DIM}>{x.sub}</T>}
            </div>
          </React.Fragment>
        );
      })}
      {sc.loop && <><Wire pts={[[X - 80, yl], [80, yl], [80, y0], [X - 80, y0]]} c={ORANGE} p={ease(f, 90, 24)} f={f} w={4} />
        <div style={{position: 'absolute', left: 40, right: 40, top: yl + 120, textAlign: 'center', opacity: ease(f, 110, 10)}}><T s={38} c={ORANGE}>↻ {sc.loop}</T></div></>}
      <VFoot t={sc.foot} f={f} at={120} y={1420} />
    </>
  );
};

const VChapter: React.FC<SP> = ({f, sc}) => {
  const a = ease(f, 0, 10), b = pop(f, 8, 12), line = ease(f, 22, 14);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 640, textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontSize: 44, fontWeight: 800, color: DIM, opacity: a}}>{sc.small}</div>
      <div style={{fontSize: 180, fontWeight: 900, color: ORANGE, transform: `scale(${b})`, textShadow: `0 0 46px ${ORANGE}55`}}>{sc.big}</div>
      <div style={{fontSize: 64, fontWeight: 900, color: TXT, opacity: a}}>{sc.sub}</div>
      <div style={{margin: '36px auto 0', width: 460 * line, height: 5, background: TEAL, borderRadius: 3}} />
    </div>
  );
};

/** Inputs across the top → (amp) → MCU card → formula, flowing downwards. */
const VChain: React.FC<SP> = ({f, sc}) => {
  const ins = (sc.inputs as {t: string; sub?: string; c?: string}[]).slice(0, 3);
  const amp = sc.amp as {t: string; sub?: string} | undefined;
  const chip = sc.chip as {t: string; sub?: string; rows: string[]};
  const fm = sc.formula as {label?: string; expr: string; note?: string} | undefined;
  const cw = 1000 / ins.length, cy = 760;
  return (
    <>
      <VTag t={sc.tag ?? '01 / SIGNAL ACQUISITION'} />
      <VHead t={sc.vTitle ?? sc.title} f={f} size={58} />
      {ins.map((it, i) => {
        const c = col(it.c, [1, 0, 2][i]), x = 40 + i * cw, mid = x + cw / 2, at = 6 + i * 6;
        const viaAmp = i === 0 && amp;
        return (
          <React.Fragment key={it.t}>
            <VBox x={x + 10} y={360} w={cw - 20} h={120} c={c} p={pop(f, at, 12)}><T s={36}>{it.t}</T>{it.sub && <T s={24} w={700} c={DIM}>{it.sub}</T>}</VBox>
            <Wire pts={viaAmp ? [[mid, 480], [mid, 540]] : [[mid, 480], [mid, cy]]} c={c} p={ease(f, at + 8, 14)} f={f} w={4} />
          </React.Fragment>
        );
      })}
      {amp && <><VBox x={50} y={540} w={cw - 40} h={130} c={ORANGE} p={pop(f, 24, 12)}><T s={40} c={ORANGE}>{amp.t}</T><T s={22} w={700} c={DIM}>{amp.sub}</T></VBox>
        <Wire pts={[[40 + cw / 2, 670], [40 + cw / 2, cy]]} c={ORANGE} p={ease(f, 30, 8)} f={f} w={4} /></>}
      <VBox x={90} y={cy} w={900} h={430} c={ORANGE} p={pop(f, 30, 14)}>
        <T s={56} c={ORANGE}>{chip.t}</T>
        <T s={26} w={700} c={DIM} style={{marginBottom: 18}}>{chip.sub}</T>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, width: 820}}>
          {chip.rows.map((t, i) => <div key={t} style={{width: 390, padding: '14px 0', border: `2px solid ${TEAL}66`, borderRadius: 12, fontFamily: FONT, fontSize: 32, fontWeight: 800, color: TXT, opacity: ease(f, 44 + i * 6, 8)}}>{t}</div>)}
        </div>
      </VBox>
      {fm && <><Wire pts={[[540, cy + 430], [540, 1250]]} c={TEAL} p={ease(f, 70, 10)} f={f} w={4} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1262, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: ease(f, 76, 10)}}>
          <Mono size={28} color={DIM}>{fm.label}</Mono><Mono size={46} color={TEAL}>{fm.expr}</Mono>{fm.note && <Mono size={24} color={DIM}>{fm.note}</Mono>}
        </div></>}
    </>
  );
};

const VRing: React.FC<SP> = ({f, sc}) => {
  const ring = ease(f, 6, 20), rows = sc.rows as {t: string; c?: string}[];
  const cx = 540, cy = 860, r = 380;
  return (
    <>
      <VTag t={sc.tag ?? '02 / DECISION ENGINE'} />
      <VHead t={sc.vTitle ?? sc.title} f={f} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 345, textAlign: 'center', opacity: ease(f, 10, 10)}}><T s={36} c={DIM}>输入：{sc.input}</T></div>
      <Wire pts={[[cx, 400], [cx, cy - r]]} c={TEAL} p={ease(f, 4, 14)} f={f} w={4} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1920}>
        <circle cx={cx} cy={cy} r={r} fill="rgba(10,18,26,0.85)" stroke={ORANGE} strokeWidth={5} strokeDasharray={`${2 * Math.PI * r * ring} 3000`} transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r - 36} fill="none" stroke={`${ORANGE}44`} strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${f * 0.8} ${cx} ${cy})`} />
      </svg>
      <div style={{position: 'absolute', left: cx - 340, top: cy - 230, width: 680, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Mono size={24} color={DIM}>{sc.engine ?? 'DECISION ENGINE'}</Mono>
        {rows.map((x, i) => <div key={x.t} style={{marginTop: 34, opacity: ease(f, 20 + i * 14, 10)}}><Mono size={42} color={col(x.c, i === 0 ? 0 : 1)}>{x.t}</Mono></div>)}
        {sc.note && <div style={{marginTop: 34, opacity: ease(f, 66, 10)}}><Mono size={26} color={DIM}>{sc.note}</Mono></div>}
      </div>
      {sc.output && <><Wire pts={[[cx, cy + r], [cx, cy + r + 60]]} c={ORANGE} p={ease(f, 72, 10)} f={f} w={4} />
        <div style={{position: 'absolute', left: 0, right: 0, top: cy + r + 70, display: 'flex', justifyContent: 'center', opacity: ease(f, 80, 10)}}><Mono size={40} color={ORANGE}>{sc.output}</Mono></div></>}
      <VFoot t={sc.foot} f={f} at={90} y={1400} color={ORANGE} />
    </>
  );
};

const VPins: React.FC<SP> = ({f, sc}) => {
  const rows = (sc.rows as {pin: string; pinSub?: string; mid: string; out: string; c?: string}[]).slice(0, 4);
  return (
    <>
      <VTag t={sc.tag ?? '03 / DRIVE & OUTPUT'} />
      <VHead t={sc.vTitle ?? sc.title} f={f} size={58} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 320, display: 'flex', fontFamily: 'Consolas, monospace', fontSize: 22, letterSpacing: 2, color: DIM, opacity: ease(f, 6, 10)}}>
        <div style={{width: 230, textAlign: 'center'}}>引脚</div><div style={{width: 40}} /><div style={{width: 400, textAlign: 'center'}}>驱动方式</div><div style={{width: 40}} /><div style={{width: 270, textAlign: 'center'}}>执行器</div>
      </div>
      {rows.map((r, i) => {
        const y = 370 + i * 245, at = 8 + i * 12, c = col(r.c, [1, 0, 2, 2][i]);
        return (
          <React.Fragment key={r.pin + i}>
            <Wire pts={[[270, y + 70], [310, y + 70]]} c={c} p={ease(f, at + 6, 8)} f={f} dot={false} w={4} />
            <Wire pts={[[710, y + 70], [750, y + 70]]} c={c} p={ease(f, at + 12, 8)} f={f} dot={false} w={4} />
            <VBox x={40} y={y} w={230} h={140} c={BLUE} p={pop(f, at, 12)}><T s={46}>{r.pin}</T>{r.pinSub && <T s={22} w={700} c={DIM}>{r.pinSub}</T>}</VBox>
            <VBox x={310} y={y} w={400} h={140} c={c} p={pop(f, at + 6, 12)}><T s={36}>{r.mid}</T></VBox>
            <VBox x={750} y={y} w={290} h={140} c={c} p={pop(f, at + 12, 12)}><T s={34} c={c}>{r.out}</T></VBox>
          </React.Fragment>
        );
      })}
      <VFoot t={sc.foot} f={f} at={70} y={1365} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1435, textAlign: 'center', opacity: ease(f, 74, 10)}}><T s={24} w={700} c={DIM}>{sc.note ?? '引脚为常见示例接法，以实际原理图为准'}</T></div>
    </>
  );
};

const VPwm: React.FC<SP> = ({f, sc}) => {
  const width = interpolate(f, [20, 50, 70, 100], [0.5, 0.5, 1.5, 1.5], {...CL, easing: Easing.inOut(Easing.cubic)});
  const angle = (width - 0.5) * 90, px = 37, x0 = 90, yH = 440, yL = 600, per = 20 * px * 0.6;
  const d: string[] = [`M${x0} ${yL}`];
  for (let k = 0; k < 2; k++) { const b = x0 + k * per; d.push(`L${b} ${yL} L${b} ${yH} L${b + width * px} ${yH} L${b + width * px} ${yL}`); }
  d.push(`L${x0 + 2 * per} ${yL}`);
  return (
    <>
      <VTag t="CIRCUIT DEEP DIVE" />
      <VHead t={sc.vTitle ?? '舵机转多少度？\n看【脉宽】'} f={f} />
      <div style={{position: 'absolute', left: x0, top: 360, opacity: ease(f, 18, 8)}}><Mono size={38} color={ORANGE}>高电平 {width.toFixed(1)} ms</Mono></div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1920}>
        <path d={d.join(' ')} fill="none" stroke={TEAL} strokeWidth={5} strokeDasharray={`${3000 * ease(f, 4, 16)} 3000`} />
        <line x1={x0} y1={660} x2={x0 + per} y2={660} stroke={DIM} strokeWidth={2} opacity={ease(f, 16, 8)} />
        <text x={x0 + per / 2} y={705} textAnchor="middle" fontFamily="Consolas" fontSize={30} fill={DIM} opacity={ease(f, 16, 8)}>周期 20 ms (50 Hz)</text>
      </svg>
      <div style={{position: 'absolute', left: 190, top: 720, width: 700, height: 600}}>
        <svg width={700} height={560} viewBox="25 60 350 280">
          <path d="M60 300 A140 140 0 0 1 340 300" fill="none" stroke={`${ORANGE}55`} strokeWidth={3} strokeDasharray="6 8" />
          <rect x={150} y={270} width={100} height={70} rx={10} fill="#1B4DB3" stroke={BLUE} strokeWidth={3} />
          <g transform={`rotate(${angle - 90} 200 300)`}><rect x={192} y={170} width={16} height={130} rx={8} fill="#fff" /><circle cx={200} cy={300} r={16} fill="#fff" stroke={DIM} strokeWidth={3} /></g>
          {[0, 90, 180].map((a) => <text key={a} x={200 + Math.cos(Math.PI - a * Math.PI / 180) * 165} y={300 - Math.sin(a * Math.PI / 180) * 165 + 8} textAnchor="middle" fontFamily="Consolas" fontSize={20} fill={DIM}>{a}°</text>)}
        </svg>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: -10}}><Mono size={64} color={ORANGE}>{Math.round(angle)}°</Mono></div>
      </div>
      <VFoot t="0.5ms→0° · 1.5ms→90° · 2.5ms→180°" f={f} at={30} y={1380} />
      {sc.note && <div style={{position: 'absolute', left: 40, right: 40, top: 1445, textAlign: 'center', opacity: ease(f, 40, 10)}}><T s={26} w={700} c={DIM}>{sc.note}</T></div>}
    </>
  );
};

const VChainList: React.FC<SP> = ({f, sc}) => {
  const p = ease(f, 4, 18), bend = 6 * Math.sin(f / 8) * ease(f, 30, 10);
  const chain = sc.chain as string[], hi = sc.hi ?? -1, dg = sc.diagram === 'bridge';
  const y0 = dg ? 820 : 400, gap = dg ? 112 : 170;
  return (
    <>
      <VTag t={sc.tag ?? 'CIRCUIT DEEP DIVE'} />
      <VHead t={sc.vTitle ?? sc.title} f={f} size={58} />
      {dg && <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1920} opacity={p}>
        <g transform="translate(390 300)" stroke={TEAL} strokeWidth={4} fill="none">
          <path d="M150 0 L0 150 L150 300 L300 150 Z" />
          {[[75, 75, -45], [225, 75, 45], [75, 225, 45], [225, 225, -45]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-34} y={-12} width={68} height={24} fill={BG} stroke={i % 3 === 0 ? ORANGE : TEAL} /></g>)}
          <circle cx={150} cy={0} r={8} fill={TEAL} /><circle cx={150} cy={300} r={8} fill={TEAL} /><circle cx={0} cy={150} r={8} fill={ORANGE} /><circle cx={300} cy={150} r={8} fill={ORANGE} />
        </g>
        {[['E+', 525, 285], ['E−', 525, 640], ['A+', 330, 460], ['A−', 710, 460]].map(([t, x, y]) => <text key={t as string} x={x as number} y={y as number} fontFamily="Consolas" fontSize={28} fill={DIM}>{t}</text>)}
        <g transform="translate(320 700)"><path d={`M0 0 L440 ${bend} L440 ${bend + 50} L0 50 Z`} fill="#AEB7C2" />
          <path d={`M220 ${bend / 2 - 40} L220 ${bend / 2 - 8}`} stroke={ORANGE} strokeWidth={5} /><path d={`M208 ${bend / 2 - 22} L220 ${bend / 2 - 6} L232 ${bend / 2 - 22}`} stroke={ORANGE} strokeWidth={5} fill="none" /></g>
      </svg>}
      {chain.map((t, i) => {
        const q = ease(f, 20 + i * 10, 10), on = i === hi;
        return (
          <div key={t} style={{position: 'absolute', left: 120, top: y0 + i * gap, display: 'flex', alignItems: 'center', gap: 24, opacity: q, transform: `translateX(${(1 - q) * -30}px)`}}>
            <div style={{width: 60, height: 60, borderRadius: 30, background: on ? ORANGE : `${TEAL}33`, border: `3px solid ${on ? ORANGE : TEAL}`, color: TXT, fontFamily: FONT, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <T s={48} c={on ? ORANGE : TXT}>{t}</T>
          </div>
        );
      })}
      {!dg && <Wire pts={[[150, y0 + 60], [150, y0 + gap * (chain.length - 1)]]} c={TEAL} p={ease(f, 20, 40)} f={f} dot={false} w={3} />}
      <VFoot t={sc.vFoot ?? sc.foot} f={f} at={74} y={1400} />
    </>
  );
};

const VUpgrade: React.FC<SP> = ({f, sc}) => {
  const W2 = '#1F5BD8';
  const cards = (sc.cards as {title: string; bullets: string[]; art?: string; panel?: string; rows?: [string, string, string][]}[]).slice(0, 2);
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #F6F9FF, #E9F0FC)'}} />
      <VTag t="UPGRADE / NEXT LEVEL" dark />
      <div style={{position: 'absolute', left: 50, right: 50, top: 120, textAlign: 'center', opacity: ease(f, 2, 10)}}><T s={60} c={W2}>{(sc.vTitle ?? sc.title).split(/\n/).map((l: string, i: number) => <div key={i}><Hl t={l} /></div>)}</T></div>
      {sc.sub && <div style={{position: 'absolute', left: 50, right: 50, top: 305, textAlign: 'center', opacity: ease(f, 8, 10)}}><T s={30} w={800} c="#22324A">{sc.sub}</T></div>}
      {cards.map((c, i) => {
        const p = pop(f, 14 + i * 16, 14);
        return (
          <div key={c.title} style={{position: 'absolute', left: 50, top: 400 + i * 540, width: 980, height: 500, boxSizing: 'border-box', border: `3px solid ${W2}`, borderRadius: 22, background: '#fff', overflow: 'hidden',
            boxShadow: '0 18px 40px rgba(31,91,216,0.15)', opacity: Math.min(1, p * 1.3), transform: `translateY(${(1 - Math.min(1, p)) * 40}px)`}}>
            <div style={{background: W2, color: '#fff', fontFamily: FONT, fontSize: 40, fontWeight: 900, padding: '16px 28px'}}>升级 0{i + 1} · {c.title}</div>
            <div style={{display: 'flex', height: 420}}>
              <div style={{width: 400, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F6FD'}}>
                {c.art === 'notify' ? (
                  <div style={{width: 320, background: '#fff', borderRadius: 26, border: '4px solid #22324A', padding: 16, boxShadow: '0 10px 24px rgba(0,0,0,0.1)'}}>
                    {c.panel && <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 900, color: '#22324A', marginBottom: 8}}>{c.panel}</div>}
                    {(c.rows ?? []).map(([t, st, cc]) => <div key={t} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 12px', margin: '8px 0', borderRadius: 12, background: '#F2F6FD', fontFamily: FONT, fontSize: 20, fontWeight: 800}}><span style={{color: '#22324A'}}>{t}</span><span style={{color: cc}}>{st}</span></div>)}
                  </div>
                ) : c.art === 'rfid' ? (
                  <svg width={360} height={260} viewBox="0 20 420 260"><rect x={30} y={60} width={220} height={150} rx={18} fill="#fff" stroke={W2} strokeWidth={5} /><path d="M70 135 h40 M70 110 h80 M70 160 h60" stroke={W2} strokeWidth={8} strokeLinecap="round" />
                    {[0, 1, 2].map((k) => <path key={k} d={`M${290 + k * 28} ${100 - k * 14} a ${60 + k * 30} ${60 + k * 30} 0 0 1 0 ${70 + k * 28 * 2}`} fill="none" stroke={ORANGE} strokeWidth={7} opacity={0.4 + 0.6 * ((Math.floor(f / 6) + k) % 3 === 0 ? 1 : 0.3)} />)}</svg>
                ) : <Icon name={c.art ?? 'chip'} size={200} color={W2} />}
              </div>
              <div style={{padding: '26px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                {c.bullets.map((b, k) => <div key={b} style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#22324A', lineHeight: 1.3, margin: '12px 0', opacity: ease(f, 30 + i * 16 + k * 6, 8)}}>• {b}</div>)}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const VOutro: React.FC<SP> = ({f, sc}) => {
  const a = pop(f, 6, 12), b = ease(f, 26, 12);
  return (
    <>
      <Robot pose={f < 40 ? 'wave' : 'cheer'} since={0} x={310} bottom={880} h={640} glow />
      <div style={{position: 'absolute', left: 60, right: 60, top: 920, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 100, fontWeight: 900, color: BLUE, transform: `scale(${a})`, textShadow: `0 0 34px ${BLUE}66`}}>{sc.title ?? '关注锐新科技'}</div>
        <div style={{fontSize: 46, fontWeight: 900, color: TXT, marginTop: 6, opacity: b}}>{sc.sub ?? '一分钟拆透一个单片机项目'}</div>
        <div style={{width: 700 * ease(f, 34, 14), height: 4, background: ORANGE, margin: '34px auto'}} />
        <div style={{fontSize: 50, fontWeight: 900, color: ORANGE, opacity: ease(f, 44, 10)}}>下期我们讲：{sc.next}</div>
        {(sc.items as string[]).map((t, i) => <div key={t} style={{fontSize: 40, fontWeight: 800, color: TXT, marginTop: 18, opacity: ease(f, 56 + i * 10, 10)}}><span style={{color: TEAL}}>▸ </span>{t}</div>)}
      </div>
    </>
  );
};

export const V_SCENES: Record<string, React.FC<SP>> = {
  title: VTitle, kit: VKit, real: VReal, layers: VLayers, flow: VFlow, chapter: VChapter, chain: VChain, ring: VRing,
  pins: VPins, pwm: VPwm, chainlist: VChainList, upgrade: VUpgrade, outro: VOutro,
};

/** 9:16 cut. */
export const NeonVertical: React.FC<{script: NScript; t: NTiming}> = ({script, t}) => {
  const f = useCurrentFrame();
  const idx = t.scenes.findIndex((x) => f >= x.from && f < x.from + x.dur);
  const b = t.beats.find((x) => f >= x.from && f < x.from + x.dur);
  const light = idx >= 0 && ['kit', 'upgrade'].includes(t.scenes[idx].sc.type);
  return (
    <LongCtx.Provider value={t.tm}>
      <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
        <VBg f={f} />
        {t.beats.map((x) => <Sequence key={x.id} from={x.from} durationInFrames={x.dur}><Audio src={staticFile(`${script.voDir}/${x.id}.mp3`)} /></Sequence>)}
        {t.scenes.map((x) => {
          const C = V_SCENES[x.sc.type];
          const sc = {...x.sc, ...(x.sc.v ?? {})} as NScene;
          return <Sequence key={x.sc.id} from={x.from} durationInFrames={x.dur}><SceneWrap f={f - x.from} dur={x.dur}><C f={f - x.from} sc={sc} /></SceneWrap></Sequence>;
        })}
        {b && <div style={{position: 'absolute', left: 50, right: 50, top: 1530, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 95, opacity: ease(f, b.from, 5)}}>
          <div style={{fontFamily: FONT, fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1.35, textAlign: 'center', background: 'rgba(5,10,16,0.82)', border: '2px solid rgba(47,224,184,0.4)', borderRadius: 18, padding: '14px 30px'}}>
            <Hl t={b.text} c={ORANGE} />
          </div>
        </div>}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1770, textAlign: 'center', fontFamily: FONT, fontSize: 30, fontWeight: 900, color: light ? '#4E5D70' : 'rgba(124,138,156,0.85)', zIndex: 90}}>
          <span style={{color: BLUE}}>@{script.meta.brand ?? '锐新科技'}</span> · 一分钟拆透一个单片机项目
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1850, display: 'flex', justifyContent: 'center', gap: 10, zIndex: 90}}>
          {t.scenes.map((x, i) => <div key={x.sc.id} style={{width: i === idx ? 44 : 18, height: 6, borderRadius: 3, background: i === idx ? ORANGE : 'rgba(124,138,156,0.45)'}} />)}
        </div>
      </AbsoluteFill>
    </LongCtx.Provider>
  );
};
