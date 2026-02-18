import { useState } from 'react';
import { getRecommendedVitamins } from '../../data/vitaminRecommendations';

const TYPES = ['Vitamin', 'Medication'];
const FREQUENCIES = ['Daily', 'Twice Daily', 'Weekly', 'As Needed'];

export default function MedicationSection({ medications, onAdd, onDelete, member }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Vitamin');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [notes, setNotes] = useState('');

  const vitamins = medications.filter((m) => m.type === 'Vitamin');
  const meds = medications.filter((m) => m.type === 'Medication');

  const recommended = getRecommendedVitamins(member.age, member.gender);
  const addedVitaminNames = vitamins.map((v) => v.name.toLowerCase());
  const unaddedRecommendations = recommended.filter(
    (r) => !addedVitaminNames.includes(r.name.toLowerCase())
  );

  function resetForm() {
    setName('');
    setType('Vitamin');
    setDosage('');
    setFrequency('Daily');
    setNotes('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      type,
      dosage: dosage.trim(),
      frequency,
      notes: notes.trim(),
    });
    resetForm();
    setShowForm(false);
  }

  function handleAddRecommendation(rec) {
    setName(rec.name);
    setType('Vitamin');
    setDosage(rec.dosage);
    setFrequency('Daily');
    setNotes('');
    setShowForm(true);
  }

  return (
    <div className="medication-section">
      <div className="medication-header">
        <h3>Vitamins & Medications</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form className="medication-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D, Ibuprofen" />
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
              <label>Dosage</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 1000 IU, 200 mg" />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Take with food" />
          </div>
          <button type="submit" className="btn btn-success btn-sm">Save</button>
        </form>
      )}

      {/* Vitamins & Supplements */}
      <div className="medication-subsection">
        <h4>Vitamins & Supplements</h4>
        {vitamins.length === 0 && (
          <p className="medication-empty">No vitamins recorded.</p>
        )}
        {vitamins.length > 0 && (
          <div className="medication-list">
            {vitamins.map((m) => (
              <div key={m.id} className="medication-item">
                <div className="medication-item-info">
                  <strong>{m.name}</strong>
                  {m.dosage && <span className="medication-dosage-badge">{m.dosage}</span>}
                  <span className="medication-freq-badge">{m.frequency}</span>
                </div>
                {m.notes && <p className="medication-notes">Note: {m.notes}</p>}
                <button className="btn-dismiss" title="Delete" onClick={() => onDelete(m.id)}>&times;</button>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Vitamins */}
        {unaddedRecommendations.length > 0 && (
          <div className="recommended-vitamins">
            <h5>Recommended for {member.name}</h5>
            <div className="recommended-list">
              {unaddedRecommendations.map((rec) => (
                <div key={rec.id} className="recommended-item">
                  <div className="recommended-item-info">
                    <strong>{rec.name}</strong>
                    <span className="medication-dosage-badge">{rec.dosage}</span>
                    <p className="recommended-reason">{rec.reason}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddRecommendation(rec)}>+ Add</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="medication-subsection">
        <h4>Medications</h4>
        {meds.length === 0 && (
          <p className="medication-empty">No medications recorded.</p>
        )}
        {meds.length > 0 && (
          <div className="medication-list">
            {meds.map((m) => (
              <div key={m.id} className="medication-item">
                <div className="medication-item-info">
                  <strong>{m.name}</strong>
                  {m.dosage && <span className="medication-dosage-badge">{m.dosage}</span>}
                  <span className="medication-freq-badge">{m.frequency}</span>
                </div>
                {m.notes && <p className="medication-notes">Note: {m.notes}</p>}
                <button className="btn-dismiss" title="Delete" onClick={() => onDelete(m.id)}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
