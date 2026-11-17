#!/usr/bin/env python3
"""v4.23.56: offline bridge catalog and partial-download validation (no network or MLX required)."""
import importlib.util
import json
from pathlib import Path
import tempfile

entry = Path(__file__).resolve().parents[1] / "src" / "hymt-bridge.py"
spec = importlib.util.spec_from_file_location("mlx_bridge", str(entry))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

expected = {
    "hymt18": "mlx-community/Hy-MT2-1.8B-4bit",
    "hymt7": "mlx-community/Hy-MT2-7B-4bit",
    "hymt18q8": "mlx-community/Hy-MT2-1.8B-8bit",
    "hymt7q8": "mlx-community/Hy-MT2-7B-8bit",
    "qwen06": "mlx-community/Qwen3-0.6B-4bit",
    "qwen17": "mlx-community/Qwen3-1.7B-4bit",
    "qwen4": "mlx-community/Qwen3-4B-4bit",
    "qwen8": "mlx-community/Qwen3-8B-4bit",
}
assert module.MODELS == expected, "Unexpected or missing Hugging Face model URLs"
with tempfile.TemporaryDirectory() as base:
    data = Path(base) / "ai-translate" / "models" / "hymt7q8"
    weights = module.paths("hymt7q8", str(data))
    weights.mkdir(parents=True)
    (weights / "config.json").write_text('{"model_type": "test"}', encoding="utf-8")
    (weights / "tokenizer.json").write_text("a" * 150000, encoding="utf-8")
    assert not module.installed(weights)
    index = {"weight_map": {"a": "model-00001-of-00002.safetensors",
                            "b": "model-00002-of-00002.safetensors"}}
    (weights / "model.safetensors.index.json").write_text(json.dumps(index))
    (weights / "model-00001-of-00002.safetensors").write_bytes(b"x" * 1600000)
    assert not module.installed(weights), "Never treat partially downloaded 8GB model as complete"
    (weights / "model-00002-of-00002.safetensors").write_bytes(b"x" * 1600000)
    assert module.installed(weights)
    (weights / "model-00002-of-00002.safetensors").unlink()
    assert not module.installed(weights)
    try:
        module.paths("qwen4", str(Path(base) / "external" / "qwen4"))
    except ValueError:
        pass
    else:
        raise AssertionError("Model downloads must remain in owned storage")
print("PASS: 8 MLX model allowlist, sharded downloads and safe private paths")
