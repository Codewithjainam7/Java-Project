# Life-Admin Copilot — Python ML Microservice

Standalone FastAPI microservice powered by **Ollama** (`llama3.2:3b` or `phi3:mini`) running open-source local inference on-device without cloud API dependencies.

## Architecture

```
Spring Boot / Node Backend  ──> FastAPI (Port 8000) ──> Ollama Local Runtime (Port 11434)
```

## Quick Start Instructions

1. **Install Ollama**:
   Download and install from [ollama.com](https://ollama.com).

2. **Pull the Open Source Model**:
   ```bash
   ollama pull llama3.2:3b
   ```

3. **Install Dependencies & Run Microservice**:
   ```bash
   cd life-admin-copilot-ml-service
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

4. **Verify Health Endpoint**:
   ```bash
   curl http://localhost:8000/health
   ```
