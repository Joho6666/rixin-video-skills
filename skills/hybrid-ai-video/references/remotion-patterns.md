# Remotion patterns for hybrid videos

Working reference project: `C:/Users/JOHO/Documents/Codex/2026-09-26/files-pasted-by-the-user-github/work/repo/fcc-video/remotion/src/long/`
- `bp.tsx` — blueprint design system (tokens, `Sheet`, `Frame`, `Leader`, `Exploded`, `Scope`, `Heading`, fonts in `public/fonts`).
- `TeardownBP.tsx` — 12-scene teardown with three AI clips (`AiClip`), composition `RX-TEARDOWN-PILLBOX-BP`.
- `Teardown.tsx` — narration-driven timing (`BEATS`, `TEARDOWN_SCENES`) from `scripts/<id>.json` + `vo_<id>.json`.

## AiClip: play once, then hold
```tsx
const AiClip: React.FC<{f: number; from: number; len: number; src: string; hold: string; style: React.CSSProperties}> = ({f, from, len, src, hold, style}) => (
  <div style={{position: 'absolute', ...style}}>
    {f < from + len
      ? <Sequence from={from} durationInFrames={len} layout="none"><OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
      : <Img src={staticFile(hold)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
  </div>
);
// hold frame: ffmpeg -ss 3.5 -i clip.mp4 -frames:v 1 hold.png   (or -sseof -0.1 for the last frame)
```
`len` = only the good seconds (×30 fps). Clips are 24 fps; `OffthreadVideo` retimes to the 30 fps composition by itself — no conversion needed. Grade with `filter: 'saturate(0.85) contrast(1.06) brightness(0.96)'`.

## Hiding the watermark and the dark box
- Dark-background clip/plate on a dark sheet: `mixBlendMode: 'lighten'`.
- Side fade so text stays readable: `maskImage: 'linear-gradient(90deg, transparent 30%, black 46%)'` (+ `WebkitMaskImage`).
- Watermark is bottom-right: scale the clip so that corner falls off-canvas, or put the transparent end of the mask there.

## Mascot
- Talking (most of the video): sprite set `public/rixin/<pose>.png` + `_talk` (ears/chest light up, the robot has no mouth) via `Robot` from `long/common.tsx`; wrap the composition in `LongCtx.Provider value={TM}` so loudness drives it. Pose per beat: `pose` field in the script JSON.
- AI clip (hello/bye ≤5 s): `AiClip` with `mixBlendMode: 'lighten'` and a side mask — see S12 in `TeardownBP.tsx` (`left: -270, top: 150, width: 1500`).

## Beat sync
Scene components receive `b` = local start frame of each narration beat. Place clips on the beat that describes them; if a clip opens a scene, shift that scene's other animations with `g = (x) => SH + (x - b0) * k` so nothing animates under the clip.

## Exploded view as animated layers
`python ~/.claude/skills/hybrid-ai-video/scripts/find_bands.py exploded.png` → bands `[y0,y1]` + x extents. Paste into `EX_BANDS` / `EX_X` in `bp.tsx`; `<Exploded spread={0.5→1.08}>` opens the stack, `dim` highlights the layer the narration names; `Leader` lines start at `EX_X[i][0]`.
