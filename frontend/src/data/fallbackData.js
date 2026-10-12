export const FALLBACK_PLANTS = [
  {
    "id": "basil",
    "name": "Sweet Basil",
    "scientific_name": "Ocimum basilicum",
    "category": "herb",
    "sunlight": "full",
    "space": "pot",
    "difficulty": "beginner",
    "watering_guidance": "Water deeply when the top 1 inch of soil feels dry; avoid wetting foliage directly.",
    "watering_frequency_days": 2,
    "growing_time_days": 60,
    "ideal_garden_types": ["balcony", "indoor pots", "backyard"],
    "climate_notes": "Thrives in warm weather (20°C–30°C / 68°F–86°F). Sensitive to frost and cold snaps.",
    "touch_grass_tip": "Pinch flower buds off outdoor stems every Sunday morning to encourage bushy leaf growth.",
    "companion_plants": ["Cherry Tomato", "Bell Pepper", "Marigold"],
    "weekly_tasks": [
      "Check topsoil moisture and bottom-water container if dry",
      "Pinch off terminal flower buds to promote bushy leaf production",
      "Inspect underside of leaves for early aphids or spider mites",
      "Harvest top leaves right above a leaf node for kitchen use"
    ]
  },
  {
    "id": "cherry_tomato",
    "name": "Cherry Tomato",
    "scientific_name": "Solanum lycopersicum var. cerasiforme",
    "category": "vegetable",
    "sunlight": "full",
    "space": "balcony",
    "difficulty": "beginner",
    "watering_guidance": "Consistent deep watering 2–3 times a week; prevent soil drying out completely to avoid fruit splitting.",
    "watering_frequency_days": 2,
    "growing_time_days": 75,
    "ideal_garden_types": ["balcony", "backyard"],
    "climate_notes": "Needs at least 6–8 hours of direct sunshine. Check local last frost dates before transplanting outside.",
    "touch_grass_tip": "Stake or tie vines to bamboo trellises outside and pinch side suckers in the evening breeze.",
    "companion_plants": ["Sweet Basil", "Marigold", "Parsley"],
    "weekly_tasks": [
      "Secure growing main stem to stake or cage with soft ties",
      "Prune non-fruiting lower suckers to direct energy into fruit clusters",
      "Apply organic liquid potassium fertilizer or compost tea",
      "Check moisture levels to prevent blossom end rot"
    ]
  },
  {
    "id": "mint",
    "name": "Spearmint",
    "scientific_name": "Mentha spicata",
    "category": "herb",
    "sunlight": "partial",
    "space": "pot",
    "difficulty": "beginner",
    "watering_guidance": "Loves consistently moist soil. Keep in dedicated container to prevent invasive root spread.",
    "watering_frequency_days": 2,
    "growing_time_days": 45,
    "ideal_garden_types": ["balcony", "indoor pots", "backyard"],
    "climate_notes": "Hardy perennial. Tolerates cool weather and partial shade with ease.",
    "touch_grass_tip": "Step outside barefoot, pluck fresh mint sprigs, and crush between fingers for natural aromatherapy.",
    "companion_plants": ["Cabbage", "Kale"],
    "weekly_tasks": [
      "Thoroughly hydrate container and verify drain holes are unblocked",
      "Trim outer runners so roots stay confined to the container",
      "Rotate pot 90 degrees to ensure even sun exposure",
      "Harvest upper third of stems to stimulate fresh young sprigs"
    ]
  }
];

