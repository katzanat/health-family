import { useState } from 'react';
import BodySelector from '../body-selector/BodySelector';

const DURATION_UNITS = ['hours', 'days', 'weeks', 'months'];

export default function HealthEntryModal({ members, onSave, onClose, preselectedMemberId }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    memberId: preselectedMemberId || '',
    date: today,
    bodyLocation: '',
    image: null,
    durationAmount: '',
    durationUnit: 'days',
    description: '',
    whatWasDone: '',
    followUp: false,
    followUpDate: '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('image', reader.result);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const errs = {};
    if (!form.memberId) errs.memberId = 'Select a family member';
    if (!form.date) errs.date = 'Date is required';
    if (!form.bodyLocation) errs.bodyLocation = 'Select a body location';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      id: Date.now().toString(),
      memberId: form.memberId,
      date: form.date,
      bodyLocation: form.bodyLocation,
      image: form.image,
      duration: form.durationAmount ? `${form.durationAmount} ${form.durationUnit}` : '',
      description: form.description.trim(),
      whatWasDone: form.whatWasDone.trim(),
      followUp: form.followUp,
      followUpDate: form.followUp ? form.followUpDate : '',
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Health Entry</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Family Member</label>
              <select value={form.memberId} onChange={(e) => handleChange('memberId', e.target.value)}>
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {errors.memberId && <span className="error">{errors.memberId}</span>}
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
              {errors.date && <span className="error">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Body Location</label>
            <BodySelector value={form.bodyLocation} onChange={(v) => handleChange('bodyLocation', v)} />
            {errors.bodyLocation && <span className="error">{errors.bodyLocation}</span>}
          </div>

          <div className="form-group">
            <label>Upload Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {form.image && (
              <div className="image-preview">
                <img src={form.image} alt="Symptom" />
                <button type="button" className="btn btn-sm btn-danger" onClick={() => handleChange('image', null)}>
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <div className="duration-input">
                <input
                  type="number"
                  min="0"
                  value={form.durationAmount}
                  onChange={(e) => handleChange('durationAmount', e.target.value)}
                  placeholder="e.g. 2"
                />
                <select value={form.durationUnit} onChange={(e) => handleChange('durationUnit', e.target.value)}>
                  {DURATION_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the health issue..."
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>What was done</label>
            <textarea
              rows={2}
              value={form.whatWasDone}
              onChange={(e) => handleChange('whatWasDone', e.target.value)}
              placeholder="Treatment, medication, etc."
            />
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.followUp}
                onChange={(e) => handleChange('followUp', e.target.checked)}
              />
              Follow-up needed
            </label>
            {form.followUp && (
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => handleChange('followUpDate', e.target.value)}
              />
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}
