import { useState } from 'react';

const TYPES = ['Food', 'Drug', 'Environmental'];
const SEVERITIES = ['Mild', 'Moderate', 'Severe'];

const SEVERITY_COLORS = {
  Mild: { bg: 'var(--success-light)', color: 'var(--success)' },
  Moderate: { bg: 'var(--warning-light)', color: '#856404' },
  Severe: { bg: 'var(--danger-light)', color: 'var(--danger)' },
};

export default function AllergySection({ allergies, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [allergen, setAllergen] = useState('');
  const [type, setType] = useState('Food');
  const [severity, setSeverity] = useState('Mild');
  const [reaction, setReaction] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!allergen.trim()) return;
    onAdd({
      id: Date.now().toString(),
      allergen: allergen.trim(),
      type,
      severity,
      reaction: reaction.trim(),
    });
    setAllergen('');
    setType('Food');
    setSeverity('Mild');
    setReaction('');
    setShowForm(false);
  }

  return (
    <div className="allergy-section">
      <div className="allergy-header">
        <h3>Allergies</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Allergy'}
        </button>
      </div>

      {showForm && (
        <form className="allergy-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Allergen *</label>
              <input type="text" value={allergen} onChange={(e) => setAllergen(e.target.value)} placeholder="e.g. Peanuts, Penicillin" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Reaction</label>
              <input type="text" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="e.g. Hives, swelling" />
            </div>
          </div>
          <button type="submit" className="btn btn-success btn-sm">Save Allergy</button>
        </form>
      )}

      {allergies.length === 0 && !showForm && (
        <p className="allergy-empty">No allergies recorded.</p>
      )}

      {allergies.length > 0 && (
        <div className="allergy-list">
          {allergies.map((a) => (
            <div key={a.id} className="allergy-item">
              <div className="allergy-item-info">
                <strong>{a.allergen}</strong>
                <span className="allergy-type-badge">{a.type}</span>
                <span className="allergy-severity-badge" style={{ background: SEVERITY_COLORS[a.severity]?.bg, color: SEVERITY_COLORS[a.severity]?.color }}>
                  {a.severity}
                </span>
              </div>
              {a.reaction && <p className="allergy-reaction">Reaction: {a.reaction}</p>}
              <button className="btn-dismiss" title="Delete allergy" onClick={() => onDelete(a.id)}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
