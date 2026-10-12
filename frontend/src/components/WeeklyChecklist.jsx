import React, { useState } from 'react';
import { Check, CheckCircle2, Calendar, Clock, Footprints, RotateCcw, Award } from 'lucide-react';

export default function WeeklyChecklist({ tasks = [], checkedTasks = {}, onToggleTask, onResetChecklist }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => checkedTasks[t.id]).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Outdoor touch grass title
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
