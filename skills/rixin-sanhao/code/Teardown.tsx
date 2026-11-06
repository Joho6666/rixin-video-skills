// "40秒拆解一个毕设项目" — music-only dark-tech teardown, 1920x1080. All text vector, kit photo is the one raster asset.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {LongCtx, LongTiming} from './timing';
import tdScript from '../scripts/teardown_pillbox.json';
import tdVo from '../vo_td_pillbox.json';
import tdEnv from '../vo_td_pillbox_env.json';
import {FONT, Icon, Robot, ease, pop} from './common';

export const FPS_T = 30;
export const BG = '#070C12', TEAL = '#2FE0B8', ORANGE = '#FF7A1A', BLUE = '#3D8BFF', TXT = '#E8EEF5', DIM = '#7C8A9C';
export const s = (sec: number) => Math.round(sec * FPS_T);

/* ---------- shared bits ---------- */

export const DarkBg: React.FC<{f: number}> = ({f}) => {
  const x = interpolate(f % 300, [0, 300], [-400, 2300]);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0F1A24 0%, ${BG} 70%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(47,224,184,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(47,224,184,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px'}} />
      <div style={{position: 'absolute', left: x, top: -200, width: 90, height: 1500, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(47,224,184,0.10), transparent)', filter: 'blur(8px)'}} />
      <div style={{position: 'absolute', left: x - 700, top: -200, width: 40, height: 1500, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(61,139,255,0.08), transparent)', filter: 'blur(6px)'}} />
    </AbsoluteFill>
  );
};

export const Tag: React.FC<{t: string}> = ({t}) => (
  <div style={{position: 'absolute', left: 40, top: 28, fontFamily: 'Consolas, monospace', fontSize: 16, letterSpacing: 3, color: 'rgba(124,138,156,0.75)'}}>{t}</div>
);

export const Head: React.FC<{t: string; f: number; y?: number; size?: number; color?: string}> = ({t, f, y = 60, size = 52, color = TXT}) => {
  const p = ease(f, 2, 12);
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color, opacity: p, transform: `translateY(${(1 - p) * -16}px)`, letterSpacing: 2}}>{t}</div>;
};

export const Foot: React.FC<{t: string; f: number; at: number; color?: string}> = ({t, f, at, color = TEAL}) => {
  const p = ease(f, at, 12);
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color, opacity: p, letterSpacing: 3}}>{t}</div>;
};

/** Glowing node: circle or rounded box with an icon and two label lines. */
export const NodeC: React.FC<{x: number; y: number; r?: number; icon: string; t: string; sub?: string; c: string; p: number; glow?: number}> = ({x, y, r = 62, icon, t, sub, c, p, glow = 0}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, opacity: Math.min(1, p * 1.4), transform: `scale(${0.5 + 0.5 * Math.min(1, p)})`}}>
    <div style={{width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${c}`, background: `${c}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 ${14 + glow * 26}px ${c}${glow > 0.5 ? 'AA' : '55'}`}}><Icon name={icon} size={r * 1.0} color={c} /></div>
    <div style={{width: 300, marginLeft: r - 150, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 900, color: TXT, marginTop: 12}}>{t}</div>
    {sub && <div style={{width: 300, marginLeft: r - 150, textAlign: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DIM, marginTop: 4}}>{sub}</div>}
  </div>
);

export const Box: React.FC<{x: number; y: number; w: number; h: number; c: string; p: number; children?: React.ReactNode}> = ({x, y, w, h, c, p, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', border: `3px solid ${c}`, borderRadius: 16, background: 'rgba(10,18,26,0.85)',
    boxShadow: `0 0 22px ${c}44`, opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * Math.min(1, p)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{children}</div>
);

/** Line that draws itself from (x1,y1) to (x2,y2) with a travelling dot. */
export const Wire: React.FC<{pts: [number, number][]; c: string; p: number; f: number; dot?: boolean; w?: number}> = ({pts, c, p, f, dot = true, w = 3}) => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const len = segs.reduce((a, b) => a + b, 0);
  const d = 'M' + pts.map((q) => q.join(' ')).join(' L');
  let dp: [number, number] | null = null;
  if (dot && p >= 1) {
    let t = ((f * 6) % len); let i = 0;
    while (i < segs.length - 1 && t > segs[i]) { t -= segs[i]; i++; }
    const a = pts[i], b = pts[i + 1], k = t / segs[i];
    dp = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1920} height={1080}>
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeOpacity={0.85} strokeDasharray={`${len * Math.min(1, p)} ${len}`} strokeLinecap="round" strokeLinejoin="round" />
      {dp && <circle cx={dp[0]} cy={dp[1]} r={5} fill="#fff" style={{filter: `drop-shadow(0 0 6px ${c})`}} />}
    </svg>
  );
};

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 26, color = TXT}) => (
  <div style={{fontFamily: 'Consolas, "Cambria Math", monospace', fontSize: size, fontWeight: 700, color, letterSpacing: 1, whiteSpace: 'nowrap'}}>{children}</div>
);

/* ---------- scenes (f = frames since scene start) ---------- */

export const S1Title: React.FC<{f: number}> = ({f}) => {
  const a = pop(f, 4, 12), b = ease(f, 16, 12), c = pop(f, 30, 14), line = ease(f, 40, 16);
  return (
    <>
      <Tag t="STM32 / GRADUATION PROJECT / TEARDOWN / 01" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 120, fontWeight: 900, color: ORANGE, transform: `scale(${a})`, textShadow: `0 0 40px ${ORANGE}66`}}>智能药盒</div>
        <div style={{fontSize: 48, fontWeight: 900, color: TXT, marginTop: 18, opacity: b}}>一口气拆解一个 STM32 毕设项目</div>
        <div style={{fontSize: 76, fontWeight: 900, color: ORANGE, marginTop: 26, opacity: Math.min(1, c), transform: `scale(${0.7 + 0.3 * c})`, letterSpacing: 10}}>它是怎么提醒你吃药的</div>
        <div style={{margin: '26px auto 0', width: 420 * line, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${TEAL})`, borderRadius: 2}} />
      </div>
    </>
  );
};

