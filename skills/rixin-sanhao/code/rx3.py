"""锐新三号 pipeline: one neon teardown script -> 16:9 + 9:16 videos with narration, BGM and SFX.
  python tools/rx3.py new <topic> [--from pillbox]   copy a script template to remotion/src/neon/scripts/<topic>.json
  python tools/rx3.py check <topic>                  validate fields / images / text lengths
  python tools/rx3.py voice <topic>                  TTS (剪映 zh_male_zhengtaikp, tempo 1.05) + loudness envelope
  python tools/rx3.py register                       regenerate remotion/src/neon/topics.ts (all scripts that have voice)
  python tools/rx3.py still <topic> [h|v] [sec ...]  PNG stills -> E:/rx3_out/<topic>/
  python tools/rx3.py render <topic> [h|v|both]      render + mix -> E:/rx3_out/<topic>/<title>_锐新科技_16x9|9x16.mp4
Compositions: RX3-<TOPIC>-H (1920x1080) and RX3-<TOPIC>-V (1080x1920). Scene types: see the skill rixin-sanhao.
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent          # fcc-video
RM = HERE / "remotion"
SRC = RM / "src"
NEON = SRC / "neon"
OUT = Path(os.getenv("RX3_OUT", "E:/rx3_out"))
FFBIN = Path(r"C:\Users\JOHO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin")
PY = str(HERE / ".venv" / "Scripts" / "python.exe") if (HERE / ".venv" / "Scripts" / "python.exe").exists() else sys.executable
FPS = 30
SPEAKER = os.getenv("SPEAKER", "zh_male_zhengtaikp")

REQUIRED = {
    "title": ["title", "sub"], "kit": ["img", "imgW", "callouts"], "real": ["img", "credit", "title", "points"],
    "layers": ["title", "nodes"], "flow": ["title", "steps"], "chapter": ["small", "big", "sub"],
    "chain": ["title", "inputs", "chip"], "ring": ["title", "input", "rows"], "pins": ["title", "rows"], "pwm": [],
    "chainlist": ["title", "chain"], "upgrade": ["title", "cards"], "outro": ["next", "items"],
}


def load(topic):
    return json.loads((NEON / "scripts" / f"{topic}.json").read_text(encoding="utf-8"))


def key(topic):
    return topic.upper().replace("_", "-")


def fr(sec):
    return int(sec * FPS + 0.5)


def timing(script, vo):
    """Mirror of buildTiming() in Neon.tsx (LEAD 0.25, GAP 0.12, TAIL 0.4)."""
    cur, scenes = 0, []
    for sc in script["scenes"]:
        start = cur
        t = start + fr(0.25)
        for b in sc["beats"]:
            t += fr(vo.get(b["id"], 2) + 0.12)
        dur = max(fr(sc.get("min", 3)), t + fr(0.4) - start)
        cur = start + dur
        scenes.append((sc, start, dur))
    return scenes, cur


def cues(script, vo):
    scenes, total = timing(script, vo)
    shots = []
    for i, (sc, start, _) in enumerate(scenes):
        sfx = sc.get("sfx") or ("boom" if i == 0 or sc["type"] == "chapter" else "ping" if sc["type"] == "outro" else "whoosh")
        shots.append({"from": round(start / FPS, 3), "sfx": sfx})
    return {"total": round(total / FPS, 3), "shots": shots}


def check(topic):
    s, bad = load(topic), []
    ids = set()
    for sc in s["scenes"]:
        t = sc.get("type")
        if t not in REQUIRED:
            bad.append(f"{sc['id']}: unknown type {t}")
            continue
        bad += [f"{sc['id']}: missing {k}" for k in REQUIRED[t] if k not in sc]
        for k in ("img",):
            if k in sc and not (RM / "public" / sc[k]).exists():
                bad.append(f"{sc['id']}: image not found public/{sc[k]}")
        if t == "real" and "credit" in sc and not sc["credit"].strip():
            bad.append(f"{sc['id']}: real photo needs a credit (图源)")
        if t == "kit" and len(sc.get("callouts", [])) > 9:
            bad.append(f"{sc['id']}: max 9 callouts")
        if t == "layers" and not 3 <= len(sc.get("nodes", [])) <= 5:
            bad.append(f"{sc['id']}: layers needs 3-5 nodes")
        if t == "flow" and not 2 <= len(sc.get("steps", [])) <= 4:
            bad.append(f"{sc['id']}: flow needs 2-4 steps")
        if t in ("pins",) and len(sc.get("rows", [])) > 4:
            bad.append(f"{sc['id']}: max 4 pin rows")
        for b in sc["beats"]:
            if b["id"] in ids:
                bad.append(f"duplicate beat id {b['id']}")
            ids.add(b["id"])
            plain = b["text"].replace("【", "").replace("】", "")
            if len(plain) > 24:
                bad.append(f"{b['id']}: subtitle {len(plain)} chars > 24 (split the beat)")
            if any(c.isdigit() for c in b["text"]) and "say" not in b:
                print(f"  note {b['id']}: has digits but no `say` - check TTS reads it right")
    print("\n".join(bad) if bad else f"{topic}: OK ({len(s['scenes'])} scenes, {len(ids)} beats)")
    return not bad


def voice(topic):
    s = load(topic)
    lines = [{"id": b["id"], "text": b.get("say") or b["text"].replace("【", "").replace("】", "")} for sc in s["scenes"] for b in sc["beats"]]
    (NEON / "lines").mkdir(exist_ok=True)
    (NEON / "vo").mkdir(exist_ok=True)
    (NEON / "lines" / f"{topic}.json").write_text(json.dumps(lines, ensure_ascii=False, indent=1), encoding="utf-8")
    env = dict(os.environ, LINES=f"neon/lines/{topic}", VODIR=s["voDir"], VOJSON=f"neon/vo/{topic}.json", TEMPO=os.getenv("TEMPO", "1.05"), PYTHONIOENCODING="utf-8")
    subprocess.run([PY, str(HERE / "tools" / "gen_voice_jy.py"), "all", SPEAKER], env=env, check=True)
    subprocess.run([PY, str(HERE / "tools" / "vo_env.py"), s["voDir"], f"neon/vo/{topic}.json", f"neon/vo/{topic}_env.json"], check=True)
    register()


def register():
    topics = sorted(p.stem for p in (NEON / "scripts").glob("*.json") if (NEON / "vo" / f"{p.stem}.json").exists())
    imp, rows = [], []
    for i, t in enumerate(topics):
        imp.append(f"import s{i} from './scripts/{t}.json';\nimport v{i} from './vo/{t}.json';\nimport e{i} from './vo/{t}_env.json';")
        rows.append(f"  {{key: '{key(t)}', script: s{i} as unknown as NScript, vo: v{i} as Record<string, number>, env: e{i} as unknown as Record<string, number[]>}},")
    (NEON / "topics.ts").write_text(
        "// generated by tools/rx3.py register - do not edit\nimport type {NScript} from './Neon';\n" + "\n".join(imp)
        + "\n\nexport const TOPICS: {key: string; script: NScript; vo: Record<string, number>; env: Record<string, number[]>}[] = [\n" + "\n".join(rows) + "\n];\n",
        encoding="utf-8")
    print("registered:", ", ".join(f"RX3-{key(t)}-H/V" for t in topics))


def npx(*a):
    env = dict(os.environ, TEMP="E:\\tmp_remotion", TMP="E:\\tmp_remotion")
    Path("E:/tmp_remotion").mkdir(exist_ok=True)
    subprocess.run(["npx", "remotion", *a], cwd=RM, env=env, check=True, shell=True)


def still(topic, mode="h", secs=None):
    out = OUT / topic
    out.mkdir(parents=True, exist_ok=True)
    s = load(topic)
    vo = json.loads((NEON / "vo" / f"{topic}.json").read_text(encoding="utf-8"))
    scenes, _ = timing(s, vo)
    frames = [fr(float(x)) for x in secs] if secs else [st + min(dur - 6, fr(4.5)) for _, st, dur in scenes]
    comp = f"RX3-{key(topic)}-{mode.upper()}"
    for f in frames:
        npx("still", comp, f"{out.as_posix()}/{mode}_{f:05d}.png", f"--frame={f}", "--log=error")
    print("stills ->", out)


def render(topic, mode="both"):
    s = load(topic)
    out = OUT / topic
    out.mkdir(parents=True, exist_ok=True)
    vo = json.loads((NEON / "vo" / f"{topic}.json").read_text(encoding="utf-8"))
    cue = out / "cues.json"
    cue.write_text(json.dumps(cues(s, vo), ensure_ascii=False), encoding="utf-8")
    name = s["meta"].get("title", topic)
    for m, tag in (("h", "16x9"), ("v", "9x16")):
        if mode not in (m, "both"):
            continue
        raw = out / f"raw_{tag}.mp4"
        npx("render", f"RX3-{key(topic)}-{m.upper()}", raw.as_posix(), "--concurrency=6", "--log=error")
        final = out / f"{name}_锐新科技_{tag}.mp4"
        subprocess.run([PY, str(HERE / "mix_music.py"), str(raw), str(cue), str(final)], env=dict(os.environ, VOICE="1", PYTHONIOENCODING="utf-8"), check=True)
        raw.unlink()
        print("DONE", final)


if __name__ == "__main__":
    cmd, *a = sys.argv[1:] or ["-h"]
    if cmd == "new":
        src = a[2] if len(a) > 2 and a[1] == "--from" else "template"
        dst = NEON / "scripts" / f"{a[0]}.json"
        if dst.exists():
            raise SystemExit(f"{dst} exists")
        d = json.loads((NEON / "scripts" / f"{src}.json").read_text(encoding="utf-8"))
        d["voDir"] = f"vo_rx3_{a[0]}"
        dst.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
        (RM / "public" / "rx3" / a[0]).mkdir(parents=True, exist_ok=True)
        print("created", dst, "| images go to remotion/public/rx3/" + a[0])
    elif cmd == "check":
        sys.exit(0 if check(a[0]) else 1)
    elif cmd == "voice":
        voice(a[0])
    elif cmd == "register":
        register()
    elif cmd == "still":
        still(a[0], a[1] if len(a) > 1 else "h", a[2:] or None)
    elif cmd == "render":
        render(a[0], a[1] if len(a) > 1 else "both")
    else:
        print(__doc__)
