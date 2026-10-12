import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from .models import GardenProfile, PlantRecommendation, WeeklyTaskItem, GardenPlanResponse

DATA_PATH = Path(__file__).parent / "data" / "plants.json"

def load_plants() -> List[Dict[str, Any]]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def score_plant(plant: Dict[str, Any], profile: GardenProfile) -> float:
    score = 0.0

    # 1. Sunlight matching
    plant_sun = plant.get("sunlight", "").lower()
    user_sun = profile.sunlight.lower()
    if plant_sun == user_sun:
        score += 50.0
    elif (plant_sun == "partial" and user_sun in ["full", "low"]) or (user_sun == "partial"):
        score += 30.0
    else:
        score += 5.0

    # 2. Garden type matching
    ideal_types = [t.lower() for t in plant.get("ideal_garden_types", [])]
    user_garden = profile.garden_type.lower()
    if any(user_garden in t or t in user_garden for t in ideal_types):
        score += 40.0
    else:
        score += 10.0

    # 3. Space suitability
    plant_space = plant.get("space", "pot").lower()
    user_space = profile.space.lower()
    if user_space == "small":
        if plant_space == "pot":
            score += 30.0
        elif plant_space == "balcony":
            score += 10.0
        else:
            score -= 20.0
    elif user_space == "medium":
        if plant_space in ["pot", "balcony"]:
            score += 30.0
        else:
            score += 15.0
    else: # large
        score += 30.0

    # 4. Experience level
    difficulty = plant.get("difficulty", "beginner").lower()
    if profile.experience.lower() == "beginner":
        if difficulty == "beginner":
            score += 30.0
        else:
            score -= 15.0
    else:
        score += 25.0

    # 5. Category preferences
    if profile.preferences:
        pref_categories = [p.lower() for p in profile.preferences]
        if plant.get("category", "").lower() in pref_categories:
            score += 25.0

    return score

def generate_deterministic_plan(profile: GardenProfile) -> GardenPlanResponse:
    plants = load_plants()
    scored = [(score_plant(p, profile), p) for p in plants]
    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)

    # Pick top 3 diverse plants
    selected = []
    seen_categories = set()
    for _, p in scored:
        cat = p.get("category")
        if cat not in seen_categories or len(selected) >= 2:
            selected.append(p)
            seen_categories.add(cat)
        if len(selected) == 3:
            break

    if len(selected) < 3:
        for _, p in scored:
            if p not in selected:
                selected.append(p)
            if len(selected) == 3:
                break

    recommendations: List[PlantRecommendation] = []
    for p in selected:
        why = (
            f"Tailored for your {profile.garden_type} with {profile.sunlight} sunlight exposure. "
            f"Matches {profile.experience} gardening level with dependable, resilient growth."
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
                why_recommended=why,
                companion_plants=p.get("companion_plants", []),
                weekly_tasks=p.get("weekly_tasks", [])
            )
        )

    # Generate 4-week outdoor task checklist grounded in the selected plants
    checklist: List[WeeklyTaskItem] = [
        WeeklyTaskItem(
            id="task_w1_prep",
            week_number=1,
            title="Soil Preparation & Setup",
            description=f"Fill containers or beds with nutrient-rich potting soil for {selected[0]['name']}. Ensure proper drainage holes.",
            associated_plant=selected[0]["name"],
            estimated_minutes=25,
            touch_grass_action=f"Get your hands into the fresh earth outside to test soil texture and aeration."
        ),
        WeeklyTaskItem(
            id="task_w1_sow",
            week_number=1,
            title="Seed Sowing & Hydration",
            description=f"Plant seeds or starter plugs of {selected[1]['name']} and {selected[2]['name']} at recommended depths.",
            associated_plant=selected[1]["name"],
            estimated_minutes=20,
            touch_grass_action=f"Soak the topsoil with a gentle watering wand in the morning sunlight."
        ),
        WeeklyTaskItem(
            id="task_w2_sprout",
            week_number=2,
            title="Germination & Root Hydration Check",
            description=f"Inspect emerging shoots of {selected[0]['name']}. Water gently according to guidelines.",
            associated_plant=selected[0]["name"],
            estimated_minutes=15,
            touch_grass_action=selected[0]["touch_grass_tip"]
        ),
        WeeklyTaskItem(
            id="task_w2_thin",
            week_number=2,
            title="Seedling Thinning & Light Adjustment",
            description=f"Thin crowded seedlings of {selected[1]['name']} to allow room for strong central roots.",
            associated_plant=selected[1]["name"],
            estimated_minutes=15,
            touch_grass_action="Step outside without devices and check leaf orientation to natural sunlight."
        ),
        WeeklyTaskItem(
            id="task_w3_feed",
            week_number=3,
            title="Organic Feeding & Mulching",
            description=f"Apply a light top dressing of worm castings or balanced organic liquid feed to {selected[2]['name']}.",
            associated_plant=selected[2]["name"],
            estimated_minutes=20,
            touch_grass_action=selected[2]["touch_grass_tip"]
        ),
        WeeklyTaskItem(
            id="task_w3_support",
            week_number=3,
            title="Pruning & Pest Scouting",
            description=f"Inspect underside of foliage on {selected[0]['name']} and {selected[1]['name']} for friendly pollinators or pests.",
            associated_plant=selected[0]["name"],
            estimated_minutes=15,
            touch_grass_action=selected[1]["touch_grass_tip"]
        ),
        WeeklyTaskItem(
            id="task_w4_harvest",
            week_number=4,
            title="Pruning & First Harvest",
            description=f"Harvest mature outer leaves or pinch growing tips to encourage robust branching.",
            associated_plant=selected[0]["name"],
            estimated_minutes=20,
            touch_grass_action="Harvest freshly picked organic produce outside and savor the homegrown aroma."
        ),
        WeeklyTaskItem(
            id="task_w4_cycle",
            week_number=4,
            title="Composting & Cycle Refresh",
            description="Clear fallen organic matter into a compost bin, rotate planters, and refresh mulch layers.",
            associated_plant=None,
            estimated_minutes=15,
            touch_grass_action="Take 10 mindful minutes in your outdoor garden space breathing fresh air."
        )
    ]

    summary = (
        f"Customized outdoor garden plan for your {profile.garden_type} in {profile.location_or_climate}. "
        f"Selected 3 resilient plants ({selected[0]['name']}, {selected[1]['name']}, and {selected[2]['name']}) "
        f"perfect for {profile.sunlight} light and a {profile.experience} gardener. "
        f"Designed to minimize screen time and maximize outdoor connection."
    )

    return GardenPlanResponse(
        profile=profile,
        summary=summary,
        recommendations=recommendations,
        weekly_checklist=checklist,
        engine="deterministic_curated",
        engine_details="Curated Botanical Knowledge Base & Expert Heuristic Matching System",
        disclaimer="Seasonal note: Local weather patterns, frost dates, and microclimates vary. Always verify local planting calendars before sowing outdoors.",
        generated_at=datetime.utcnow().isoformat() + "Z"
    )
