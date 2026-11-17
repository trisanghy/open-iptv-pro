#!/usr/bin/env python3
"""Open IPTV Pro local Hy-MT2 MLX bridge (Apple Silicon only).

Only two allowlisted Hugging Face MLX repositories. All model files and caches
live under the app's private user-data folder, never the global HF cache.
"""
import json
import os
from pathlib import Path
import sys

MODELS = {
    "hymt18": "mlx-community/Hy-MT2-1.8B-4bit",
    "hymt7": "mlx-community/Hy-MT2-7B-4bit",
}
LANGUAGES = {
    "en": "English", "vi": "Vietnamese", "zh": "Chinese",
    "fr": "French", "es": "Spanish", "de": "German",
    "ja": "Japanese", "ko": "Korean", "pt": "Portuguese",
    "it": "Italian", "ru": "Russian", "id": "Indonesian",
    "ar": "Arabic", "hi": "Hindi", "th": "Thai",
}
NEEDED = ("config.json", "tokenizer.json", "model.safetensors")

def paths(key, base):
    if key not in MODELS:
        raise ValueError("Không hỗ trợ mô hình Hy-MT2 này")
    parent = Path(base).resolve()
    if not parent.is_absolute() or parent.name != key or parent.parent.name != "models":
        raise ValueError("Thư mục mô hình không hợp lệ")
    weights = parent / "weights"
    os.environ["HF_HOME"] = str(parent / "hub-cache")
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    return weights

def installed(weights):
    if not all((weights / f).is_file() for f in NEEDED):
        return False
    return (weights / "model.safetensors").stat().st_size > 10_000_000

def install(key, weights):
    if installed(weights):
        print(json.dumps({"ok": True, "installed": True, "model": key}), flush=True)
        return
    from huggingface_hub import snapshot_download
    weights.mkdir(parents=True, exist_ok=True)
    snapshot_download(
        repo_id=MODELS[key],
        local_dir=str(weights),
        allow_patterns=["*.json","*.jinja","*.safetensors","*.txt","*.model"],
        max_workers=3,
    )
    if not installed(weights):
        raise RuntimeError("Tải Hy-MT2 chưa hoàn chỉnh; kiểm tra mạng và dung lượng trống")
    print(json.dumps({"ok": True, "installed": True, "model": key}), flush=True)

def worker(key, weights):
    if not installed(weights):
        raise RuntimeError("Chưa cài đầy đủ mô hình " + key)
    from mlx_lm import generate, load
    model, tokenizer = load(str(weights))
    print(json.dumps({"type": "ready", "model": key}), flush=True)
    for line in sys.stdin:
        try:
            req = json.loads(line)
            ident = req.get("id")
            source, target = req.get("source"), req.get("target")
            sentence = req.get("text", "")
            if source not in LANGUAGES or target not in LANGUAGES:
                raise ValueError("Ngôn ngữ Hy-MT2 không hợp lệ")
            if not isinstance(sentence, str) or not 0 < len(sentence.strip()) <= 1200:
                raise ValueError("Phụ đề dài hoặc rỗng")
            if source == target:
                output = sentence.strip()
            else:
                prompt = (
                    "Translate the following text from " + LANGUAGES[source] +
                    " into " + LANGUAGES[target] + ". " +
                    "Only output the translated result without any additional explanation:\n\n" +
                    sentence.strip()
                )
                if getattr(tokenizer,"has_chat_template",False):
                    prompt = tokenizer.apply_chat_template(
                        [{"role":"user","content":prompt}],
                        tokenize=False,add_generation_prompt=True,
                    )
                output = generate(model, tokenizer, prompt, max_tokens=160, verbose=False)
                output = output.strip()
                if not output:
                    raise RuntimeError("Hy-MT2 không trả về bản dịch")
            print(json.dumps({"id":ident,"ok":True,"text":output},ensure_ascii=False),flush=True)
        except Exception as exc:
            print(json.dumps({"id":ident if "ident" in locals() else None,
                              "ok":False,"error":str(exc)[:280]},ensure_ascii=False),flush=True)

def main():
    if len(sys.argv)!=4 or sys.argv[1] not in ("install","worker","probe"):
        raise ValueError("Usage: hymt-bridge.py install|worker|probe model-id model-dir")
    command,key,base=sys.argv[1:]
    weights=paths(key,base)
    if command == "install":
        install(key,weights)
    elif command=="probe":
        print(json.dumps({"ok":installed(weights),"model":key}),flush=True)
    else:
        worker(key,weights)

if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("Hy-MT2: "+str(exc).replace("\n"," ")[:340],file=sys.stderr)
        raise SystemExit(1)
