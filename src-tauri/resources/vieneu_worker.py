#!/usr/bin/env python3
"""App-private VieNeu v3 Turbo ONNX worker. No HTTP server, no cloud inference.

Protocol:
  --prepare: preload model (first run downloads to app-private HF_HOME), list voices.
  --stdio: one JSON request per stdin line; one OIPTV_RESULT JSON response per line.
The worker stays alive so adjacent Live TTS sentences reuse the loaded model.
"""
import base64
import contextlib
import json
import os
import sys
import tempfile
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("DO_NOT_TRACK", "1")
MAX_TEXT = 360
MAX_AUDIO = 7 * 1024 * 1024
PREFIX = "OIPTV_RESULT:"

def emit(payload):
    print(PREFIX + json.dumps(payload, ensure_ascii=False), flush=True)

def engine_load():
    # Some inference dependencies print progress to stdout. Keep protocol clean.
    with contextlib.redirect_stdout(sys.stderr):
        from vieneu import Vieneu
        engine = Vieneu(mode="v3turbo")
        voices = [str(name) for _label, name in engine.list_preset_voices()]
    if not voices:
        raise RuntimeError("VieNeu has no available voices")
    return engine, set(voices)

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode not in ("--prepare", "--stdio"):
        raise SystemExit("Mode must be --prepare or --stdio")
    engine, voices = engine_load()
    if mode == "--prepare":
        emit({"ready": True, "voices": sorted(voices), "engine": "v3turbo"})
        return
    emit({"ready": True, "worker": "vieneu"})
    for line in sys.stdin:
        try:
            if len(line) > 2400:
                raise ValueError("Request too large")
            request = json.loads(line)
            call_id = str(request.get("id", ""))[:80]
            voice = str(request.get("voice", ""))
            text = str(request.get("text", "")).strip()
            if voice not in voices:
                raise ValueError("Voice not available in loaded VieNeu model")
            if not text or len(text) > MAX_TEXT:
                raise ValueError("Text must contain 1–360 characters")
            with tempfile.TemporaryDirectory(prefix="openiptv-vieneu-") as folder:
                path = str(Path(folder) / "speech.wav")
                with contextlib.redirect_stdout(sys.stderr):
                    audio = engine.infer(text=text, voice=voice)
                    engine.save(audio, path)
                data = Path(path).read_bytes()
            if not (44 <= len(data) <= MAX_AUDIO and data[:4] == b"RIFF" and data[8:12] == b"WAVE"):
                raise ValueError("VieNeu did not create a valid WAV")
            emit({"id": call_id, "audioBase64": base64.b64encode(data).decode("ascii"), "mime": "audio/wav"})
        except Exception as exc:
            emit({"id": locals().get("call_id", ""), "error": str(exc)[:300]})

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        emit({"fatal": str(exc)[:450]})
        raise
