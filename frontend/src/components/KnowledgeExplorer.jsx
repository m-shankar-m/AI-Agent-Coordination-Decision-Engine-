import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Scale, 
  CheckCircle, 
  BookOpen, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function KnowledgeExplorer() {
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/knowledge/policies')
      .then(res => res.json())
      .then(data => setPolicies(data.policies || []))
      .catch(err => console.error("Error loading policies:", err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('http://localhost:8000/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCategory === 'ALL' ? '' : selectedCategory,
          top_k: 5
        })
      });
      const data = await res.json();
      setSearchResults(data.policies || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const displayedPolicies = searchResults !== null ? searchResults : policies.filter(p => {
    if (selectedCategory === 'ALL') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const categories = ['ALL', 'Banking', 'AML', 'Portfolio Risk', 'Insurance'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Search Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '6px' }}>
              Vector Knowledge & Regulatory Corpus
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Institutional Policy & Legal Knowledge Base
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Embedded Vector Store & Semantic Search
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '42px', fontSize: '0.875rem' }}
              placeholder="Search regulatory rules (e.g., 'OCC Qualified Mortgage DTI limit', 'Basel III CET1', 'OFAC SAR rules')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" disabled={searching} className="btn btn-primary" style={{ padding: '0 20px' }}>
            <Sparkles size={16} />
            <span>{searching ? 'Vector Searching...' : 'Semantic Search'}</span>
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchResults(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: selectedCategory === cat ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'rgba(255,255,255,0.06)',
                color: selectedCategory === cat ? '#030712' : 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Policies List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {displayedPolicies.map((pol) => (
          <div
            key={pol.doc_id}
            className="glass-panel"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {pol.category}
                </span>
                <span className="font-mono" style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                  {pol.doc_id}
                </span>
              </div>

              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
                {pol.title}
              </h3>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={13} color="#a855f7" />
                <span>Regulatory Authority: {pol.regulatory_body}</span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.45', background: 'rgba(5, 8, 20, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                "{pol.clause_text}"
              </p>
            </div>

            {pol.relevance_score && (
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Semantic Relevance Score:</span>
                <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
                  {Math.round(pol.relevance_score * 100)}% Match
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
