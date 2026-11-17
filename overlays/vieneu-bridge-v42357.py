#!/usr/bin/env python3
"""Persistent local VieNeu voice backend: loads the model once, newest request wins.
Existing warm and speak CLI modes remain compatible with v4.23.56.
No cloud speech synthesis; output is an app-managed temporary WAV.
"""
import json
import os
import sys
import wave
from pathlib import Path

def engine_ready():
    from vieneu import Vieneu
    engine = Vieneu(mode="v3turbo", backend="onnx", precision="fp32")
    voices = {str(voice_id) for _, voice_id in engine.list_preset_voices()}
    return engine, voices

def validate(voice, out, sentence):
    if not isinstance(voice, str) or len(voice) > 60 or not voice:
        raise ValueError("Giọng VieNeu không hợp lệ")
    if not isinstance(out, str):
        raise ValueError("Thiếu file âm thanh đầu ra")
    dest=Path(out)
    if not dest.is_absolute() or dest.suffix.lower() != ".wav":
        raise ValueError("Đường dẫn WAV không hợp lệ")
    if not isinstance(sentence, str) or not 0 < len(sentence.strip()) <= 360:
        raise ValueError("Câu đọc phải có từ 1 đến 360 ký tự")
    return dest

def speak(engine, voices, voice, out, sentence):
    target=validate(voice,out,sentence)
    if voice not in voices:
        raise RuntimeError("Giọng VieNeu không tồn tại: " + voice)
    audio=engine.infer(sentence.strip(),voice=voice)
    target.parent.mkdir(parents=True,exist_ok=True)
    engine.save(audio,str(target))
    with wave.open(str(target),"rb") as wav:
        if wav.getnframes()<=10 or wav.getnchannels()<1:
            raise RuntimeError("VieNeu chưa tạo được WAV hợp lệ")

def serve():
    engine, voices=engine_ready()
    print(json.dumps({"type":"ready"}),flush=True)
    # A single worker avoids reloading 1GB+ model on every subtitle.
    # Requests arriving during inference are compacted to most recent before next synth.
    import select
    for line in sys.stdin:
        if not line.strip():
            continue
        request=json.loads(line)
        try:
            while select.select([sys.stdin],[],[],0)[0]:
                newer=sys.stdin.readline()
                if not newer:
                    return
                try:
                    candidate=json.loads(newer)
                    if isinstance(candidate,dict) and candidate.get("id") is not None:
                        print(json.dumps({"id":request.get("id"),"ok":False,
                                          "skipped":True,"error":"Phụ đề cũ đã bị thay thế"}),flush=True)
                        request=candidate
                except (ValueError,TypeError):
                    continue
            ident=request.get("id")
            speak(engine,voices,request.get("voice"),request.get("output"),request.get("text"))
            print(json.dumps({"id":ident,"ok":True}),flush=True)
        except Exception as exc:
            print(json.dumps({"id":request.get("id"),"ok":False,"error":str(exc)[:280]},
                             ensure_ascii=False),flush=True)

def main():
    if len(sys.argv)==2 and sys.argv[1]=="serve":
        serve()
        return
    if len(sys.argv)!=4 or sys.argv[1] not in ("warm","speak"):
        raise ValueError("Usage: vieneu-bridge.py serve OR warm|speak voice output.wav")
    mode,voice,output=sys.argv[1:]
    engine,voices=engine_ready()
    if mode=="warm":
        phrase="Xin chào, mô hình giọng nói tiếng Việt đã sẵn sàng."
    else:
        phrase=sys.stdin.read(800).strip()
    speak(engine,voices,voice,output,phrase)
    print(json.dumps({"ready":True,"voice":voice,"sample_rate":48000},ensure_ascii=False),flush=True)

if __name__=="__main__":
    try:main()
    except Exception as exc:
        print("VieNeu: "+str(exc).replace("\n"," ")[:420],file=sys.stderr)
        raise SystemExit(1)