// kit photo: 1672x941 shown at width 1360 from (520,160)
const KS = 1360 / 1672, KX = 520, KY = 160;
const kp = (x: number, y: number): [number, number] => [KX + x * KS, KY + y * KS];
const CALLOUTS: {t: string; sub: string; at: [number, number]; c: string}[] = [
  {t: '7 格药盒', sub: '每格放一次的药量', at: [990, 150], c: TEAL},
  {t: '0.96" OLED', sub: '时间 · 下次服药', at: [785, 360], c: BLUE},
  {t: 'HX711 + 称重传感器', sub: '称药量，判断吃没吃', at: [995, 360], c: ORANGE},
  {t: 'STM32F103C8T6', sub: '主控芯片', at: [970, 530], c: ORANGE},
  {t: 'DHT11', sub: '药品储存温湿度', at: [1148, 355], c: TEAL},
  {t: 'DS1302 时钟', sub: '断电也不丢时间', at: [820, 670], c: BLUE},
  {t: 'SG90 舵机', sub: '到点打开药格', at: [1065, 830], c: ORANGE},
  {t: '红外 + 喇叭', sub: '检测开盖 · 语音提醒', at: [1345, 790], c: TEAL},
  {t: '蓝牙 + 手机 APP', sub: '服药记录同步', at: [1520, 420], c: BLUE},
];
export const S2Kit: React.FC<{f: number}> = ({f}) => {
  const ph = ease(f, 0, 14);
  const flash = interpolate(f, [0, 3, 12], [0, 0.8, 0], {extrapolateRight: 'clamp'});
  const lab = ease(f, s(1.6), 10);
  return (
    <>
      <AbsoluteFill style={{background: '#D9DDE2'}} />
      <Img src={staticFile('teardown/pillbox_kit.png')} style={{position: 'absolute', left: KX, top: KY, width: 1360, opacity: ph, transform: `scale(${1.08 - 0.08 * ph})`, transformOrigin: '60% 50%'}} />
      {CALLOUTS.map((c, i) => {
        const at = s(1.6) + i * 9;
        const p = ease(f, at, 10);
        const ly = 150 + i * 92;
        const [px, py] = kp(c.at[0], c.at[1]);
        return (
          <React.Fragment key={c.t}>
            <Wire pts={[[440, ly + 22], [480, ly + 22], [px, py]]} c={c.c} p={ease(f, at + 4, 10)} f={f} dot={false} w={2.5} />
            {p >= 1 && <div style={{position: 'absolute', left: px - 9, top: py - 9, width: 18, height: 18, borderRadius: 9, background: c.c, border: '3px solid #fff', boxShadow: `0 0 12px ${c.c}`}} />}
            <div style={{position: 'absolute', left: 40, top: ly, width: 400, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, fontFamily: FONT}}>
              <div style={{fontSize: 28, fontWeight: 900, color: '#14202E', borderLeft: `6px solid ${c.c}`, paddingLeft: 12}}>{c.t}</div>
              <div style={{fontSize: 19, fontWeight: 700, color: '#4E5D70', paddingLeft: 18, marginTop: 2}}>{c.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', right: 40, top: 80, fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#fff', background: '#14202E', borderRadius: 10, padding: '8px 20px', opacity: lab}}>STM32 智能药盒 · 实物组成</div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </>
  );
};

export const S3Arch: React.FC<{f: number}> = ({f}) => {
  const n = (i: number) => pop(f, 8 + i * 10, 12);
  const w = (i: number) => ease(f, 14 + i * 10, 12);
  const C = [TEAL, ORANGE, BLUE, ORANGE, TEAL];
  return (
    <>
      <Tag t="SYSTEM / ARCHITECTURE EXPLODED VIEW" />
      <Head t="一个药盒，被拆成五层能力" f={f} />
      <div style={{position: 'absolute', inset: 0, transform: 'translateY(-70px)'}}>
      <Wire pts={[[360, 520], [760, 520]]} c={TEAL} p={w(0)} f={f} />
      <Wire pts={[[820, 470], [900, 330], [1120, 300]]} c={BLUE} p={w(1)} f={f} />
      <Wire pts={[[820, 570], [900, 720], [1120, 760]]} c={ORANGE} p={w(2)} f={f} />
      <Wire pts={[[1240, 300], [1460, 360], [1540, 470]]} c={BLUE} p={w(3)} f={f} />
      <Wire pts={[[1240, 760], [1460, 680], [1540, 570]]} c={ORANGE} p={w(3)} f={f} />
      <NodeC x={300} y={520} icon="sensor" t="感知层" sub="称重 · 温湿度 · 红外开盖" c={C[0]} p={n(0)} />
      <NodeC x={790} y={520} icon="chip" t="控制决策层" sub="STM32F103 · 定时 · 判断" c={C[1]} p={n(1)} r={70} />
      <NodeC x={1180} y={300} icon="list" t="人机交互层" sub="OLED · 按键设时间" c={C[2]} p={n(2)} />
      <NodeC x={1180} y={760} icon="fan" t="执行层" sub="舵机开格 · 语音 · 蜂鸣器" c={C[3]} p={n(3)} />
      <NodeC x={1600} y={520} icon="wifi" t="通信层" sub="蓝牙 → 手机 APP" c={C[4]} p={n(4)} />
      </div>
      <Foot t="感知 → 决策 → 交互 → 执行 → 连接" f={f} at={70} />
    </>
  );
};

export const S4Loop: React.FC<{f: number}> = ({f}) => {
  const steps = [
    {t: '到点', sub: 'DS1302 时间 = 设定', icon: 'bell', c: BLUE},
    {t: '开格 + 语音提醒', sub: '舵机转 90° · 喇叭播报', icon: 'fan', c: ORANGE},
    {t: '称重变化', sub: '药少了 = 拿走了', icon: 'sensor', c: TEAL},
    {t: '记录 / 报警', sub: '吃了 → 记录；没吃 → 通知家人', icon: 'phone', c: ORANGE},
  ];
  const X = [330, 750, 1170, 1590];
  return (
    <>
      <Tag t="FUNCTION / CLOSED-LOOP REMINDER" />
      <Head t="它真正做的：到点提醒，还要确认你真的吃了" f={f} size={46} />
      {steps.map((st, i) => {
        const at = 10 + i * 18;
        return (
          <React.Fragment key={st.t}>
            {i > 0 && <Wire pts={[[X[i - 1] + 85, 470], [X[i] - 85, 470]]} c={st.c} p={ease(f, at - 6, 10)} f={f} />}
            <NodeC x={X[i]} y={470} icon={st.icon} t={st.t} sub={st.sub} c={st.c} p={pop(f, at, 12)} glow={f > at + 14 && f < at + 30 ? 1 : 0} />
          </React.Fragment>
        );
      })}
      <Wire pts={[[1590, 640], [1590, 760], [330, 760], [330, 640]]} c={ORANGE} p={ease(f, 90, 24)} f={f} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 775, textAlign: 'center', fontFamily: FONT, fontSize: 24, fontWeight: 800, color: ORANGE, opacity: ease(f, 110, 10)}}>没吃？10 分钟后再提醒一次</div>
      <Foot t="定时 → 提醒 → 确认 → 记录 → 再提醒" f={f} at={120} />
    </>
  );
};

export const S5Inter: React.FC<{f: number}> = ({f}) => {
  const a = ease(f, 0, 10), b = pop(f, 8, 12), line = ease(f, 22, 14);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontSize: 32, fontWeight: 800, color: DIM, opacity: a}}>功能看懂了</div>
      <div style={{fontSize: 110, fontWeight: 900, color: ORANGE, transform: `scale(${b})`, textShadow: `0 0 36px ${ORANGE}55`}}>原理篇</div>
      <div style={{fontSize: 52, fontWeight: 900, color: TXT, opacity: a}}>看懂它的工作原理</div>
      <div style={{margin: '24px auto 0', width: 360 * line, height: 4, background: TEAL, borderRadius: 2}} />
    </div>
  );
};

