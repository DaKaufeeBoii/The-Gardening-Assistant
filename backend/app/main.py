from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .models import GardenProfile, GardenPlanResponse
from .recommender import load_plants, generate_deterministic_plan
from .gemma_service import check_ollama_status, generate_gemma_plan

app = FastAPI(
    title="The Gardening Assistant (TGA) API",
    description="Backend service providing plant recommendations, outdoor checklists, and Gemma integration for Hacktoberfest Touch Grass challenge.",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server and common local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    ollama_info = await check_ollama_status()
    return {
        "status": "online",
        "app_name": "The Gardening Assistant (TGA)",
        "ollama": ollama_info,
        "mode": "hybrid_ai_and_expert_curated"
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
    # If the user or demo requests Gemma explicitly or automatically
    if engine_preference != "deterministic":
        gemma_result = await generate_gemma_plan(profile)
        if gemma_result is not None:
            return gemma_result

    # Default / reliable fallback to deterministic expert recommendation grounded in plant database
    return generate_deterministic_plan(profile)
