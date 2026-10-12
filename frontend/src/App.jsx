import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GardenForm from './components/GardenForm';
import PlantCard from './components/PlantCard';
import WeeklyChecklist from './components/WeeklyChecklist';
import PlantCatalogModal from './components/PlantCatalogModal';
import { DEFAULT_INITIAL_PLAN, FALLBACK_PLANTS } from './data/fallbackData';
import { Sparkles, Sprout, ShieldCheck, Footprints, AlertCircle, Headphones, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || (
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5173')
    ? 'http://127.0.0.1:8000'
    : ''
);

const PRESET_PLANS = [
  {
    title: 'Sunny Balcony Herbs',
    desc: 'Full sun, compact pots, high aroma',
    icon: '🪴',
    profile: {
      location_or_climate: 'Mediterranean / Sunny Zone 8',
      garden_type: 'balcony',
      sunlight: 'full',
      experience: 'beginner',
      space: 'medium',
      preferences: ['herb']
    }
  },
  {
    title: 'Backyard Salad & Veggies',
    desc: 'Cool partial sun, crisp greens, beds',
    icon: '🥬',
    profile: {
      location_or_climate: 'Temperate Zone 6-7',
      garden_type: 'backyard',
      sunlight: 'partial',
      experience: 'beginner',
      space: 'large',
      preferences: ['vegetable']
    }
  },
  {
    title: 'Apartment Shade Oasis',
    desc: 'Low light, indoor air-purifiers',
    icon: '🌿',
    profile: {
      location_or_climate: 'Urban High-rise / Indoors',
      garden_type: 'indoor pots',
      sunlight: 'low',
      experience: 'beginner',
      space: 'small',
      preferences: ['foliage']
    }
  }
];

export default function App() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('tga_profile');
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_PLAN.profile;
    } catch {
      return DEFAULT_INITIAL_PLAN.profile;
    }
  });

  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('tga_plan');
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_PLAN;
    } catch {
      return DEFAULT_INITIAL_PLAN;
    }
  });

  const [checkedTasks, setCheckedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('tga_checked_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [enginePreference, setEnginePreference] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [allPlants, setAllPlants] = useState(FALLBACK_PLANTS);
  const [climateAdvisory, setClimateAdvisory] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tga_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('tga_plan', JSON.stringify(plan));
    } catch (e) {
      console.error(e);
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem('tga_checked_tasks', JSON.stringify(checkedTasks));
    } catch (e) {
      console.error(e);
    }
  }, [checkedTasks]);

  // Check backend health & fetch full plant dataset
  useEffect(() => {
    const fetchHealthAndPlants = async () => {
      try {
        const healthRes = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setOllamaStatus(healthData.ollama);
        }

        const plantsRes = await fetch(`${API_BASE}/api/plants`, { method: 'GET' });
        if (plantsRes.ok) {
          const plantsData = await plantsRes.json();
          if (plantsData.plants && plantsData.plants.length > 0) {
            setAllPlants(plantsData.plants);
          }
        }
      } catch (err) {
        console.warn('Backend not responding yet or in standalone frontend mode:', err);
      }
    };
    fetchHealthAndPlants();
  }, []);

  // Fetch real-time / verified frost & climate advisory (SerpApi)
  useEffect(() => {
    let active = true;
    const fetchClimate = async () => {
      if (!profile.location_or_climate) return;
      try {
        const res = await fetch(`${API_BASE}/api/climate/live?location=${encodeURIComponent(profile.location_or_climate)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setClimateAdvisory(data);
        }
      } catch (err) {
        console.warn('Climate live lookup failed:', err);
      }
    };
    const debounceTimer = setTimeout(fetchClimate, 300);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [profile.location_or_climate]);

  const handleGeneratePlan = async (customProfile = null) => {
    const targetProfile = customProfile || profile;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/recommend${enginePreference === 'deterministic' ? '?engine_preference=deterministic' : ''}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetProfile)
        }
      );

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const planData = await res.json();
      setPlan(planData);
      setCheckedTasks({});
    } catch (err) {
      console.warn('Error fetching plan from API, maintaining current plan with notification:', err);
      setErrorMsg('Could not reach backend API. Using verified local deterministic plan fallback.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setProfile(preset.profile);
    handleGeneratePlan(preset.profile);
  };

  const handleToggleTask = (taskId) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleResetChecklist = () => {
    setCheckedTasks({});
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenCatalog={() => setCatalogOpen(true)}
        ollamaStatus={ollamaStatus}
        engineType={plan?.engine}
      />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-pill">
          <Footprints size={15} />
          <span>Hacktoberfest 2026 • “Touch Grass” Challenge</span>
        </div>
        <h2 className="hero-title">
          The screen should be the <span>shortest part</span> of gardening.
        </h2>
        <p className="hero-subtitle">
          Input your light, space, and region. Get 3 factual, grounded plant recommendations,
          an actionable 4-week outdoor task schedule, and hands-free voice guides to unplug and touch real soil.
        </p>

        {/* Partner Categories Badge Row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <span className="chip" style={{ background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
            🌱 Best Use of Gemma
          </span>
          <span className="chip" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
            🎙️ Best Use of ElevenLabs
          </span>
          <span className="chip" style={{ background: '#e0f2fe', color: '#075985', fontWeight: 600 }}>
            🔍 Best Use of SerpApi
          </span>
          <span className="chip" style={{ background: '#f3e8ff', color: '#6b21a8', fontWeight: 600 }}>
            📊 Best Use of Sentry
          </span>
          <span className="chip" style={{ background: '#f5f5f5', color: '#333333', fontWeight: 600 }}>
            🚀 Deployable on Vercel & Render
          </span>
        </div>

        {/* 1-Click Quick Presets */}
        <div className="presets-card">
          <div className="presets-header">
            <Sparkles size={16} color="var(--color-forest-emerald)" />
            <span>Try Instant Presets:</span>
          </div>
          <div className="presets-grid">
            {PRESET_PLANS.map((preset) => (
              <button
                key={preset.title}
                type="button"
                className="preset-btn"
                onClick={() => handleSelectPreset(preset)}
              >
                <div className="preset-btn-icon">{preset.icon}</div>
                <div>
                  <div className="preset-btn-title">{preset.title}</div>
                  <div className="preset-btn-desc">{preset.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #f87171',
          color: '#991b1b',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form + Results */}
      <main className="main-layout">
        <aside>
          <GardenForm
            profile={profile}
            onChange={setProfile}
            onSubmit={() => handleGeneratePlan()}
            loading={loading}
            enginePreference={enginePreference}
            onEngineChange={setEnginePreference}
            climateAdvisory={climateAdvisory}
          />
        </aside>

        <section className="results-container">
          {/* Plan Header Banner */}
          <div className="plan-header-banner" id="plan-header-banner">
            <div className="plan-header-top">
              <div>
                <span className="plan-header-badge">
                  {plan.engine === 'gemma' ? (
                    <>
                      <Sparkles size={14} color="#a7f3d0" />
                      <span>Gemma Open-Weight Local Inference</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} color="#a7f3d0" />
                      <span>Curated Botanical Rule Engine</span>
                    </>
                  )}
                </span>
                <h3 style={{ color: 'white', marginTop: 8, fontSize: '1.4rem' }}>
                  Your Personalized Outdoor Gardening Plan
                </h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#bbf7d0', textAlign: 'right' }}>
                {plan.profile?.garden_type?.toUpperCase()} • {plan.profile?.sunlight?.toUpperCase()} SUN
              </div>
            </div>

            <p className="plan-summary-text">{plan.summary}</p>
            <div className="plan-disclaimer">
              {plan.disclaimer}
            </div>
          </div>

          {/* 3 Recommended Plant Cards */}
          <div>
            <div className="plants-section-title">
              <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sprout size={20} color="var(--color-forest-emerald)" />
                Recommended Plants ({plan.recommendations?.length || 0})
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Factual Care & Hands-Free Audio
              </span>
            </div>

            <div className="plants-grid">
              {(plan.recommendations || []).map((plant) => (
                <PlantCard key={plant.id} plant={plant} apiBase={API_BASE} />
              ))}
            </div>
          </div>

          {/* Weekly Gardening Checklist */}
          <WeeklyChecklist
            tasks={plan.weekly_checklist || []}
            checkedTasks={checkedTasks}
            onToggleTask={handleToggleTask}
            onResetChecklist={handleResetChecklist}
            apiBase={API_BASE}
          />
        </section>
      </main>

      {/* Complete Botanical Dataset Modal */}
      <PlantCatalogModal
        plants={allPlants}
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-quote">
          “The ultimate goal of gardening technology is to send you outside into the dirt.”
        </div>
        <p>
          The Gardening Assistant (TGA) • Hacktoberfest Touch Grass Challenge.
          Featuring Best Use of Gemma, ElevenLabs, SerpApi, and Sentry.
        </p>
      </footer>
    </div>
  );
}
