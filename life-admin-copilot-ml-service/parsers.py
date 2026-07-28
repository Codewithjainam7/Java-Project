import json
import re
from typing import Any, Dict, Union, List

def clean_json_string(raw_text: str) -> str:
    """Strips markdown code block fences and trailing text to extract valid JSON string."""
    if not raw_text:
        return ""
    
    # Strip ```json and ``` code block wrappers
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
    cleaned = re.sub(r'```\s*$', '', cleaned).strip()
    
    # Find start of JSON object or array
    match = re.search(r'(\[|\{).*(\]|\})', cleaned, re.DOTALL)
    if match:
        return match.group(0)
    
    return cleaned

def parse_model_json(raw_text: str) -> Union[Dict[str, Any], List[Any]]:
    """Parses model text response into python dict or list with fallback cleanup."""
    cleaned = clean_json_string(raw_text)
    try:
        return json.loads(cleaned)
    except Exception as e:
        # Attempt secondary regex object matching
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
        raise ValueError(f"Could not parse structured JSON from response: {raw_text}") from e
