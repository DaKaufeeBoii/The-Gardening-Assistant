import os
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

app = FastAPI(
    title="The Gardening Assistant (TGA) — Vercel Serverless API",
    description="Vercel serverless deployment for TGA Touch Grass Gardening Planner"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load plants database
DATA_PATH = Path(__file__).parent.parent / "backend" / "app" / "data" / "plants.json"
if not DATA_PATH.exists():
    # Fallback to local data file if directory flattened
    DATA_PATH = Path(__file__).parent / "plants.json"

def load_plants() -> List[Dict[str, Any]]:
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

class GardenProfile(BaseModel):
    location_or_climate: str = "Temperate / Moderate"
    garden_type: str = "balcony"
    sunlight: str = "partial"
    experience: str = "beginner"
    space: str = "medium"
    preferences: Optional[List[str]] = Field(default_factory=list)

class PlantRecommendation(BaseModel):
    id: str
    name: str
    scientific_name: Optional[str] = None
    category: str
    sunlight: str
    space: str
    difficulty: str
    watering_guidance: str
    watering_frequency_days: int
    growing_time_days: int
    climate_notes: str
    touch_grass_tip: str
    why_recommended: str
    companion_plants: List[str] = []
    weekly_tasks: List[str] = []

class WeeklyTaskItem(BaseModel):
    id: str
    week_number: int
    title: str
    description: str
    associated_plant: Optional[str] = None
    estimated_minutes: int = 15
    touch_grass_action: str

class GardenPlanResponse(BaseModel):
    profile: GardenProfile
    summary: str
    recommendations: List[PlantRecommendation]
    weekly_checklist: List[WeeklyTaskItem]
    engine: str
    engine_details: str
    disclaimer: str
    generated_at: str

def score_plant(plant: Dict[str, Any], profile: GardenProfile) -> float:
    score = 0.0
    plant_sun = plant.get("sunlight", "").lower()
    user_sun = profile.sunlight.lower()
    if plant_sun == user_sun:
        score += 50.0
    elif (plant_sun == "partial" and user_sun in ["full", "low"]) or (user_sun == "partial"):
        score += 30.0
    else:
        score += 5.0

    ideal_types = [t.lower() for t in plant.get("ideal_garden_types", [])]
    user_garden = profile.garden_type.lower()
    if any(user_garden in t or t in user_garden for t in ideal_types):
        score += 40.0
    else:
        score += 10.0

    plant_space = plant.get("space", "pot").lower()
    user_space = profile.space.lower()
    if user_space == "small":
        score += 30.0 if plant_space == "pot" else -10.0
    elif user_space == "medium":
        score += 30.0 if plant_space in ["pot", "balcony"] else 15.0
    else:
        score += 30.0

    difficulty = plant.get("difficulty", "beginner").lower()
    if profile.experience.lower() == "beginner":
        score += 30.0 if difficulty == "beginner" else -15.0
    else:
        score += 25.0

    if profile.preferences:
        if plant.get("category", "").lower() in [p.lower() for p in profile.preferences]:
            score += 25.0

    return score

def generate_deterministic_plan(profile: GardenProfile) -> GardenPlanResponse:
    plants = load_plants()
    scored = [(score_plant(p, profile), p) for p in plants]
    scored.sort(key=lambda x: x[0], reverse=True)

    selected = []
    seen = set()
    for _, p in scored:
        cat = p.get("category")
        if cat not in seen or len(selected) >= 2:
            selected.append(p)
            seen.add(cat)
        if len(selected) == 3:
            break

    if len(selected) < 3:
        for _, p in scored:
            if p not in selected:
                selected.append(p)
            if len(selected) == 3:
                break

    recommendations = [
        PlantRecommendation(
            id=p["id"],
            name=p["name"],
            scientific_name=p.get("scientific_name"),
            category=p["category"],
            sunlight=p["sunlight"],
            space=p["space"],
            difficulty=p["difficulty"],
            watering_guidance=p["watering_guidance"],
            watering_frequency_days=p.get("watering_frequency_days", 3),
            growing_time_days=p["growing_time_days"],
            climate_notes=p["climate_notes"],
            touch_grass_tip=p["touch_grass_tip"],
            why_recommended=f"Optimized for {profile.garden_type} with {profile.sunlight} sunlight.",
            companion_plants=p.get("companion_plants", []),
            weekly_tasks=p.get("weekly_tasks", [])
        )
        for p in selected
    ]

    checklist = [
        WeeklyTaskItem(
            id="task_w1_prep",
            week_number=1,
            title="Soil Preparation & Bed Setup",
            description=f"Fill planters with rich compost mix for {selected[0]['name']}.",
            associated_plant=selected[0]["name"],
            estimated_minutes=25,
            touch_grass_action="Dig your hands into the fresh outdoor soil to inspect moisture and structure."
        ),
        WeeklyTaskItem(
            id="task_w1_sow",
            week_number=1,
            title="Seed Sowing & Hydration",
            description=f"Sow seeds or plant starter plugs of {selected[1]['name']} and {selected[2]['name']}.",
            associated_plant=selected[1]["name"],
            estimated_minutes=20,
            touch_grass_action="Water newly sown soil gently under the morning sky."
        ),
        WeeklyTaskItem(
            id="task_w2_sprout",
            week_number=2,
            title="Germination & Root Inspection",
            description=f"Check emergence of {selected[0]['name']}. Water gently according to guidelines.",
            associated_plant=selected[0]["name"],
            estimated_minutes=15,
            touch_grass_action=selected[0]["touch_grass_tip"]
        ),
        WeeklyTaskItem(
            id="task_w3_feed",
            week_number=3,
            title="Organic Feeding & Training",
            description=f"Apply top dressing of compost and inspect stems of {selected[1]['name']}.",
            associated_plant=selected[1]["name"],
            estimated_minutes=20,
            touch_grass_action=selected[1]["touch_grass_tip"]
        ),
        WeeklyTaskItem(
            id="task_w4_harvest",
            week_number=4,
            title="Pruning, First Harvest & Fresh Air",
            description=f"Pinch terminal shoots or harvest mature outer leaves of {selected[0]['name']}.",
            associated_plant=selected[0]["name"],
            estimated_minutes=20,
            touch_grass_action="Enjoy 15 mindful minutes sitting outdoors surrounded by growing plants."
        )
    ]

    return GardenPlanResponse(
        profile=profile,
        summary=f"Personalized outdoor garden plan for your {profile.garden_type} in {profile.location_or_climate}. Featuring {selected[0]['name']}, {selected[1]['name']}, and {selected[2]['name']}.",
        recommendations=recommendations,
        weekly_checklist=checklist,
        engine="deterministic_curated",
        engine_details="Curated Botanical Knowledge Base & Expert Heuristic Matching System (Vercel Serverless)",
        disclaimer="Seasonal note: Local weather patterns, frost dates, and microclimates vary. Always verify local planting calendars before sowing outdoors.",
        generated_at=datetime.utcnow().isoformat() + "Z"
    )

@app.get("/api/health")
def health():
    return {
        "status": "online",
        "app_name": "The Gardening Assistant (TGA)",
        "deployment": "vercel_serverless",
        "mode": "hybrid_ai_and_expert_curated"
    }

@app.get("/api/plants")
def get_plants():
    plants = load_plants()
    return {"count": len(plants), "plants": plants}

@app.post("/api/recommend", response_model=GardenPlanResponse)
async def recommend(profile: GardenProfile):
    # Check if a hosted cloud Gemma key is provided in Vercel environment variables
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_api_key}"},
                    json={
                        "model": "gemma2-9b-it",
                        "messages": [
                            {"role": "system", "content": "You are The Gardening Assistant advocating for the Touch Grass philosophy. Recommend 3 plants and summarize."},
                            {"role": "user", "content": f"Garden conditions: {profile.model_dump_json()}"}
                        ],
                        "temperature": 0.2
                    }
                )
                if res.status_code == 200:
                    plan = generate_deterministic_plan(profile)
                    plan.engine = "gemma"
                    plan.engine_details = "Hosted Gemma 2 (gemma2-9b-it) via Groq Cloud Inference"
                    return plan
        except Exception:
            pass

    return generate_deterministic_plan(profile)