export const Zig: React.FC<{x: number; y: number; w: number; c: string; f: number; p: number; amp?: number}> = ({x, y, w, c, f, p, amp = 14}) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push(`${x + t * w * p} ${y + Math.sin(t * 18 + f / 4) * amp * (0.6 + 0.4 * Math.sin(t * 5))}`); }
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}><polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth={3} /></svg>;
};

export const Pill: React.FC<{x: number; y: number; t: string; sub?: string; c: string; p: number; w?: number}> = ({x, y, t, sub, c, p, w = 200}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 70, boxSizing: 'border-box', border: `3px solid ${c}`, borderRadius: 35, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: 'rgba(10,18,26,0.9)', opacity: Math.min(1, p * 1.4), transform: `scale(${0.6 + 0.4 * Math.min(1, p)})`}}>
    <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 900, color: TXT}}>{t}</div>
    {sub && <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 700, color: DIM}}>{sub}</div>}
  </div>
);

export const S6Step1: React.FC<{f: number}> = ({f}) => {
  const ins = [
    {t: '称重传感器', sub: 'mV 级差分信号', c: ORANGE, y: 330},
    {t: 'DHT11', sub: '单总线', c: TEAL, y: 480},
    {t: '红外模块', sub: '高 / 低电平', c: BLUE, y: 630},
  ];
  const chip = pop(f, 30, 14);
  return (
    <>
      <Tag t="01 / SIGNAL ACQUISITION" />
      <Head t="第一步：把重量、温度变成芯片能读的数" f={f} size={46} />
      {ins.map((it, i) => (
        <React.Fragment key={it.t}>
          <Pill x={120} y={it.y} t={it.t} sub={it.sub} c={it.c} p={pop(f, 6 + i * 6, 12)} w={230} />
          <Zig x={360} y={it.y + 35} w={i === 0 ? 220 : 520} c={it.c} f={f} p={ease(f, 12 + i * 6, 16)} amp={i === 0 ? 6 : i === 1 ? 12 : 0.1} />
        </React.Fragment>
      ))}
      <Box x={590} y={318} w={250} h={94} c={ORANGE} p={pop(f, 24, 12)}>
        <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 900, color: ORANGE}}>HX711</div>
        <div style={{fontFamily: FONT, fontSize: 17, fontWeight: 700, color: DIM}}>放大 128 倍 · 24 位 ADC</div>
      </Box>
      <Wire pts={[[840, 365], [900, 365]]} c={ORANGE} p={ease(f, 30, 8)} f={f} />
      <Box x={900} y={260} w={420} h={480} c={ORANGE} p={chip}>
        <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 900, color: ORANGE}}>STM32F103</div>
        <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DIM, marginBottom: 20}}>GPIO · TIM · USART</div>
        {['读称重 raw', '读温湿度', '读开盖状态', '读当前时间'].map((t, i) => (
          <div key={t} style={{width: 300, margin: '7px 0', padding: '10px 0', border: `2px solid ${TEAL}66`, borderRadius: 10, fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TXT,
            opacity: ease(f, 44 + i * 6, 8)}}>{t}</div>
        ))}
      </Box>
      <Wire pts={[[1320, 500], [1480, 500]]} c={TEAL} p={ease(f, 70, 10)} f={f} />
      <div style={{position: 'absolute', left: 1500, top: 420, opacity: ease(f, 76, 10)}}>
        <Mono size={22} color={DIM}>药量</Mono>
        <Mono size={30} color={TEAL}>W = k·(raw − offset)</Mono>
        <Mono size={18} color={DIM}>k、offset 由空盒和砝码标定</Mono>
      </div>
    </>
  );
};

