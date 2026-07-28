import requests
import json
import os
from typing import Dict, Any

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

def generate_completion(prompt: str, temperature: float = 0.2) -> str:
    """Calls local Ollama API to generate model response."""
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")
    except requests.exceptions.RequestException as err:
        print(f"[Ollama Error] Could not connect to local Ollama at {OLLAMA_BASE_URL}: {err}")
        raise RuntimeError(f"Ollama local model request failed: {str(err)}") from err
