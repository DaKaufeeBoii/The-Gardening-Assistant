import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import httpx
from .models import GardenProfile, GardenPlanResponse, PlantRecommendation, WeeklyTaskItem
from .recommender import load_plants, score_plant, generate_deterministic_plan

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODELS = ["gemma2:9b", "gemma:2b", "gemma2", "gemma"]

async def check_ollama_status() -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                gemma_models = [m for m in models if "gemma" in m.lower()]
                return {
                    "online": True,
                    "models": models,
                    "gemma_models": gemma_models,
                    "recommended_model": gemma_models[0] if gemma_models else (models[0] if models else "gemma2:9b")
                }
    except Exception as e:
        logger.debug(f"Ollama check failed: {e}")
    return {
        "online": False,
        "models": [],
        "gemma_models": [],
        "recommended_model": None
    }

async def generate_gemma_plan(profile: GardenProfile) -> Optional[GardenPlanResponse]:
    status = await check_ollama_status()
    if not status["online"]:
        logger.info("Ollama is not running. Using deterministic expert fallback.")
        return None

    model_to_use = status["recommended_model"] or "gemma2:9b"
    all_plants = load_plants()
    plant_lookup = {p["id"]: p for p in all_plants}

    # Pre-select top candidate plants based on deterministic scoring
    scored = [(score_plant(p, profile), p) for p in all_plants]
    scored.sort(key=lambda x: x[0], reverse=True)
    top_candidates = [p for _, p in scored[:5]]

    # Ultra-lean prompt for fast CPU token evaluation
    candidate_summary = "\n".join([
        f"- ID: '{p['id']}' | Name: {p['name']} | Category: {p['category']} | Sun: {p['sunlight']} | Space: {p['space']}"
        for p in top_candidates
    ])

    prompt = f"""You are The Gardening Assistant (TGA), an AI agronomist advocating for the "Touch Grass" outdoor lifestyle.
Recommend exactly 3 plants from the candidates and assign outdoor weekly tasks.

GARDEN PROFILE:
- Location: {profile.location_or_climate}
- Type: {profile.garden_type}
- Sunlight: {profile.sunlight}
- Experience: {profile.experience}
- Space: {profile.space}

CANDIDATES:
{candidate_summary}

Respond ONLY with a valid JSON object matching:
{{
  "selected_ids": ["id_1", "id_2", "id_3"],
  "summary": "2 sentences inspiring the gardener to spend time outdoors with these plants",
  "why_recommended": {{
    "id_1": "Personalized reason matching their garden conditions",
    "id_2": "Personalized reason matching their garden conditions",
    "id_3": "Personalized reason matching their garden conditions"
  }},
  "weekly_tasks": [
    {{"week": 1, "title": "Soil prep & sowing", "touch_grass_action": "Specific outdoor sensory activity", "plant_id": "id_1"}},
    {{"week": 2, "title": "Hydration & sprout check", "touch_grass_action": "Specific outdoor sensory activity", "plant_id": "id_2"}},
    {{"week": 3, "title": "Pruning & sun rotation", "touch_grass_action": "Specific outdoor sensory activity", "plant_id": "id_3"}},
    {{"week": 4, "title": "Harvest & mindful rest", "touch_grass_action": "Specific outdoor sensory activity", "plant_id": "id_1"}}
  ]
}}"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": model_to_use,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {
                        "temperature": 0.2,
                        "num_predict": 400
                    }
                }
            )
            if resp.status_code == 200:
                raw_json = resp.json().get("response", "")
                parsed = json.loads(raw_json)
                
                selected_ids = parsed.get("selected_ids", [])
                valid_selected = [plant_lookup[pid] for pid in selected_ids if pid in plant_lookup]
                
                # If model selected fewer than 3 valid IDs, backfill from top candidates
                for cand in top_candidates:
                    if len(valid_selected) >= 3:
                        break
                    if cand not in valid_selected:
                        valid_selected.append(cand)
                
                valid_selected = valid_selected[:3]
                why_map = parsed.get("why_recommended", {})

                recommendations: List[PlantRecommendation] = []
                for p in valid_selected:
                    personalized_why = why_map.get(
                        p["id"],
                        f"Matched for {profile.garden_type} with {profile.sunlight} sun and {profile.experience} level."
                    )
                    recommendations.append(
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
                            why_recommended=personalized_why,
                            companion_plants=p.get("companion_plants", []),
                            weekly_tasks=p.get("weekly_tasks", [])
                        )
                    )

                checklist: List[WeeklyTaskItem] = []
                for idx, t in enumerate(parsed.get("weekly_tasks", [])):
                    pid = t.get("plant_id")
                    plant_name = plant_lookup.get(pid, {}).get("name") if pid else None
                    checklist.append(
                        WeeklyTaskItem(
                            id=f"gemma_task_w{t.get('week', idx+1)}_{idx}",
                            week_number=t.get("week", (idx // 2) + 1),
                            title=t.get("title", f"Week {idx+1} Outdoor Activity"),
                            description=f"Care for your {plant_name or 'garden'} outdoors with regular observation.",
                            associated_plant=plant_name,
                            estimated_minutes=15 + (idx % 2) * 5,
                            touch_grass_action=t.get("touch_grass_action", "Step outside, observe new growth, and breathe the fresh air.")
                        )
                    )

                if len(checklist) < 4:
                    # Provide default 4-week tasks if model gave empty checklist
                    checklist = [
                        WeeklyTaskItem(
                            id=f"gemma_task_w{i+1}",
                            week_number=i+1,
                            title=["Soil Prep & Planting", "Root Hydration Check", "Outdoor Maintenance", "Harvest & Nature Time"][i],
                            description=f"Spend time outside tending to {valid_selected[i % len(valid_selected)]['name']}.",
                            associated_plant=valid_selected[i % len(valid_selected)]['name'],
                            estimated_minutes=15,
                            touch_grass_action=valid_selected[i % len(valid_selected)]['touch_grass_tip']
                        )
                        for i in range(4)
                    ]

                return GardenPlanResponse(
                    profile=profile,
                    summary=parsed.get("summary", "Personalized outdoor gardening plan generated with Gemma."),
                    recommendations=recommendations,
                    weekly_checklist=checklist,
                    engine="gemma",
                    engine_details=f"Local Gemma Model ({model_to_use}) via Ollama with Curated Plant Grounding",
                    disclaimer="Seasonal note: Local weather patterns, frost dates, and microclimates vary. Always verify local planting calendars before sowing outdoors.",
                    generated_at=datetime.utcnow().isoformat() + "Z"
                )
    except Exception as e:
        logger.warning(f"Error invoking Gemma via Ollama: {repr(e)}. Gracefully falling back to expert rule engine.")

    return None
