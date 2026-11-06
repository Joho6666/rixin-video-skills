# 「夜光实验室」— the look that replaced the neon/blueprint cuts (2026-11-06)

Reference build: `fcc-video/remotion/src/long/v3/` — `style.tsx` (tokens + components), `TeardownV3.tsx` (layouts, timing, composition `RX-TEARDOWN-PILLBOX-V3`), script `src/scripts/v3_pillbox.json`. Output `智能药盒拆解_锐新科技_V3_16x9.mp4` (2:27).

## Why it exists
Neon dark diagrams read as "animated PPT"; the blueprint cut looked premium but abstract. Audience/group feedback on the presenter version: robot blocked content, gestured off-screen, was too big, text too small. V3 fixes all of it and makes footage the ground.

## Rules
| Thing | Rule |
|---|---|
| Ground | Full-bleed AI footage (`Plate`, graded, vignette). Information pages = the same clip **blurred** behind a **sharp framed window** of it |
| Info | Frosted `Glass` cards (backdrop blur 22, 1px white border, 28 radius). Never text on plain black |
| Colour | Graphite `#0B0D10`, one brand blue `#2E8BFF` / `#7CC0FF`; amber only for human/"life" moments; green only for ✓ |
| Type | Headlines 100–170 px (`BigType`, types in per character, `【】` = blue); body ≥ 32 px; numbers in mono 100 px+; subtitle 50 px white, keyword blue, no box |
| Presenter | Sprite robot (never AI-regenerated) **bottom-left, ~290 px tall, facing right toward content**; hidden in hook / story / outro (AI robot clip there); pose per beat + optional speech bubble (≤75 frames) |
| Layout guard | Left column x 120–640: card top ≥ 300, bottom ≤ 650 (robot head starts ≈ y 680). Windows start at x ≥ 660 |
| Hook | **One screen only**: a single strong question over a moving shot (user cut the 2-line hook: "钩子太长了，只保留一个画面") |
| Structure | hook → problem (human footage) → reveal (exploded orbit) → parts n/7 (macro window + card + mini exploded locator) → chapter card → 3 steps → deep dive question → upgrades → outro CTA ("评论区发出来") + next episode |
| Music | BGM ~-25 LUFS under -16 LUFS voice (`BGM_LUFS=-25`), limiter 0.75 → peak ≈ -2 dB. Scene starts **snapped to the beat** (`snap()` with BPM + first-beat offset); whoosh on every scene, boom on chapter starts |
| Voice | TTS tempo 1.1 (1.05 felt flat) |

## Beat snapping
Find BPM + phase once per track with `scripts/beat_grid.py <music>` (numpy onset envelope + autocorrelation; Perfect Sense = 95.7 BPM, first beat 0.418 s). Scene start = next beat after the previous scene's narration ends; the scene before absorbs the gap. Regenerate the mixer cue JSON from the same timing.
