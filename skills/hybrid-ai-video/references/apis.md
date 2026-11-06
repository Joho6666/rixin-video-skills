# APIs, prices, gotchas (measured 2026-11)

Keys live in `C:/Users/JOHO/tools/joho-image/keys.env` — never print them.

## Images — JOHO relay
`node C:/Users/JOHO/tools/joho-image/joho-image.mjs gpt "<prompt>" --model gpt-image-2 --size 1536x1024 -o out.png`
- Models: `gpt-image-1/1.5/2`, `gpt-image-2.5-flare|sunburst`, `gpt-image-2.6-flare|sunburst`; grok: `grok-imagine-image(-2.0|-quality)`. `list` prints them (free).
- gpt-image-2 got PCB module markings right (HX711, DS1302, SG90); grok images garble small text. 2.6-flare: good photoreal scenes.
- Output size is decided upstream (asked 1024x1536, got 1199x1312) — always read the real size.
- Relay is self-hosted: image A/B is free, ~3 concurrent max. If `fetch failed`: relay down → ask the user to restart it.
- Prompt recipe for plates: subject + "isometric exploded view / technical line drawing" + exact background colour of the video (`#0E0F11`) + "Absolutely no text, no labels, no numbers, no logos".

## Image-to-video — grok via JOHO relay (works)
`node ~/.claude/skills/hybrid-ai-video/scripts/grok_i2v.mjs start.png out.mp4 "<prompt>" [model] [seconds]`
- `POST {base}/videos/generations` body `{model:'grok-imagine-video-1.5', prompt, image:{url:'data:image/png;base64,…'}, duration:5, aspect_ratio:'16:9', resolution:'720p'}` → `{request_id}`; poll `GET {base}/videos/{id}`; result url may be relative (prefix origin, send auth header).
- **$0.71 per 5 s clip** (`usage.cost_in_usd_ticks/1e10`), ~1–2 min, 1280×720 @24 fps, **"Grok" watermark bottom-right**.
- Prompt recipe: describe motion + camera only ("slow orbit right, subtle push-in, layers drift apart"), restate "keep everything exactly as in the image, no new objects, no text". For people: "realistic hands with five fingers, natural slow movements".
- Observed: product orbit = real 3D parallax but parts can drift out of frame in the last 1–1.5 s; mascot wave 5 s kept the R logo and chest text; elderly-hands shot clean.
- Video edit (`/videos/edits`, ≤8 s input, ~$0.08/s) exists too — see memory joho-relay / grok_replica scripts.

## Fallbacks
- **Seedance 2.5** via aicost.me (`D:/research/seedance.mjs`, keys in `D:/video-replicate-studio/apps/studio/.env.local`): use `seedance2.5-dd-720p` (key 2, $0.45/s, min 5 s). Avoid `720p-ac` ($5.5/request, ≥10 s, flaky). Quote before every submit.
- **DashScope wan** (`wan2.2-t2i`, animate): account was in arrears 2026-11-05 → returns `Arrearage`.
- **Volcengine ARK** (Seedream/Seedance): needs `arkcli auth login volc-sso` by the user when the token expires.
