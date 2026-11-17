#!/usr/bin/env python3
"""Opt-in Vietnamese voice engines. No synthesized text is sent to a cloud API.
VietVoice uses a pinned MIT source checkout; F5 checkpoints are CC-BY-NC
and require user-authorized reference speech. Paths are managed by Electron.
"""
import json, os, sys
from pathlib import Path

F5_REPO = "toandev/F5-TTS-Vietnamese"
def validate_dest(path):
    p = Path(path)
    if not p.is_absolute() or p.suffix.lower() != ".wav":
        raise ValueError("Expected absolute WAV output")
    p.parent.mkdir(parents=True,exist_ok=True)
    return p

def vietvoice(text, output, cache, area, gender, group, ref_audio='', ref_text=''):
    if area not in ("northern","central","southern") or gender not in ("male","female"):
        raise ValueError("VietVoice region/gender not allowed")
    if group not in ("news","story","audiobook"):
        raise ValueError("VietVoice reading style not allowed")
    if ref_audio:
        reference=Path(ref_audio)
        if not reference.is_file() or reference.suffix.lower() not in (".wav",".mp3",".m4a",".flac"):
            raise ValueError("Only authorized local audio references are permitted")
        if len(ref_text.strip()) < 5:
            raise ValueError("A matching spoken reference transcript is required")
    from vietvoicetts import TTSApi, ModelConfig
    engine = TTSApi(ModelConfig(model_cache_dir=cache))
    try:
        engine.synthesize_to_file(text, output_path=str(validate_dest(output)),
                                  gender=gender, area=area, group=group, emotion="neutral",
                                  reference_audio=ref_audio or None,
                                  reference_text=ref_text or None)
    finally:
        engine.cleanup()

def f5_install(where):
    from huggingface_hub import snapshot_download
    root=Path(where)
    root.mkdir(parents=True,exist_ok=True)
    # Only safetensors and vocab, never untrusted .pt pickle checkpoints.
    snapshot_download(repo_id=F5_REPO,local_dir=str(root),
                      allow_patterns=["model_latest.safetensors","vocab.txt"],
                      max_workers=2)
    if not (root/"model_latest.safetensors").is_file() or (root/"model_latest.safetensors").stat().st_size < 1_000_000_000:
        raise RuntimeError("F5 Vietnamese model weights incomplete")
    if not (root/"vocab.txt").is_file():
        raise RuntimeError("F5 Vietnamese vocabulary missing")

def f5_speak(text,output,model_dir,ref_audio,ref_text):
    root=Path(model_dir)
    checkpoint=root/"model_latest.safetensors"
    vocab=root/"vocab.txt"
    if not checkpoint.is_file() or not vocab.is_file():
        raise ValueError("F5 model not installed")
    ref=Path(ref_audio)
    if not ref.is_file() or ref.suffix.lower() not in (".wav",".mp3",".m4a",".flac"):
        raise ValueError("Select reference voice audio you have permission to use")
    if len(ref_text.strip())<5:
        raise ValueError("A matching reference transcript is required")
    # F5 official Python API, with checkpoint/vocabulary passed explicitly.
    from f5_tts.api import F5TTS
    import soundfile as sf
    engine=F5TTS(model="F5TTS_Base",ckpt_file=str(checkpoint),vocab_file=str(vocab))
    wave,rate,_=engine.infer(ref_file=str(ref),ref_text=ref_text,
                             gen_text=text,speed=1.0,show_info=lambda _: None)
    sf.write(str(validate_dest(output)),wave,rate)

def main():
    if len(sys.argv)<2: raise ValueError("Missing command")
    command=sys.argv[1]
    if command=="vietvoice":
        if len(sys.argv) not in (8,10): raise ValueError("VietVoice expects text, wav, cache, area, gender, group, optional ref audio/text")
        _,_,text,output,cache,area,gender,group,*ref=sys.argv
        vietvoice(text,output,cache,area,gender,group,*ref)
    elif command=="f5-install":
        if len(sys.argv)!=3: raise ValueError("F5 install expects model dir")
        f5_install(sys.argv[2])
    elif command=="f5":
        if len(sys.argv)!=7: raise ValueError("F5 expects text, wav, model dir, reference audio and transcript")
        _,_,text,output,model_dir,ref_audio,ref_text=sys.argv
        f5_speak(text,output,model_dir,ref_audio,ref_text)
    else: raise ValueError("Unknown Vietnamese TTS command")
    print(json.dumps({"ok":True}),flush=True)

if __name__=="__main__":
    try:main()
    except Exception as e:
        print("Vietnamese TTS: "+str(e).replace("\n"," ")[:300],file=sys.stderr)
        sys.exit(1)
