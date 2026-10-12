import React, { useState } from 'react';
import { Check, Calendar, Clock, Footprints, RotateCcw, Award, Volume2, Square, Headphones } from 'lucide-react';
import { playOutdoorNarration, stopOutdoorNarration } from '../utils/audioNarration';

export default function WeeklyChecklist({ tasks = [], checkedTasks = {}, onToggleTask, onResetChecklist, apiBase = '' }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeVoiceTaskId, setActiveVoiceTaskId] = useState(null);
  const [voiceEngine, setVoiceEngine] = useState(null);

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => checkedTasks[t.id]).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const getBadgeTitle = (percent) => {
    if (percent === 100) return '🏆 Master Green Thumb (100% Outdoor Harmony)';
    if (percent >= 75) return '🌿 Flourishing Outdoor Grower';
    if (percent >= 40) return '🌱 Active Earth Explorer';
    return '🪴 Indoor-to-Outdoor Beginner';
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'all') return true;
    return t.week_number === parseInt(activeFilter, 10);
  });

  const handlePlayTaskAudio = (e, task) => {
    e.stopPropagation();
    if (activeVoiceTaskId === task.id) {
      stopOutdoorNarration();
      setActiveVoiceTaskId(null);
      setVoiceEngine(null);
    } else {
      setActiveVoiceTaskId(task.id);
      const textToSpeak = `Week ${task.week_number}. ${task.title}. ${task.description}. Outdoor habit: ${task.touch_grass_action || ''}`;
      playOutdoorNarration(textToSpeak, apiBase, (state) => {
        if (!state.isPlaying) {
          setActiveVoiceTaskId(null);
          setVoiceEngine(null);
        } else {
          setVoiceEngine(state.engine);
        }
      });
    }
  };

  const handlePlayAllFiltered = () => {
    if (activeVoiceTaskId === 'all') {
      stopOutdoorNarration();
      setActiveVoiceTaskId(null);
      setVoiceEngine(null);
    } else {
      setActiveVoiceTaskId('all');
      const allText = filteredTasks.map(t => `Week ${t.week_number}: ${t.title}. ${t.touch_grass_action || ''}`).join('. Next task: ');
      playOutdoorNarration(`Outdoor gardening checklist. ${allText}`, apiBase, (state) => {
        if (!state.isPlaying) {
          setActiveVoiceTaskId(null);
          setVoiceEngine(null);
        } else {
          setVoiceEngine(state.engine);
        }
      });
    }
  };

  return (
    <div className="checklist-card" id="weekly-checklist-card">
      <div className="checklist-header">
        <div>
          <h2 className="card-title">
            <Calendar size={22} color="var(--color-forest-emerald)" />
            Weekly Outdoor Gardening Checklist
          </h2>
          <p className="card-subtitle" style={{ marginBottom: 0 }}>
            Practical steps to turn botanical advice into real soil, sunshine, and hands-on outdoor habits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePlayAllFiltered}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            title="Listen to all tasks hands-free outside"
          >
            {activeVoiceTaskId === 'all' ? (
              <>
                <Square size={14} fill="currentColor" /> Stop Voice
              </>
            ) : (
              <>
                <Headphones size={14} /> Listen Outdoors (Hands-Free)
              </>
            )}
          </button>

          {completedCount > 0 && (
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onResetChecklist}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              title="Reset all checkboxes"
            >
              <RotateCcw size={14} /> Reset Progress
            </button>
          )}
        </div>
      </div>

      {activeVoiceTaskId && (
        <div style={{
          fontSize: '0.78rem',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '6px 12px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🔊 <strong>Hands-Free Outdoor Narration:</strong> Speaking with {voiceEngine === 'elevenlabs' ? 'ElevenLabs AI' : 'Voice Assistant'}...</span>
        </div>
      )}

      {/* Progress Bar & Touch Grass Milestone */}
      <div className="progress-container">
        <div className="progress-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} color="var(--color-forest-mid)" />
            <span>{getBadgeTitle(progressPercent)}</span>
          </span>
          <span>
            {completedCount} of {totalTasks} Completed ({progressPercent}%)
          </span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Week Filter Buttons */}
      <div className="week-filters">
        <button
          type="button"
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Weeks ({totalTasks})
        </button>
        {[1, 2, 3, 4].map(w => {
          const countForWeek = tasks.filter(t => t.week_number === w).length;
          return (
            <button
              key={w}
              type="button"
              className={`filter-btn ${activeFilter === String(w) ? 'active' : ''}`}
              onClick={() => setActiveFilter(String(w))}
            >
              Week {w} ({countForWeek})
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="tasks-list">
        {filteredTasks.map((task) => {
          const isDone = !!checkedTasks[task.id];
          const isPlayingThis = activeVoiceTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`task-row ${isDone ? 'completed' : ''}`}
              onClick={() => onToggleTask(task.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`task-checkbox-custom ${isDone ? 'checked' : ''}`}>
                {isDone && <Check size={14} strokeWidth={3} />}
              </div>

              <div className="task-content">
                <div className="task-meta">
                  <span className="week-badge">Week {task.week_number}</span>
                  <span className="time-badge">
                    <Clock size={12} /> {task.estimated_minutes} min outside
                  </span>
                  {task.associated_plant && (
                    <span className="plant-assoc-badge">
                      🌿 {task.associated_plant}
                    </span>
                  )}
                </div>

                <div className="task-title">{task.title}</div>
                <div className="task-desc">{task.description}</div>

                {task.touch_grass_action && (
                  <div className="task-touch-grass">
                    <Footprints size={13} />
                    <span><strong>Outdoor Action:</strong> {task.touch_grass_action}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={(e) => handlePlayTaskAudio(e, task)}
                title={isPlayingThis ? "Stop audio" : "Listen to this task (ElevenLabs voice)"}
                style={{
                  background: isPlayingThis ? 'var(--color-forest-pale)' : '#f4f7f4',
                  color: isPlayingThis ? 'var(--color-forest-dark)' : 'var(--text-secondary)',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                {isPlayingThis ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
