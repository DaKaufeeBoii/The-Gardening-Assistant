import React, { useState } from 'react';
import { Droplet, Sun, Clock, Compass, Users, Footprints, Volume2, Square } from 'lucide-react';
import { playOutdoorNarration, stopOutdoorNarration } from '../utils/audioNarration';

export default function PlantCard({ plant, apiBase = '' }) {
  const [voiceState, setVoiceState] = useState({ isPlaying: false, engine: null });

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'herb': return 'tag-herb';
      case 'vegetable': return 'tag-vegetable';
      case 'fruit': return 'tag-fruit';
      case 'flower': return 'tag-flower';
      default: return 'tag-foliage';
    }
  };

  const getSunlightLabel = (sun) => {
    switch (sun?.toLowerCase()) {
      case 'full': return 'Full Sun (6+ hrs)';
      case 'partial': return 'Partial Sun (3-6 hrs)';
      case 'low': return 'Low Sun / Shade';
      default: return sun;
    }
  };

  const handleToggleAudio = () => {
    if (voiceState.isPlaying) {
      stopOutdoorNarration(setVoiceState);
    } else {
      const speechText = `${plant.name}. ${plant.touch_grass_tip || ''}. Watering schedule: water every ${plant.watering_frequency_days || 3} days. ${plant.watering_guidance || ''}`;
      playOutdoorNarration(speechText, apiBase, setVoiceState);
    }
  };

  return (
    <div className="plant-card" id={`plant-card-${plant.id}`}>
      <div className="plant-card-header">
        <div>
          <h3 className="plant-card-title">{plant.name}</h3>
          {plant.scientific_name && (
            <div className="plant-card-scientific">{plant.scientific_name}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn-icon"
            onClick={handleToggleAudio}
            title={voiceState.isPlaying ? "Stop audio narration" : "Listen to plant care and outdoor habits (Hands-free ElevenLabs voice)"}
            style={{
              background: voiceState.isPlaying ? 'var(--color-forest-pale)' : '#f4f7f4',
              color: voiceState.isPlaying ? 'var(--color-forest-dark)' : 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            {voiceState.isPlaying ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
          </button>
          <span className={`plant-tag ${getCategoryClass(plant.category)}`}>
            {plant.category}
          </span>
        </div>
      </div>

      {voiceState.isPlaying && (
        <div style={{
          fontSize: '0.72rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '3px 8px',
          borderRadius: '6px',
          marginBottom: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }}>
          <span>🔊 {voiceState.engine === 'elevenlabs' ? 'ElevenLabs AI Voice' : 'Outdoor Audio Guide'} playing...</span>
        </div>
      )}

      <div className="plant-badges-row">
        <span className="badge-item">
          <Sun size={13} color="#f59e0b" />
          {getSunlightLabel(plant.sunlight)}
        </span>
        <span className="badge-item">
          <Clock size={13} color="#10b981" />
          ~{plant.growing_time_days} days to grow
        </span>
        <span className="badge-item">
          <Compass size={13} color="#6366f1" />
          {plant.space}
        </span>
      </div>

      <div className="plant-detail-block">
        <span className="detail-label">Watering Schedule</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Droplet size={14} color="#0284c7" />
          <strong>Every {plant.watering_frequency_days || 3} days:</strong>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {plant.watering_guidance}
        </p>
      </div>

      {plant.climate_notes && (
        <div className="plant-detail-block">
          <span className="detail-label">Climate & Seasonal Note</span>
          <p style={{ fontSize: '0.82rem' }}>{plant.climate_notes}</p>
        </div>
      )}

      {plant.why_recommended && (
        <div className="plant-detail-block" style={{ background: '#f8faf8', padding: '10px', borderRadius: '8px' }}>
          <span className="detail-label" style={{ color: 'var(--color-forest-mid)' }}>Why this matches your garden</span>
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>"{plant.why_recommended}"</p>
        </div>
      )}

      {plant.companion_plants && plant.companion_plants.length > 0 && (
        <div className="plant-detail-block">
          <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> Companion Plants
          </span>
          <div className="chips-row" style={{ marginTop: 4 }}>
            {plant.companion_plants.map((comp) => (
              <span key={comp} className="chip" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {plant.touch_grass_tip && (
        <div className="touch-grass-callout">
          <strong>
            <Footprints size={15} /> Touch Grass Outdoor Habit:
          </strong>
          <span>{plant.touch_grass_tip}</span>
        </div>
      )}
    </div>
  );
}
