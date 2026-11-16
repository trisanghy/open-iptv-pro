#!/usr/bin/env python3
"""Open IPTV Pro VieNeu local premium voice bridge. No audio goes to a speech API."""
import json
import os
import sys
import tempfile
import wave
from pathlib import Path

def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ("warm", "speak"):
        raise ValueError("Usage: vieneu-bridge.py warm|speak preset output.wav")
    mode, requested, output = sys.argv[1:]
    if not requested or len(requested) > 60:
        raise ValueError("Giọng đọc không hợp lệ")
    out = Path(output)
    if not out.is_absolute() or out.suffix.lower() != ".wav":
        raise ValueError("File WAV đầu ra không hợp lệ")
    from vieneu import Vieneu
    engine = Vieneu(mode="v3turbo", backend="onnx", precision="fp32")
    voices = engine.list_preset_voices()
    available = {str(voice_id) for _, voice_id in voices}
    if requested not in available:
        raise RuntimeError("Giọng '" + requested + "' không có trong mô hình VieNeu hiện tại")
    if mode == "warm":
        sentence = "Xin chào, mô hình giọng nói tiếng Việt đã sẵn sàng."
    else:
        sentence = sys.stdin.read(800).strip()
        if not sentence or len(sentence) > 360:
            raise ValueError("Câu TTS cần từ 1 tới 360 ký tự")
    audio = engine.infer(sentence, voice=requested)
    out.parent.mkdir(parents=True, exist_ok=True)
    engine.save(audio, str(out))
    with wave.open(str(out), "rb") as wav:
        if wav.getnframes() <= 10 or wav.getnchannels() < 1:
            raise RuntimeError("VieNeu chưa tạo được WAV hợp lệ")
    print(json.dumps({"ready": True,"voice": requested,
                      "sample_rate": 48000},ensure_ascii=False),flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("VieNeu: " + str(exc).replace("\n"," ")[:450],file=sys.stderr)
        sys.exit(1)
