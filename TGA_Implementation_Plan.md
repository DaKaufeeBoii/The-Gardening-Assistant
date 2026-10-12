# The Gardening Assistant (TGA) — Implementation Plan

## Goal
Build a demo-ready gardening planner that recommends suitable plants, explains how to care for them, and creates a weekly outdoor task checklist.

**Primary challenge direction:** Hacktoberfest “Touch Grass”  
**Recommended partner category:** Best Use of Gemma  
**MVP target:** A working local demo in about 60 minutes.

## 1. MVP features

1. **Garden profile**
   - Location or climate region
   - Garden type: balcony, indoor pots, backyard
   - Sunlight: low, partial, full
   - Experience: beginner or experienced
   - Available space

2. **Plant recommendations**
   - Recommend three plants.
   - Show sunlight, space, watering, approximate growing time, and care notes.
   - Base factual requirements on a curated plant dataset.

3. **Weekly gardening checklist**
   - Turn recommendations into practical outdoor tasks.
   - Let users check off completed tasks.
   - Save completion state in browser `localStorage`.

4. **AI-generated guidance**
   - Use Gemma through Ollama to personalize the plan.
   - Ask the model for structured JSON output.
   - Validate output on the backend and ground advice in known plant facts.
   - Provide a rule-based fallback if the model is unavailable.

## 2. Recommended stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Interactive web app |
| Styling | Tailwind CSS | Responsive interface |
| Backend | Python + FastAPI | Input validation and plan generation |
| AI | Gemma via Ollama | Local, open-weight generation |
| Plant data | Curated JSON | Reliable plant facts |
| Persistence | `localStorage` | Save plans and checklist state |
| Optional hosting | Render | Host the frontend/backend demo |

For the first hour, keep the app local. Only attempt deployment after the core flow works.

## 3. Partner category recommendation

### Primary target: Best Use of Gemma
Use Gemma to generate a personalized gardening plan from the user's conditions and a curated set of plant facts. Demonstrate local inference and explain why an open-weight model matters: the model can be run locally, the implementation can be inspected and adapted, and personal garden preferences need not be sent to a hosted proprietary AI API.

### Other possible partner categories (do not build all of these)
The challenge PDF lists the following categories. These are possible directions, not guarantees of eligibility; check each partner's current rules before relying on a prize category.

**Featured categories**
- **Best Use of Render:** Host the frontend/backend or use Render as the AI runtime where the implementation meets the category requirements.
- **Best Use of TabPFN:** Classify or predict planting outcomes from a suitable structured historical dataset. More data work than the MVP needs.
- **Best Use of Tinker:** Fine-tune a model and show measurable improvement against a baseline. Too much for the first hour.
- **Best Use of Arduino:** Add a physical planter monitor with sensors and an agent. Requires compatible hardware.
- **Best Use of DigitalOcean:** Deploy the app or serve an open-weight model on a GPU Droplet.
- **Best Use of Gemma:** Recommended. Use Gemma locally or serve it through an appropriate provider.

**Partner categories**
- **Best Use of Backboard:** Add assistant memory or RAG over gardening documents.
- **Best Use of ElevenLabs:** Add spoken gardening instructions or voice interaction.
- **Best Use of Entire:** Share agent sessions that explain how the project was built.
- **Best Use of GitHub Copilot:** Use qualifying Copilot coding tools, CLI, app, or GitHub Actions workflows.
- **Best Use of Mastra:** Orchestrate a gardening agent with tools, memory, and workflows.
- **Best Use of MongoDB Atlas:** Store profiles/plans or use Atlas Vector Search for gardening knowledge.
- **Best Use of Sentry Agent Tracing:** Capture AI traces, latency, errors, token usage, and debugging evidence.
- **Best Use of SerpApi:** Search for current, region-specific gardening information.
- **Best Use of Temporal:** Build durable, retryable workflows for scheduled or long-running tasks.
- **Best Use of Tiger Data:** Use PostgreSQL/pgvector for gardening knowledge retrieval.

**Decision:** Focus on the main “Touch Grass” challenge and Best Use of Gemma. Do not add partner integrations merely to collect categories.

## 4. Architecture

1. React form collects garden conditions.
2. FastAPI validates the inputs.
3. Backend selects relevant facts from the plant JSON dataset.
4. Backend sends the validated context to Gemma through Ollama.
5. Backend validates the generated response and returns a structured plan.
6. React renders plant cards and weekly tasks.
7. `localStorage` stores saved plans and checklist progress.

The frontend should remain usable if Ollama is offline by falling back to deterministic recommendations from the curated dataset.

## 5. Suggested data format

Example plant record:

```json
{
  "id": "basil",
  "name": "Basil",
  "sunlight": "full",
  "space": "pot",
  "watering_guidance": "Keep soil lightly moist; avoid waterlogging.",
  "growing_time_days": 60,
  "climate_notes": "Check local seasonal suitability before planting."
}
```

Use a small, reviewed dataset for the prototype. Do not present generic recommendations as guaranteed locally suitable advice. If climate or season data is unavailable, say so and ask the user to verify local conditions.

## 6. One-hour build schedule

| Time | Task |
|---|---|
| 0–5 min | Initialize React + Vite and install styling dependencies |
| 5–15 min | Build the landing page, garden form, and results layout |
| 15–25 min | Add a small curated plant dataset |
| 25–40 min | Implement recommendation logic and Gemma/Ollama integration if already installed |
| 40–50 min | Add the weekly checklist and save progress in `localStorage` |
| 50–60 min | Test balcony and backyard examples; verify fallback and prepare screenshots |

If Gemma/Ollama is not already running, do not spend the hour troubleshooting model installation. Finish the deterministic fallback first, then add live inference.

## 7. Acceptance checklist

- [ ] Project branding consistently says **The Gardening Assistant (TGA)**.
- [ ] User can submit garden conditions.
- [ ] App displays three plant recommendations with care information.
- [ ] App generates a weekly checklist.
- [ ] Checklist completion persists after refresh.
- [ ] Gemma inference works, or the fallback works clearly and reliably.
- [ ] Unsupported or uncertain seasonal claims are not presented as facts.
- [ ] README explains setup, architecture, AI use, limitations, and why open-weight AI matters.
- [ ] Demo shows the complete flow from inputs to an actionable outdoor plan.

## 8. README/demo story

Explain that TGA is designed to make the screen the shortest part of gardening: it generates a practical plan, then encourages users to go outside and do the work. Show a real example, disclose what runs locally, and explain what the curated dataset contributes beyond the model.

## 9. Deadline note

The supplied Week 1 challenge PDF lists **October 11, 2026** as the submission deadline. That date has passed as of October 12, 2026. Check the current challenge rules before treating TGA as a submission for a later round.
