import os
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jinja2 import Template

from model_client import generate_completion
from parsers import parse_model_json

app = FastAPI(title="Life-Admin Copilot ML Microservice", version="1.0.0")

# Load prompt templates
PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")

def load_template(filename: str) -> Template:
    filepath = os.path.join(PROMPTS_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return Template(f.read())

reminder_tmpl = load_template("reminder.txt")
expense_tmpl = load_template("expense.txt")
notice_tmpl = load_template("notice.txt")
draft_tmpl = load_template("draft.txt")
route_tmpl = load_template("route.txt")

# Pydantic Input Schemas
class ExtractRequest(BaseModel):
    raw_text: str

class DraftRequest(BaseModel):
    template_type: str
    fields: Dict[str, Any]

class RouteRequest(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "life-admin-copilot-ml-service", "version": "1.0.0"}

@app.post("/extract/reminder")
def extract_reminder(req: ExtractRequest):
    prompt = reminder_tmpl.render(raw_text=req.raw_text)
    try:
        raw_resp = generate_completion(prompt, temperature=0.1)
        parsed = parse_model_json(raw_resp)
        return parsed
    except Exception as e:
        # Retry once with strict instruction
        try:
            retry_prompt = prompt + "\n\nCRITICAL RETRY: Return ONLY raw valid JSON object without any formatting."
            raw_resp = generate_completion(retry_prompt, temperature=0.0)
            return parse_model_json(raw_resp)
        except Exception:
            raise HTTPException(status_code=422, detail="could not extract structured data")

@app.post("/extract/expenses")
def extract_expenses(req: ExtractRequest):
    prompt = expense_tmpl.render(raw_text=req.raw_text)
    try:
        raw_resp = generate_completion(prompt, temperature=0.1)
        parsed = parse_model_json(raw_resp)
        return parsed if isinstance(parsed, list) else [parsed]
    except Exception:
        raise HTTPException(status_code=422, detail="could not extract structured data")

@app.post("/summarize/notice")
def summarize_notice(req: ExtractRequest):
    prompt = notice_tmpl.render(raw_text=req.raw_text)
    try:
        raw_resp = generate_completion(prompt, temperature=0.2)
        return parse_model_json(raw_resp)
    except Exception:
        raise HTTPException(status_code=422, detail="could not extract structured data")

@app.post("/generate/draft")
def generate_draft(req: DraftRequest):
    prompt = draft_tmpl.render(template_type=req.template_type, fields=req.fields)
    try:
        raw_resp = generate_completion(prompt, temperature=0.5)
        return parse_model_json(raw_resp)
    except Exception:
        # Fallback raw content wrap
        return {"content": f"Dear Concerned Authority,\n\nRegarding: {req.template_type}.\nDetails: {req.fields}\n\nSincerely,\nUser"}

@app.post("/route/intent")
def route_intent(req: RouteRequest):
    prompt = route_tmpl.render(text=req.text)
    try:
        raw_resp = generate_completion(prompt, temperature=0.1)
        parsed = parse_model_json(raw_resp)
        module = parsed.get("module", "reminder").lower()
        if module not in ["reminder", "expense", "notice", "draft"]:
            module = "reminder"
        return {"module": module, "explanation": parsed.get("explanation", "Routed based on intent.")}
    except Exception:
        # Heuristic fallback
        lower = req.text.lower()
        if any(w in lower for w in ["paid", "spent", "grocery", "receipt", "expense"]):
            module = "expense"
        elif any(w in lower for w in ["draft", "letter", "complaint", "email", "leave"]):
            module = "draft"
        elif any(w in lower for w in ["circular", "notice", "advisory", "policy"]):
            module = "notice"
        else:
            module = "reminder"
        return {"module": module, "explanation": "Heuristic fallback routing."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
