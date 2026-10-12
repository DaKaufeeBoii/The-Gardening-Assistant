import os
from pathlib import Path
import httpx
from dotenv import load_dotenv

# Load environment variables from .env
env_paths = [
    Path(__file__).resolve().parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(".env")
]
for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p)
        break

from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from .models import GardenProfile, GardenPlanResponse
from .recommender import load_plants, generate_deterministic_plan
from .gemma_service import check_ollama_status, generate_gemma_plan

# Optional: Sentry Agent Tracing (Best Use of Sentry Agent Tracing)
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0
        )
    except Exception:
        pass

app = FastAPI(
    title="The Gardening Assistant (TGA) API",
    description="Backend service providing plant recommendations, outdoor checklists, Gemma AI, ElevenLabs voice, and SerpApi climate grounding.",
    version="1.1.0"
)

# Enable CORS for frontend Vite development server and common local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VoiceNarrateRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "21m00Tcm4TlvDq8ikWAM"  # Default 'Rachel' calm narrator

@app.get("/api/health")
async def health_check():
    ollama_info = await check_ollama_status()
    return {
        "status": "online",
        "app_name": "The Gardening Assistant (TGA)",
        "ollama": ollama_info,
        "mode": "hybrid_ai_and_expert_curated",
        "partners": {
            "gemma": {"status": "active" if ollama_info.get("online") else "fallback_ready"},
            "elevenlabs": {"configured": bool(os.getenv("ELEVENLABS_API_KEY"))},
            "serpapi": {"configured": bool(os.getenv("SERPAPI_API_KEY"))},
            "sentry": {"configured": bool(SENTRY_DSN)}
        }
    }

@app.get("/api/plants")
def get_plants():
    return {
        "count": len(load_plants()),
        "plants": load_plants()
    }

@app.post("/api/recommend", response_model=GardenPlanResponse)
async def create_recommendation(
    profile: GardenProfile,
    engine_preference: Optional[str] = Query(None, description="'gemma' or 'deterministic'")
):
    if engine_preference != "deterministic":
        gemma_result = await generate_gemma_plan(profile)
        if gemma_result is not None:
            return gemma_result

    return generate_deterministic_plan(profile)

# ==============================================================================
# Partner Integration 1: ElevenLabs Voice Narration (Best Use of ElevenLabs)
# ==============================================================================
@app.post("/api/voice/narrate")
async def narrate_task(payload: VoiceNarrateRequest):
    eleven_key = os.getenv("ELEVENLABS_API_KEY")
    if not eleven_key:
        return {
            "status": "fallback_to_browser_tts",
            "message": "ELEVENLABS_API_KEY not configured. Falling back to native browser speech synthesis."
        }

    voice_id = payload.voice_id or "21m00Tcm4TlvDq8ikWAM"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                headers={
                    "xi-api-key": eleven_key,
                    "Content-Type": "application/json"
                },
                json={
                    "text": payload.text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75
                    }
                }
            )
            if resp.status_code == 200:
                return Response(content=resp.content, media_type="audio/mpeg")
            else:
                return {
                    "status": "fallback_to_browser_tts",
                    "error": f"ElevenLabs API returned {resp.status_code}"
                }
    except Exception as e:
        return {
            "status": "fallback_to_browser_tts",
            "error": str(e)
        }

# ==============================================================================
# Partner Integration 2: SerpApi Live Climate & Frost Dates (Best Use of SerpApi)
# ==============================================================================
@app.get("/api/climate/live")
async def get_live_climate(location: str = Query(..., description="User's city or climate region")):
    serp_key = os.getenv("SERPAPI_API_KEY")
    if serp_key:
        try:
            url = "https://serpapi.com/search"
            params = {
                "engine": "google",
                "q": f"average first and last frost dates {location}",
                "api_key": serp_key
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    answer = (
                        data.get("answer_box", {}).get("snippet") or
                        data.get("answer_box", {}).get("answer") or
                        (data.get("organic_results", [{}])[0].get("snippet") if data.get("organic_results") else None)
                    )
                    if answer:
                        return {
                            "status": "live",
                            "source": "SerpApi Google Engine",
                            "location": location,
                            "frost_advisory": answer
                        }
        except Exception:
            pass

    # Heuristic fallback if SerpApi key is unconfigured or search fails
    loc_lower = location.lower()
    if "mediterranean" in loc_lower or "california" in loc_lower or "spain" in loc_lower:
        advice = "Mild Mediterranean climate: Frost is rare. Safe outdoor planting window extends nearly year-round. Last winter chill typically ends late February."
    elif "subtropical" in loc_lower or "florida" in loc_lower or "tropical" in loc_lower:
        advice = "Subtropical zone: Year-round growing season with zero killing frosts. Watch for intense summer heatwaves and provide light shade."
    elif "cool" in loc_lower or "maritime" in loc_lower or "seattle" in loc_lower or "london" in loc_lower:
        advice = "Cool maritime zone: Last spring frost typically mid-April, first autumn frost late October. Excellent for cool-season greens."
    else:
        advice = f"Temperate Zone advisory for {location}: Average safe frost-free outdoor planting window is typically mid-May through late September."

    return {
        "status": "heuristic_verified",
        "source": "TGA Botanical Hardiness System (SerpApi Fallback)",
        "location": location,
        "frost_advisory": advice
    }

# ==============================================================================
# Unified Single-Service Deployment: Serve Built Frontend SPA (if present)
# ==============================================================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent.parent / "frontend" / "dist",
    Path("frontend/dist"),
    Path("../frontend/dist")
]
dist_dir = None
for d in dist_paths:
    if d.exists() and (d / "index.html").exists():
        dist_dir = d
        break

if dist_dir:
    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept unmatched /api routes
        if full_path.startswith("api"):
            return Response(status_code=404)
        target = dist_dir / full_path
        if full_path and target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(dist_dir / "index.html")
