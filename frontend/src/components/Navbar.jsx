import React from 'react';
import { Sprout, BookOpen, Printer, Sparkles, Cpu } from 'lucide-react';

export default function Navbar({ onOpenCatalog, ollamaStatus, engineType }) {
  const isGemmaActive = engineType === 'gemma';
  const isOllamaOnline = ollamaStatus?.online;

  return (
    <nav className="navbar">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <Sprout size={26} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="brand-title">The Gardening Assistant</h1>
          <div className="brand-tagline">TGA • Touch Grass Gardening Planner</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Status pill indicating engine & Ollama connection */}
        <div className="status-pill" title={isOllamaOnline ? `Ollama active with models: ${ollamaStatus.models?.join(', ')}` : "Ollama not running. Fallback to expert botanical dataset."}>
          <div className={`status-dot ${isOllamaOnline ? 'online' : 'offline'}`} />
          <span>
            {isGemmaActive ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={14} color="#10b981" /> Gemma AI Active
              </span>
            ) : isOllamaOnline ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Cpu size={14} /> Ollama Ready
              </span>
            ) : (
              'Curated Botanical Grounding'
            )}
          </span>
        </div>

        <button 
          className="btn-secondary" 
          onClick={onOpenCatalog}
          id="btn-open-catalog"
          title="Browse all curated plants in our botanical database"
        >
          <BookOpen size={16} />
          <span>Plant Catalog</span>
        </button>

        <button 
          className="btn-secondary" 
          onClick={() => window.print()}
          id="btn-print-plan"
          title="Print outdoor plan to take into the garden"
        >
          <Printer size={16} />
          <span>Print Plan</span>
        </button>
      </div>
    </nav>
  );
}