export const S7Step2: React.FC<{f: number}> = ({f}) => {
  const ring = ease(f, 6, 20);
  const rows = [
    {t: 'ΔW = W₀ − W₁', c: TEAL},
    {t: 'ΔW ≥ 0.8·m药 → 已服', c: ORANGE},
    {t: '超时 10 min → 再提醒', c: ORANGE},
  ];
  return (
    <>
      <Tag t="02 / DECISION ENGINE" />
      <Head t="第二步：把数据变成判断" f={f} />
      <Wire pts={[[200, 560], [690, 560]]} c={TEAL} p={ease(f, 4, 14)} f={f} />
      <div style={{position: 'absolute', left: 230, top: 510, fontFamily: FONT, fontSize: 22, fontWeight: 800, color: DIM, opacity: ease(f, 10, 10)}}>开格前后的重量</div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <circle cx={960} cy={560} r={260} fill="rgba(10,18,26,0.85)" stroke={ORANGE} strokeWidth={4} strokeDasharray={`${1634 * ring} 1700`} transform="rotate(-90 960 560)" />
        <circle cx={960} cy={560} r={228} fill="none" stroke={`${ORANGE}44`} strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${f * 0.8} 960 560)`} />
      </svg>
      <div style={{position: 'absolute', left: 760, top: 400, width: 400, textAlign: 'center'}}>
        <Mono size={18} color={DIM}>DOSE CHECK ENGINE</Mono>
        {rows.map((r, i) => <div key={r.t} style={{marginTop: 22, opacity: ease(f, 20 + i * 14, 10)}}><Mono size={30} color={r.c}>{r.t}</Mono></div>)}
        <div style={{marginTop: 22, opacity: ease(f, 66, 10)}}><Mono size={20} color={DIM}>m药 = 单次药量（标定得到）</Mono></div>
      </div>
      <Wire pts={[[1230, 560], [1700, 560]]} c={ORANGE} p={ease(f, 72, 14)} f={f} />
      <div style={{position: 'absolute', left: 1300, top: 590, opacity: ease(f, 80, 10)}}><Mono size={26} color={ORANGE}>state = TAKEN | MISSED</Mono></div>
      <Foot t="判断的不是“到没到点”，而是“药有没有少”" f={f} at={90} color={ORANGE} />
    </>
  );
};

export const S8Step3: React.FC<{f: number}> = ({f}) => {
  const rows = [
    {pin: 'PA8', pinSub: 'TIM1 PWM', mid: '50Hz 脉宽', out: 'SG90 舵机', c: ORANGE},
    {pin: 'PB5', pinSub: 'GPIO', mid: 'S8050 三极管', out: '蜂鸣器', c: TEAL},
    {pin: 'PA2', pinSub: 'USART2', mid: '串口指令', out: 'JQ6500 语音', c: BLUE},
    {pin: 'PA9', pinSub: 'USART1', mid: '串口透传', out: '蓝牙 → APP', c: BLUE},
  ];
  return (
    <>
      <Tag t="03 / DRIVE & OUTPUT" />
      <Head t="第三步：小信号，驱动执行动作" f={f} />
      {rows.map((r, i) => {
        const y = 230 + i * 165, at = 8 + i * 12;
        return (
          <React.Fragment key={r.pin}>
            <Wire pts={[[480, y + 40], [760, y + 40]]} c={r.c} p={ease(f, at + 6, 10)} f={f} />
            <Wire pts={[[1140, y + 40], [1380, y + 40]]} c={r.c} p={ease(f, at + 12, 10)} f={f} />
            <Box x={280} y={y} w={200} h={80} c={BLUE} p={pop(f, at, 12)}>
              <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 900, color: TXT}}>{r.pin}</div>
              <div style={{fontFamily: FONT, fontSize: 15, fontWeight: 700, color: DIM}}>{r.pinSub}</div>
            </Box>
            <Box x={760} y={y} w={380} h={80} c={r.c} p={pop(f, at + 6, 12)}><div style={{fontFamily: FONT, fontSize: 26, fontWeight: 900, color: TXT}}>{r.mid}</div></Box>
            <Pill x={1380} y={y + 5} t={r.out} c={r.c} p={pop(f, at + 12, 12)} w={260} />
          </React.Fragment>
        );
      })}
      <Foot t="GPIO / 定时器 / 串口 → 驱动 → 动作" f={f} at={70} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 118, textAlign: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DIM, opacity: ease(f, 74, 10)}}>引脚为常见示例接法，以实际原理图为准</div>
    </>
  );
};

export const S9Pwm: React.FC<{f: number}> = ({f}) => {
  const width = interpolate(f, [20, 50, 70, 100], [0.5, 0.5, 1.5, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const angle = (width - 0.5) * 90;
  const px = 46; // px per ms
  const x0 = 200, yH = 380, yL = 520;
  const d: string[] = [`M${x0} ${yL}`];
  for (let k = 0; k < 2; k++) { const b = x0 + k * 20 * px * 0.6; d.push(`L${b} ${yL} L${b} ${yH} L${b + width * px} ${yH} L${b + width * px} ${yL}`); }
  d.push(`L${x0 + 2 * 20 * px * 0.6} ${yL}`);
  const draw = ease(f, 4, 16);
  return (
    <>
      <Tag t="CIRCUIT DEEP DIVE / COMPONENT LEVEL" />
      <Head t="01 · 舵机怎么知道要转多少度？看脉宽" f={f} size={44} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <path d={d.join(' ')} fill="none" stroke={TEAL} strokeWidth={4} strokeDasharray={`${3000 * draw} 3000`} />
        <line x1={x0} y1={600} x2={x0 + 20 * px * 0.6} y2={600} stroke={DIM} strokeWidth={2} opacity={ease(f, 16, 8)} />
        <text x={x0 + 10 * px * 0.6} y={636} textAnchor="middle" fontFamily="Consolas" fontSize={24} fill={DIM} opacity={ease(f, 16, 8)}>周期 20 ms (50 Hz)</text>
      </svg>
      <div style={{position: 'absolute', left: x0 - 10, top: 320, opacity: ease(f, 18, 8)}}><Mono size={28} color={ORANGE}>高电平 {width.toFixed(1)} ms</Mono></div>
      <div style={{position: 'absolute', left: 1320, top: 300, width: 400, height: 400}}>
        <svg width={400} height={400}>
          <path d="M60 300 A140 140 0 0 1 340 300" fill="none" stroke={`${ORANGE}55`} strokeWidth={3} strokeDasharray="6 8" />
          <rect x={150} y={270} width={100} height={70} rx={10} fill="#1B4DB3" stroke={BLUE} strokeWidth={3} />
          <g transform={`rotate(${angle - 90} 200 300)`}>
            <rect x={192} y={170} width={16} height={130} rx={8} fill="#fff" />
            <circle cx={200} cy={300} r={16} fill="#fff" stroke={DIM} strokeWidth={3} />
          </g>
          {[0, 90, 180].map((a) => <text key={a} x={200 + Math.cos(Math.PI - a * Math.PI / 180) * 170} y={300 - Math.sin(a * Math.PI / 180) * 170 + 8} textAnchor="middle" fontFamily="Consolas" fontSize={22} fill={DIM}>{a}°</text>)}
        </svg>
        <div style={{textAlign: 'center', marginTop: -10}}><Mono size={34} color={ORANGE}>{Math.round(angle)}°</Mono></div>
      </div>
      <Foot t="0.5 ms → 0°  ·  1.5 ms → 90°  ·  2.5 ms → 180°" f={f} at={30} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 118, textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 700, color: DIM, opacity: ease(f, 40, 10)}}>药盒里：平时 0° 盖住药格，到点转到 90° 打开</div>
    </>
  );
};

export const S10Bridge: React.FC<{f: number}> = ({f}) => {
  const p = ease(f, 4, 18);
  const bend = 6 * Math.sin(f / 8) * ease(f, 30, 10);
  const chain = ['受压变形', '应变片电阻变化', 'mV 级差分电压', 'HX711 ×128 放大', '24 位数字量'];
  return (
    <>
      <Tag t="CIRCUIT DEEP DIVE / COMPONENT LEVEL" />
      <Head t="02 · 称重传感器：惠斯通电桥" f={f} size={44} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080} opacity={p}>
        <g transform="translate(330 250)" stroke={TEAL} strokeWidth={4} fill="none">
          <path d="M150 0 L0 150 L150 300 L300 150 Z" />
          {[[75, 75, -45], [225, 75, 45], [75, 225, 45], [225, 225, -45]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-34} y={-12} width={68} height={24} fill={BG} stroke={i % 3 === 0 ? ORANGE : TEAL} /></g>
          ))}
          <circle cx={150} cy={0} r={8} fill={TEAL} /><circle cx={150} cy={300} r={8} fill={TEAL} /><circle cx={0} cy={150} r={8} fill={ORANGE} /><circle cx={300} cy={150} r={8} fill={ORANGE} />
        </g>
        {[['E+', 470, 230], ['E−', 470, 590], ['A+', 300, 410], ['A−', 650, 410]].map(([t, x, y]) => <text key={t as string} x={x as number} y={y as number} fontFamily="Consolas" fontSize={26} fill={DIM}>{t}</text>)}
        <g transform={`translate(260 700)`}>
          <path d={`M0 0 L440 ${bend} L440 ${bend + 50} L0 50 Z`} fill="#AEB7C2" />
          <path d={`M220 ${bend / 2 - 40} L220 ${bend / 2 - 8}`} stroke={ORANGE} strokeWidth={5} />
          <path d={`M208 ${bend / 2 - 22} L220 ${bend / 2 - 6} L232 ${bend / 2 - 22}`} stroke={ORANGE} strokeWidth={5} fill="none" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1000, top: 250, display: 'flex', flexDirection: 'column', gap: 18}}>
        {chain.map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: ease(f, 20 + i * 10, 10)}}>
            <div style={{width: 40, height: 40, borderRadius: 20, background: i === 3 ? ORANGE : `${TEAL}33`, border: `2px solid ${i === 3 ? ORANGE : TEAL}`, color: TXT, fontFamily: FONT, fontSize: 22, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 900, color: i === 3 ? ORANGE : TXT}}>{t}</div>
          </div>
        ))}
      </div>
      <Foot t="压一下 → 电阻变一点 → 电压差几毫伏 → 放大后才读得出来" f={f} at={74} />
    </>
  );
};

export const S11Up: React.FC<{f: number}> = ({f}) => {
  const card = (i: number) => pop(f, 14 + i * 16, 14);
  const W2 = '#1F5BD8';
  const Card: React.FC<{i: number; title: string; bullets: string[]; children: React.ReactNode}> = ({i, title, bullets, children}) => (
    <div style={{position: 'absolute', left: 170 + i * 820, top: 230, width: 760, height: 700, boxSizing: 'border-box', border: `3px solid ${W2}`, borderRadius: 18, background: '#fff', overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(31,91,216,0.15)', opacity: Math.min(1, card(i) * 1.3), transform: `translateY(${(1 - Math.min(1, card(i))) * 40}px)`}}>
      <div style={{background: W2, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 900, padding: '14px 24px'}}>升级方向 0{i + 1} &nbsp;{title}</div>
      <div style={{height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F6FD'}}>{children}</div>
      <div style={{padding: '18px 30px'}}>{bullets.map((b, k) => <div key={b} style={{fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#22324A', margin: '10px 0', opacity: ease(f, 30 + i * 16 + k * 6, 8)}}>• {b}</div>)}</div>
    </div>
  );
  return (
    <>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #F6F9FF, #E9F0FC)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontSize: 54, fontWeight: 900, color: W2, opacity: ease(f, 2, 10)}}>这类药盒课题，如何升级难度？</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#22324A', opacity: ease(f, 8, 10)}}>从“到点提醒”，升级为“确认吃对药 + 家人远程看护”</div>
      <Card i={0} title="RFID 识别药瓶" bullets={['每个药瓶贴 RFID 标签，放错格就报警', 'RC522 模块，SPI 接口', '论文多一章：药品管理']}>
        <svg width={420} height={300} viewBox="0 0 420 300">
          <rect x={30} y={60} width={220} height={150} rx={18} fill="#fff" stroke={W2} strokeWidth={5} />
          <path d="M70 135 h40 M70 110 h80 M70 160 h60" stroke={W2} strokeWidth={8} strokeLinecap="round" />
          {[0, 1, 2].map((k) => <path key={k} d={`M${290 + k * 28} ${100 - k * 14} a ${60 + k * 30} ${60 + k * 30} 0 0 1 0 ${70 + k * 28 * 2}`} fill="none" stroke={ORANGE} strokeWidth={7} opacity={0.4 + 0.6 * ((Math.floor(f / 6) + k) % 3 === 0 ? 1 : 0.3)} />)}
        </svg>
      </Card>
      <Card i={1} title="上云 + 家属微信提醒" bullets={['ESP8266 接入云平台', '没按时吃药，家人手机立刻收到', '网页后台看一周服药记录']}>
        <div style={{width: 300, background: '#fff', borderRadius: 26, border: '4px solid #22324A', padding: 18, boxShadow: '0 10px 24px rgba(0,0,0,0.1)'}}>
          <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 900, color: '#22324A', marginBottom: 12}}>服药看护</div>
          {[['08:00', '已服用', '#16A34A'], ['14:00', '未服用 · 已通知', '#E5484D'], ['20:00', '待提醒', '#7A88A3']].map(([t, st, c]) => (
            <div key={t} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 12px', margin: '8px 0', borderRadius: 12, background: '#F2F6FD', fontFamily: FONT, fontSize: 20, fontWeight: 800}}>
              <span style={{color: '#22324A'}}>{t}</span><span style={{color: c}}>{st}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

export const S12Out: React.FC<{f: number}> = ({f}) => {
  const a = pop(f, 6, 12), b = ease(f, 26, 12);
  const next = ['土壤湿度怎么测', '水泵怎么用继电器控', '数据怎么传上云'];
  return (
    <>
      <Robot pose={f < 40 ? 'wave' : 'cheer'} since={0} x={260} bottom={930} h={700} glow />
      <div style={{position: 'absolute', left: 900, top: 230, fontFamily: FONT}}>
        <div style={{fontSize: 92, fontWeight: 900, color: BLUE, transform: `scale(${a})`, transformOrigin: '0 50%', textShadow: `0 0 30px ${BLUE}66`}}>关注锐新科技</div>
        <div style={{fontSize: 44, fontWeight: 900, color: TXT, marginTop: 10, opacity: b}}>一分钟拆透一个单片机项目</div>
        <div style={{width: 640 * ease(f, 34, 14), height: 3, background: ORANGE, margin: '30px 0'}} />
        <div style={{fontSize: 34, fontWeight: 900, color: ORANGE, opacity: ease(f, 44, 10)}}>下期我们讲：智能温室大棚</div>
        {next.map((t, i) => <div key={t} style={{fontSize: 32, fontWeight: 800, color: TXT, marginTop: 16, opacity: ease(f, 56 + i * 10, 10), transform: `translateX(${(1 - ease(f, 56 + i * 10, 10)) * 30}px)`}}>
          <span style={{color: TEAL}}>▸ </span>{t}</div>)}
      </div>
    </>
  );
};

/* ---------- timeline (scene length follows the narration) ---------- */

const COMP: Record<string, {C: React.FC<{f: number}>; sfx?: string}> = {
  title: {C: S1Title, sfx: 'boom'}, kit: {C: S2Kit, sfx: 'whoosh'}, arch: {C: S3Arch, sfx: 'whoosh'}, loop: {C: S4Loop, sfx: 'whoosh'},
  inter: {C: S5Inter, sfx: 'boom'}, step1: {C: S6Step1, sfx: 'whoosh'}, step2: {C: S7Step2, sfx: 'whoosh'}, step3: {C: S8Step3, sfx: 'whoosh'},
  pwm: {C: S9Pwm, sfx: 'whoosh'}, bridge: {C: S10Bridge, sfx: 'whoosh'}, up: {C: S11Up, sfx: 'whoosh'}, out: {C: S12Out, sfx: 'ping'},
};
type TdBeat = {id: string; text: string};
const VO = tdVo as Record<string, number>;
const LEAD = 0.25, GAP = 0.12, TAIL = 0.4;
let cursor = 0;
export const BEATS: {id: string; text: string; from: number; dur: number}[] = [];
export const TEARDOWN_SCENES = (tdScript.scenes as {id: string; min: number; beats: TdBeat[]}[]).map((sc) => {
  const start = cursor;
  let t = start + s(LEAD);
  sc.beats.forEach((b) => { const d = s(VO[b.id] + GAP); BEATS.push({id: b.id, text: b.text, from: t, dur: d}); t += d; });
  const dur = Math.max(s(sc.min), t + s(TAIL) - start);
  cursor = start + dur;
  return {id: sc.id, from: start, dur, ...COMP[sc.id]};
});
export const TEARDOWN_TOTAL = cursor;
export const TM: LongTiming = {pages: [], beats: BEATS.map((b, i) => ({id: b.id, from: b.from, dur: b.dur, page: 0, idx: i})), total: TEARDOWN_TOTAL, env: tdEnv as Record<string, number[]>, voDir: tdScript.voDir};

const Subtitle: React.FC<{f: number}> = ({f}) => {
  const b = BEATS.find((x) => f >= x.from && f < x.from + x.dur);
  if (!b) return null;
  const p = ease(f, b.from, 5);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 95, opacity: p}}>
      <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff', background: 'rgba(5,10,16,0.78)', border: '1px solid rgba(47,224,184,0.35)',
        borderRadius: 12, padding: '8px 26px', letterSpacing: 1, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>{b.text}</div>
    </div>
  );
};

export const Teardown: React.FC = () => {
  const f = useCurrentFrame();
  const idx = TEARDOWN_SCENES.findIndex((x) => f >= x.from && f < x.from + x.dur);
  return (
    <LongCtx.Provider value={TM}>
      <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
        <DarkBg f={f} />
        {BEATS.map((b) => <Sequence key={b.id} from={b.from} durationInFrames={b.dur}><Audio src={staticFile(`${tdScript.voDir}/${b.id}.mp3`)} /></Sequence>)}
        {TEARDOWN_SCENES.map((x) => (
          <Sequence key={x.id} from={x.from} durationInFrames={x.dur}>
            <SceneWrap f={f - x.from} dur={x.dur}><x.C f={f - x.from} /></SceneWrap>
          </Sequence>
        ))}
        <Subtitle f={f} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 90}}>
          {TEARDOWN_SCENES.map((x, i) => <div key={x.id} style={{width: i === idx ? 34 : 14, height: 4, borderRadius: 2, background: i === idx ? ORANGE : 'rgba(124,138,156,0.4)'}} />)}
        </div>
        <div style={{position: 'absolute', right: 36, top: 26, fontFamily: FONT, fontSize: 22, fontWeight: 900, color: 'rgba(124,138,156,0.7)', zIndex: 90}}>@锐新科技</div>
      </AbsoluteFill>
    </LongCtx.Provider>
  );
};

export const SceneWrap: React.FC<{f: number; dur: number; children: React.ReactNode}> = ({f, dur, children}) => {
  const o = interpolate(f, [0, 6, dur - 5, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const z = interpolate(f, [0, dur], [1.0, 1.025]);
  return <AbsoluteFill style={{opacity: o, transform: `scale(${z})`}}>{children}</AbsoluteFill>;
};

/** Cue list for the mixer: {total, shots:[{from, sfx}]} (seconds). */
export const teardownCues = () => ({total: TEARDOWN_TOTAL / FPS_T, shots: TEARDOWN_SCENES.map((x) => ({from: x.from / FPS_T, sfx: x.sfx}))});
