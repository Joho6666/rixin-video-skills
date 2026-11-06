---
name: hybrid-ai-video
description: Use when a video should combine code-rendered motion graphics (Remotion) with AI image generation and AI image-to-video shots — e.g. 代码视频 + 生图 + 生视频 联合、拆解/科普/产品讲解视频要加真实感镜头、把企业吉祥物/虚拟形象放进讲解、去 AI 味提升质感, or when deciding which parts of a video to give to gpt-image / grok-imagine-video / Seedance versus Remotion.
---

# Hybrid AI Video（代码视频 + 生图 + 生视频）

## Core principle
**Remotion owns every word, number and label. AI owns pixels only.** AI images are text-free plates; AI video is a few 3–5 s hero shots placed on narration beats. Never let a generator draw text, logos or data.

| Layer | Tool | Gets |
|---|---|---|
| Skeleton | Remotion (`fcc-video/remotion`) | timing from narration, all text/labels/formulas/subtitles, diagrams, transitions, mascot sprite while it "talks" |
| Plates | JOHO relay: `gpt-image-2` for products/technical (component markings come out right), `gpt-image-2.6-flare` for photoreal scenes | exploded views, line drawings, scene start frames — **no text** in the result |
| Hero shots | JOHO relay `grok-imagine-video-1.5` image-to-video | camera orbit on a product render, real-life usage scene, mascot entrance/wave (≤5 s) |

**Look (current best, 2026-11)**: 「夜光实验室」 — footage as the ground, info on frosted glass cards, huge type, robot bottom-left facing right. Rules + reference build: `references/lab-style.md`. Older options: long/teardown videos can use the blueprint system (`bp.tsx`, dark `#0E0F11` + one blue accent). Short 8-segment 锐新 科普 (55–70 s, 9:16 + 16:9) stay on the paper template of skill rixin-explainer-video; there, grade clips warmer/lighter and drop `lighten` (paper is light).

API details, prices, and the fallbacks: `references/apis.md`. Remotion patterns (AiClip, band-sliced exploded view, blend/mask, beat sync): `references/remotion-patterns.md`.

## Workflow
1. **Script + voice first** (narration decides timing; 锐新 uses `zh_male_zhengtaikp`, see skill rixin-explainer-video). Mark 3–5 beats where real motion helps more than a diagram: product reveal, "in use" moment, mascot hello/bye.
2. **Plates**: generate 2–3 variants per plate in parallel (relay allows ~3 concurrent), pick, put in `remotion/public/<project>/`. Exploded view → slice into layers with `scripts/find_bands.py` so Remotion can animate and label each layer.
3. **Start frames for video** (`scripts/start_frame.py`): product shot = our chosen plate on the video's dark ground; mascot = the **original sprite composited** (never regenerate the mascot through an image model — logos drift); scene = a fresh gpt-image-2.6 still.
4. **One test clip** (`scripts/grok_i2v.mjs`), review it, then the rest. Quote cost before the first paid call: grok i2v ≈ **$0.71 per 5 s**. Send start frames as ~150 KB JPEG (≤1280 px) and submit **one at a time** — the relay drops parallel requests and big PNG uploads (submit fails are not billed; fetch drops are recovered with `--fetch`).
5. **Review every clip** before compositing: frame strip + zoom crops on logo/chest text, hands/fingers, and anything that drifts out of frame at the end (use only the good seconds).
6. **Composite** with `AiClip` (play once → hold a still), grade to the palette, crop/mask the bottom-right **"Grok" watermark**, label renders "AI 生成示意".
7. Render on E:, mix (`fcc-video/mix_music.py <render.mp4> <cues.json> <final.mp4>`, `VOICE=1`; cues = `{total, shots:[{from, sfx}]}` built from the scene start times, example `fcc-video/mix_timing_teardown_pillbox_vo.json`), check stills of every scene, ffprobe + loudness, open the file for the user.

## Common mistakes
| Mistake | Fix |
|---|---|
| Posting `image_url`/`seconds` to `/videos` | i2v is `POST /videos/generations` with `image:{url:dataURI}`, `duration`, `aspect_ratio`, `resolution` |
| `--ref mascot.png` into an image model to "keep" the mascot | Composite the real sprite as the start frame; AI video only for short gestures; zoom-check the logo |
| Text, numbers or UI copy inside AI images/clips | Prompt "no text"; add every label in Remotion |
| Visible dark box around AI images on the dark sheet | `mixBlendMode: 'lighten'` + edge `maskImage` gradient |
| Full-screen AI clip that ignores the beat | Put the clip where the narration describes it (e.g. "确认你真的吃了" over the hand taking the pill), then cut to the diagram |
| Background `&` job killed with the shell → paid clip "lost" | Every submit is logged to `ledger.jsonl`; recover with `grok_i2v.mjs --fetch <id> out.mp4` |
| Choosing Seedance `seedance2.5-720p-ac` | Flat $5.5/request, ≥10 s, flaky — use `dd-720p` ($0.45/s) only for a quality comparison |
| Presenter blocks content / points off-screen / too big | Robot bottom-left ~290 px facing right; keep left cards between y 300–650; check a still of every page |
| Text too small on phones | Body ≥ 32 px, headlines 100 px+, subtitle 50 px |
| Hook drags (2 screens, 8 s) | One question screen over one moving shot, ~5 s |
| Peak hits 0 dB after raising the music | Limiter 0.75 in `mix_music.py`, `BGM_LUFS=-25` |
| AI clips look like another film | Same palette in the prompt, CSS `filter` grade, frame the clip inside the design system (FIG. window / sheet), keep ≤5 shots per video |