export const DEFAULT_INITIAL_PLAN = {
  profile: {
    location_or_climate: "Temperate / Moderate",
    garden_type: "balcony",
    sunlight: "partial",
    experience: "beginner",
    space: "medium",
    preferences: ["herb", "vegetable"]
  },
  summary: "Customized outdoor garden plan for your balcony in Temperate / Moderate. Selected 3 resilient plants (Sweet Basil, Spearmint, and Cherry Tomato) perfect for partial sunlight and a beginner gardener. Designed to minimize screen time and maximize outdoor connection.",
  recommendations: [
    {
      id: "basil",
      name: "Sweet Basil",
      scientific_name: "Ocimum basilicum",
      category: "herb",
      sunlight: "full",
      space: "pot",
      difficulty: "beginner",
      watering_guidance: "Water deeply when the top 1 inch of soil feels dry; avoid wetting foliage directly.",
      watering_frequency_days: 2,
      growing_time_days: 60,
      climate_notes: "Thrives in warm weather (20°C–30°C / 68°F–86°F). Sensitive to frost.",
      touch_grass_tip: "Pinch flower buds off outdoor stems every Sunday morning to encourage bushy leaf growth.",
      why_recommended: "Tailored for container gardening on balconies. Highly productive culinary herb that rewards beginner gardeners rapidly.",
      companion_plants: ["Cherry Tomato", "Bell Pepper", "Marigold"],
      weekly_tasks: ["Check soil moisture", "Pinch flower buds", "Harvest top leaves"]
    },
    {
      id: "mint",
      name: "Spearmint",
      scientific_name: "Mentha spicata",
      category: "herb",
      sunlight: "partial",
      space: "pot",
      difficulty: "beginner",
      watering_guidance: "Loves consistently moist soil. Keep in dedicated container to prevent invasive root spread.",
      watering_frequency_days: 2,
      growing_time_days: 45,
      climate_notes: "Hardy perennial. Tolerates cool weather and partial shade with ease.",
      touch_grass_tip: "Step outside barefoot, pluck fresh mint sprigs, and crush between fingers for natural aromatherapy.",
      why_recommended: "Thrives in partial shade, highly vigorous, and perfect for herbal teas and summer drinks.",
      companion_plants: ["Cabbage", "Kale"],
      weekly_tasks: ["Hydrate pot", "Trim outer runners", "Rotate pot"]
    },
    {
      id: "cherry_tomato",
      name: "Cherry Tomato",
      scientific_name: "Solanum lycopersicum var. cerasiforme",
      category: "vegetable",
      sunlight: "full",
      space: "balcony",
      difficulty: "beginner",
      watering_guidance: "Consistent deep watering 2–3 times a week; prevent soil drying out completely.",
      watering_frequency_days: 2,
      growing_time_days: 75,
      climate_notes: "Needs at least 6–8 hours of direct sunshine. Check local last frost dates.",
      touch_grass_tip: "Stake or tie vines to bamboo trellises outside and pinch side suckers in the evening breeze.",
      why_recommended: "Compact high-yield variety that brings the authentic sensory joy of picking sun-ripened tomatoes outside.",
      companion_plants: ["Sweet Basil", "Marigold", "Parsley"],
      weekly_tasks: ["Secure stem to stake", "Prune lower suckers", "Organic feed"]
    }
  ],
  weekly_checklist: [
    {
      id: "task_w1_prep",
      week_number: 1,
      title: "Soil Preparation & Setup",
      description: "Fill balcony planters with well-draining potting mix and compost for Sweet Basil and Mint.",
      associated_plant: "Sweet Basil",
      estimated_minutes: 25,
      touch_grass_action: "Get your hands into the fresh earth outside to test soil texture and aeration."
    },
    {
      id: "task_w1_sow",
      week_number: 1,
      title: "Seedling Transplant & Hydration",
      description: "Gently set starter plugs into pots, firm soil around roots, and water deeply.",
      associated_plant: "Cherry Tomato",
      estimated_minutes: 20,
      touch_grass_action: "Soak the topsoil with a gentle watering wand in the morning sunlight."
    },
    {
      id: "task_w2_sprout",
      week_number: 2,
      title: "Root Hydration & Light Check",
      description: "Assess topsoil moisture with finger and rotate pots to face the morning sun angle.",
      associated_plant: "Sweet Basil",
      estimated_minutes: 15,
      touch_grass_action: "Pinch flower buds off outdoor stems every Sunday morning to encourage bushy leaf growth."
    },
    {
      id: "task_w2_thin",
      week_number: 2,
      title: "Container Drainage Inspection",
      description: "Verify saucer runoff flows freely to keep Spearmint roots oxygenated.",
      associated_plant: "Spearmint",
      estimated_minutes: 15,
      touch_grass_action: "Step outside barefoot, pluck fresh mint sprigs, and crush between fingers for natural aromatherapy."
    },
    {
      id: "task_w3_feed",
      week_number: 3,
      title: "Staking & Trellis Support",
      description: "Tie Cherry Tomato vines to lightweight bamboo canes to prepare for cluster weight.",
      associated_plant: "Cherry Tomato",
      estimated_minutes: 20,
      touch_grass_action: "Stake or tie vines to bamboo trellises outside and pinch side suckers in the evening breeze."
    },
    {
      id: "task_w3_support",
      week_number: 3,
      title: "Foliage Scout & Prune",
      description: "Pinch terminal shoots on Sweet Basil and Spearmint to encourage denser bushy branching.",
      associated_plant: "Sweet Basil",
      estimated_minutes: 15,
      touch_grass_action: "Take a deep breath of herbal aromas outside away from computer screens."
    },
    {
      id: "task_w4_harvest",
      week_number: 4,
      title: "First Culinary Harvest",
      description: "Harvest mature basil and mint sprigs for cooking right before dinner.",
      associated_plant: "Sweet Basil",
      estimated_minutes: 20,
      touch_grass_action: "Harvest freshly picked organic produce outside and savor the homegrown aroma."
    },
    {
      id: "task_w4_cycle",
      week_number: 4,
      title: "Outdoor Observation & Composting",
      description: "Trim yellow lower leaves, add cuttings to compost, and enjoy your green space.",
      associated_plant: null,
      estimated_minutes: 15,
      touch_grass_action: "Take 10 mindful minutes in your outdoor garden space breathing fresh air."
    }
  ],
  engine: "deterministic_curated",
  engine_details: "Curated Botanical Knowledge Base & Expert Heuristic System",
  disclaimer: "Seasonal note: Local weather patterns, frost dates, and microclimates vary. Always verify local planting calendars before sowing outdoors.",
  generated_at: new Date().toISOString()
};
