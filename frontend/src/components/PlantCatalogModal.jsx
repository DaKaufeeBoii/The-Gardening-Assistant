import React, { useState } from 'react';
import { X, Search, Sun, Droplet, Sprout } from 'lucide-react';

export default function PlantCatalogModal({ plants = [], isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!isOpen) return null;

  const filteredPlants = plants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.scientific_name && p.scientific_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>
              <Sprout size={22} color="var(--color-forest-emerald)" />
              Curated Botanical Dataset ({plants.length} Plants)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Reliable, peer-reviewed plant science powering TGA's recommendations.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close catalog">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by plant name, herb, vegetable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <Search size={16} color="#888" style={{ position: 'absolute', left: 12, top: 13 }} />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'herb', 'vegetable', 'fruit', 'flower', 'foliage'].map(cat => (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          <div className="plants-grid">
            {filteredPlants.map(plant => (
              <div key={plant.id} className="plant-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-deep)' }}>{plant.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {plant.scientific_name}
                    </div>
                  </div>
                  <span className="plant-tag" style={{ background: '#e8f5e9', color: '#1b4332' }}>
                    {plant.category}
                  </span>
                </div>

                <div className="plant-badges-row" style={{ margin: '8px 0' }}>
                  <span className="badge-item">
                    <Sun size={12} color="#f59e0b" /> {plant.sunlight} sun
                  </span>
                  <span className="badge-item">
                    <Droplet size={12} color="#0284c7" /> every {plant.watering_frequency_days}d
                  </span>
                  <span className="badge-item">
                    🪴 {plant.space}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {plant.watering_guidance}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-forest-dark)', background: '#f5fbf7', padding: '6px 8px', borderRadius: '6px' }}>
                  <strong>Outdoor Habit:</strong> {plant.touch_grass_tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
