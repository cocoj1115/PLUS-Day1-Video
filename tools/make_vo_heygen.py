# Regenerate the voiceover from script.md with a HeyGen voice (free turbo model).
# Usage (needs the heygen CLI + HEYGEN_API_KEY, injected by the environment proxy):
#   HEYGEN_API_KEY=proxy-injected python3 tools/make_vo_heygen.py script.md assets/voice 95d52e056b7b495dab8f090b44fa2ec4
import json, os, re, subprocess, sys, urllib.request

src, outdir, voice_id = sys.argv[1], sys.argv[2], sys.argv[3]
model = os.environ.get("HEYGEN_TTS_MODEL", "heygen-voice-1-turbo-free")
SECTION_GAP = 0.5  # silence appended after each section, seconds

md = open(src, encoding="utf-8").read()
secs = re.findall(r"^## (\d)\. (.+?)(?: \(.*?\))?\n\*\*VO:\*\*\n(.*?)\n\*\*On screen", md, re.S | re.M)
heygen = os.path.expanduser("~/.local/bin/heygen")

meta, t0 = [], 0.0
for n, title, vo in secs:
    text = " ".join(vo.split())
    r = subprocess.run([heygen, "model", "audio", "tts", "create", "--voice-id", voice_id, "--model", model,
                        "--language", "en", "--with-timestamps", "--text", text], capture_output=True, text=True)
    data = json.loads(r.stdout)["data"]
    sid = f"s{n}"
    raw = f"{outdir}/{sid}.raw.wav"
    urllib.request.urlretrieve(data["audio_url"], raw)
    # pad the end of each section with a short silence, normalise to 48 kHz mono
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"apad=pad_dur={SECTION_GAP}",
                    "-ar", "48000", "-ac", "1", f"{outdir}/{sid}.wav"], check=True)
    os.remove(raw)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                f"{outdir}/{sid}.wav"], capture_output=True, text=True).stdout)
    words = [{"text": w["text"], "start": round(w["start_time"], 3), "end": round(w["end_time"], 3)}
             for w in data.get("original_words", []) if w["text"].strip()]
    meta.append({"id": sid, "title": title.strip(), "text": text, "start_s": round(t0, 3),
                 "duration_s": round(dur, 3), "words": words})
    print(f"{sid} {t0:6.1f}s +{dur:4.1f}s  {title.strip()}")
    t0 += dur

json.dump({"provider": "heygen", "model": model, "voice_id": voice_id, "voice_name": "Cassidy - Expressive & Imaginative",
           "section_gap_s": SECTION_GAP, "total_s": round(t0, 3), "sections": meta},
          open(f"{outdir}/vo_meta.json", "w"), indent=2)
print("TOTAL", round(t0, 1), "s")
