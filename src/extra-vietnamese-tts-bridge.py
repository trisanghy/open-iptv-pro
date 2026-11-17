#!/usr/bin/env python3
"""Offline, isolated Vietnamese TTS adapter. No arbitrary URLs or model ids.
Download occurs only on explicit one-click installation. Inference is offline.
"""
import hashlib
import json
import os
import queue
import re
import shutil
import sys
import threading
import wave
from pathlib import Path

MODELS = {
    "vietvoice": {
        "repo": "nguyenvulebinh/VietVoice-TTS",
        "revision": "2230a5e",
        "files": {
            "model-bin.pt": "7d362c9a7d68a6df2078bfa356a15065880c01093db4d3a3a5211085c1b4c136",
        },
    },
    "f5vi": {
        "repo": "toandev/F5-TTS-Vietnamese",
        "revision": "af33608",
        "files": {
            "model_latest.safetensors": "e9b516127a463fc1df4f7acbcba149a580abc1518999f1f5ecfa0c2a90ab361d",
            "vocab.txt": None,
        },
    },
}
PROBE = "Xin chào, Open IPTV Pro đã sẵn sàng đọc bản dịch tiếng Việt."

def check_file(path, expected, min_bytes=200):
    file = Path(path)
    if not file.is_file() or file.stat().st_size < min_bytes:
        raise RuntimeError("Thiếu mô hình " + file.name)
    if expected:
        digest = hashlib.sha256()
        with file.open("rb") as stream:
            for block in iter(lambda: stream.read(4 * 1024 * 1024), b""):
                digest.update(block)
        if digest.hexdigest() != expected:
            raise RuntimeError("Sai SHA-256 của mô hình " + file.name)
    return file

def prepare(engine, cache):
    if engine not in MODELS:
        raise ValueError("Bộ đọc không được hỗ trợ")
    from huggingface_hub import hf_hub_download
    info = MODELS[engine]
    folder = Path(cache).resolve()
    folder.mkdir(parents=True, exist_ok=True)
    for filename, digest in info["files"].items():
        destination = folder / filename
        if destination.is_file():
            try:
                check_file(destination, digest)
                continue
            except RuntimeError:
                destination.unlink()
        # An immutable revision and a verified digest for the model weights.
        fetched = hf_hub_download(
            repo_id=info["repo"], revision=info["revision"],
            filename=filename, local_dir=str(folder)
        )
        check_file(fetched, digest)
    print(json.dumps({"type": "prepared", "engine": engine}), flush=True)

def open_engine(engine, cache):
    if engine not in MODELS:
        raise ValueError("Bộ đọc không được hỗ trợ")
    folder = Path(cache).resolve()
    for filename, digest in MODELS[engine]["files"].items():
        check_file(folder / filename, digest)
    # No download is permitted during streaming speech synthesis.
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    if engine == "vietvoice":
        from vietvoicetts import ModelConfig, TTSApi
        cfg = ModelConfig(model_cache_dir=str(folder))
        client = TTSApi(cfg)
        _ = client.engine
        return client
    from f5_tts.api import F5TTS
    return F5TTS(
        model="F5TTS_Base",
        ckpt_file=str(folder / "model_latest.safetensors"),
        vocab_file=str(folder / "vocab.txt"),
    )

def synthesize(engine, client, request):
    text = request.get("text")
    output = request.get("output")
    voice = request.get("voice")
    if not isinstance(text, str) or not (1 <= len(text.strip()) <= 360):
        raise ValueError("Văn bản đọc phải dài từ 1 đến 360 ký tự")
    if not isinstance(output, str) or not Path(output).is_absolute() or Path(output).suffix.lower() != ".wav":
        raise ValueError("Đường dẫn âm thanh đầu ra không hợp lệ")
    output_file = Path(output)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    if engine == "vietvoice":
        parts = str(voice).split(":")
        if len(parts) != 3 or parts[0] != "vietvoice" or parts[1] not in ("male", "female") or parts[2] not in ("northern", "central", "southern"):
            raise ValueError("Giọng VietVoice không hợp lệ")
        client.synthesize_to_file(text.strip(), str(output_file),
                                  gender=parts[1], area=parts[2], emotion="neutral")
    else:
        if voice != "f5vi:clone":
            raise ValueError("Giọng F5 không hợp lệ")
        reference = request.get("reference")
        reference_text = request.get("referenceText")
        if not isinstance(reference, str) or not Path(reference).is_file() or not isinstance(reference_text, str) or not reference_text.strip():
            raise ValueError("F5 cần mẫu WAV đã được phép sử dụng và lời thoại chính xác")
        client.infer(ref_file=reference, ref_text=reference_text,
                     gen_text=text.strip(), file_wave=str(output_file),
                     nfe_step=20)
    with wave.open(str(output_file), "rb") as wav:
        if wav.getnframes() < 100 or wav.getnchannels() < 1:
            raise RuntimeError("Bộ đọc không tạo ra WAV hợp lệ")

def serve(engine, cache):
    client = open_engine(engine, cache)
    print(json.dumps({"type": "ready", "engine": engine}), flush=True)
    incoming = queue.Queue()
    def receive():
        for line in sys.stdin:
            try:
                data = json.loads(line)
                if isinstance(data, dict) and type(data.get("id")) is int:
                    incoming.put(data)
            except (ValueError, TypeError):
                pass
        incoming.put(None)
    threading.Thread(target=receive, daemon=True).start()
    while True:
        req = incoming.get()
        if req is None:
            break
        while True:
            try:
                newer = incoming.get_nowait()
            except queue.Empty:
                break
            if newer is None:
                return
            print(json.dumps({"id": req["id"], "ok": False, "skipped": True,
                              "error": "Phụ đề cũ được thay bằng câu mới"}), flush=True)
            req = newer
        try:
            synthesize(engine, client, req)
            print(json.dumps({"id": req["id"], "ok": True}), flush=True)
        except Exception as exc:
            print(json.dumps({"id": req["id"], "ok": False, "error": str(exc)[:300]},
                             ensure_ascii=False), flush=True)

def main():
    if len(sys.argv) != 4:
        raise ValueError("Usage: extra-vietnamese-tts-bridge.py prepare|warm|serve vietvoice|f5vi CACHE_DIR")
    action, engine, cache = sys.argv[1:]
    if action == "prepare":
        prepare(engine, cache)
    elif action == "warm":
        _ = open_engine(engine, cache)
        print(json.dumps({"type": "ready", "engine": engine}), flush=True)
    elif action == "serve":
        serve(engine, cache)
    else:
        raise ValueError("Chế độ chạy không được hỗ trợ")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Vietnamese TTS: " + str(exc).replace("\n", " ")[:400], file=sys.stderr)
        raise SystemExit(1)
