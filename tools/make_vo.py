# Regenerate voiceover from script.md:  .venv-tts/bin/python tools/make_vo.py script.md assets/voice af_jessica 0.92
import re, json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
src, outdir, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
GAP, TAIL = 0.3, 0.6

def trim(a, sr, thr=0.01, pad=0.04):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    return a[max(0, idx[0]-int(sr*pad)): min(len(a), idx[-1]+int(sr*pad))]
md = open(src, encoding="utf-8").read()
secs = re.findall(r"^## (\d)\. (.+?)(?: \(.*?\))?\n\*\*VO:\*\*\n(.*?)\n\*\*On screen", md, re.S | re.M)
k = Kokoro("/root/.cache/hyperframes/tts/models/kokoro-v1.0.onnx", "/root/.cache/hyperframes/tts/voices/voices-v1.0.bin")
meta, t0 = [], 0.0
for n, title, vo in secs:
    text = " ".join(vo.split()).replace("—", ", ")
    sents = [s for s in re.split(r'(?:(?<=[.!?])|(?<=[.!?]["”]))\s+(?=[A-Z"“])', text) if s]
    parts, lines, t = [], [], 0.0
    for s in sents:
        a, sr = k.create(s, voice=voice, speed=speed, lang="en-us")
        a = trim(a, sr)
        lines.append({"text": s, "start": round(t, 2), "end": round(t + len(a)/sr, 2)})
        parts += [a, np.zeros(int(sr*GAP), dtype=a.dtype)]
        t += len(a)/sr + GAP
    parts[-1] = np.zeros(int(sr*TAIL), dtype=parts[0].dtype); t += TAIL - GAP
    audio = np.concatenate(parts); sid = f"s{n}"
    sf.write(f"{outdir}/{sid}.wav", audio, sr)
    meta.append({"id": sid, "title": title.strip(), "start_s": round(t0, 2), "duration_s": round(len(audio)/sr, 2), "lines": lines})
    print(sid, f"{t0:6.1f}s  +{len(audio)/sr:4.1f}s  {title.strip()}"); t0 += len(audio)/sr
json.dump({"voice": voice, "speed": speed, "provider": "kokoro-82m (local)", "sentence_gap_s": GAP, "section_tail_s": TAIL, "total_s": round(t0, 2), "sections": meta}, open(f"{outdir}/vo_meta.json", "w"), indent=2)
print("TOTAL", round(t0, 1), "s")
