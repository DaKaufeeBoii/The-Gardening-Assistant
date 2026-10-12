from typing import List, Optional
from pydantic import BaseModel, Field


class GardenProfile(BaseModel):
    location_or_climate: str = Field(
        default="Temperate / Moderate",
        description="Location, climate description or USDA zone"
    )
    garden_type: str = Field(
        default="balcony",
        description="balcony, indoor pots, or backyard"
    )
    sunlight: str = Field(
        default="partial",
        description="low, partial, or full sunlight exposure"
    )
    experience: str = Field(
        default="beginner",
        description="beginner or experienced"
    )
    space: str = Field(
        default="medium",
        description="small (<2m²), medium (2-10m²), or large (>10m²)"
    )
    preferences: Optional[List[str]] = Field(
        default_factory=list,
        description="Preferred plant categories like herb, vegetable, flower, foliage"
    )


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
    engine: str  # "gemma" or "deterministic_curated"
    engine_details: str
    disclaimer: str
    generated_at: str
