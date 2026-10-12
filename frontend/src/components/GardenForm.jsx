import React from 'react';
import { Sun, CloudSun, Cloud, Shovel, Sparkles, MapPin, Compass } from 'lucide-react';

const CLIMATE_PRESETS = [
  'Temperate / Zone 7',
  'Mediterranean (Warm & Dry)',
  'Subtropical (Humid)',
  'Cool Maritime',
  'Urban High-rise Microclimate'
];

const PREFERENCE_OPTIONS = [
  { id: 'herb', label: 'Culinary Herbs', icon: '🌿' },
  { id: 'vegetable', label: 'Fresh Vegetables', icon: '🥬' },
  { id: 'fruit', label: 'Berry / Fruit', icon: '🍓' },
  { id: 'flower', label: 'Pollinator Flowers', icon: '🌸' },
  { id: 'foliage', label: 'Green Foliage', icon: '🪴' }
];

export default function GardenForm({ profile, onChange, onSubmit, loading, enginePreference, onEngineChange }) {
  const handlePreferenceToggle = (catId) => {
    const current = profile.preferences || [];
    if (current.includes(catId)) {
      onChange({ ...profile, preferences: current.filter(c => c !== catId) });
    } else {
      onChange({ ...profile, preferences: [...current, catId] });
    }
  };

  return (
    <div className="card" id="garden-profile-card">
      <h2 className="card-title">
        <Compass size={22} color="var(--color-forest-emerald)" />
        Garden Profile
      </h2>
      <p className="card-subtitle">
        Tell us about your space. We ground every plan in verified plant science.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {/* Location or Climate Region */}
        <div className="form-group">
          <label className="form-label" htmlFor="location-input">
            Location or Climate Region
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="location-input"
              type="text"
              className="form-input"
              placeholder="e.g. Temperate, Mediterranean, Zone 6b..."
              value={profile.location_or_climate}
              onChange={(e) => onChange({ ...profile, location_or_climate: e.target.value })}
              required
            />
          </div>
          <div className="chips-row">
            {CLIMATE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="chip"
                onClick={() => onChange({ ...profile, location_or_climate: preset })}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Garden Type */}
        <div className="form-group">
          <label className="form-label">Garden Type</label>
          <div className="options-grid">
            <div
              className={`option-box ${profile.garden_type === 'balcony' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, garden_type: 'balcony' })}
              id="opt-garden-balcony"
            >
              <div className="option-icon">🪴</div>
              <div className="option-title">Balcony</div>
              <div className="option-hint">Railing & pots</div>
            </div>

            <div
              className={`option-box ${profile.garden_type === 'indoor pots' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, garden_type: 'indoor pots' })}
              id="opt-garden-indoor"
            >
              <div className="option-icon">🏡</div>
              <div className="option-title">Indoor Pots</div>
              <div className="option-hint">Windowsill & room</div>
            </div>

            <div
              className={`option-box ${profile.garden_type === 'backyard' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, garden_type: 'backyard' })}
              id="opt-garden-backyard"
            >
              <div className="option-icon">🌳</div>
              <div className="option-title">Backyard</div>
              <div className="option-hint">Beds & soil</div>
            </div>
          </div>
        </div>

        {/* Sunlight Exposure */}
        <div className="form-group">
          <label className="form-label">Daily Sunlight Exposure</label>
          <div className="options-grid">
            <div
              className={`option-box ${profile.sunlight === 'low' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, sunlight: 'low' })}
              id="opt-sun-low"
            >
              <div className="option-icon">☁️</div>
              <div className="option-title">Low / Shade</div>
              <div className="option-hint">&lt; 3 hrs direct sun</div>
            </div>

            <div
              className={`option-box ${profile.sunlight === 'partial' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, sunlight: 'partial' })}
              id="opt-sun-partial"
            >
              <div className="option-icon">⛅</div>
              <div className="option-title">Partial Sun</div>
              <div className="option-hint">3 to 6 hrs sun</div>
            </div>

            <div
              className={`option-box ${profile.sunlight === 'full' ? 'active' : ''}`}
              onClick={() => onChange({ ...profile, sunlight: 'full' })}
              id="opt-sun-full"
            >
              <div className="option-icon">☀️</div>
              <div className="option-title">Full Sun</div>
              <div className="option-hint">6+ hrs sun</div>
            </div>
          </div>
        </div>

        {/* Experience Level & Space */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Experience</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                className={`option-box ${profile.experience === 'beginner' ? 'active' : ''}`}
                style={{ padding: '8px', textAlign: 'left', alignItems: 'flex-start' }}
                onClick={() => onChange({ ...profile, experience: 'beginner' })}
                id="opt-exp-beginner"
              >
                <div className="option-title">🌱 Beginner</div>
                <div className="option-hint">Forgiving & resilient</div>
              </div>
              <div
                className={`option-box ${profile.experience === 'experienced' ? 'active' : ''}`}
                style={{ padding: '8px', textAlign: 'left', alignItems: 'flex-start' }}
                onClick={() => onChange({ ...profile, experience: 'experienced' })}
                id="opt-exp-experienced"
              >
                <div className="option-title">🧑‍🌾 Experienced</div>
                <div className="option-hint">Higher rewards</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Available Space</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                className={`option-box ${profile.space === 'small' ? 'active' : ''}`}
                style={{ padding: '8px', textAlign: 'left', alignItems: 'flex-start' }}
                onClick={() => onChange({ ...profile, space: 'small' })}
                id="opt-space-small"
              >
                <div className="option-title">Small (&lt;2m²)</div>
                <div className="option-hint">Few containers</div>
              </div>
              <div
                className={`option-box ${profile.space === 'medium' ? 'active' : ''}`}
                style={{ padding: '8px', textAlign: 'left', alignItems: 'flex-start' }}
                onClick={() => onChange({ ...profile, space: 'medium' })}
                id="opt-space-medium"
              >
                <div className="option-title">Medium (2-10m²)</div>
                <div className="option-hint">Patio or balcony</div>
              </div>
              <div
                className={`option-box ${profile.space === 'large' ? 'active' : ''}`}
                style={{ padding: '8px', textAlign: 'left', alignItems: 'flex-start' }}
                onClick={() => onChange({ ...profile, space: 'large' })}
                id="opt-space-large"
              >
                <div className="option-title">Large (&gt;10m²)</div>
                <div className="option-hint">Full garden beds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Preferences */}
        <div className="form-group">
          <label className="form-label">Plant Preferences (Optional)</label>
          <div className="category-pills">
            {PREFERENCE_OPTIONS.map((cat) => {
              const isSelected = (profile.preferences || []).includes(cat.id);
              return (
                <div
                  key={cat.id}
                  className={`category-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handlePreferenceToggle(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engine Preference Switcher */}
        <div className="form-group" style={{ background: '#f5f8f5', padding: '12px 14px', borderRadius: '12px' }}>
          <label className="form-label" style={{ marginBottom: 6, fontSize: '0.8rem' }}>
            Inference Engine Mode
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`filter-btn ${enginePreference === 'auto' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => onEngineChange('auto')}
            >
              Auto (Gemma + Fallback)
            </button>
            <button
              type="button"
              className={`filter-btn ${enginePreference === 'deterministic' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => onEngineChange('deterministic')}
            >
              Curated Expert Only
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          id="btn-submit-plan"
        >
          {loading ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              <span>Analyzing Botanical Grounding...</span>
            </>
          ) : (
            <>
              <Shovel size={18} />
              <span>Generate Outdoor Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
