import { useState } from 'react';
import BodySelector from '../body-selector/BodySelector';

const DURATION_UNITS = ['hours', 'days', 'weeks', 'months'];

const FOLLOWUP_PRESETS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '1 year', days: 365 },
];

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function HealthEntryModal({ members, onSave, onClose, preselectedMemberId }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    memberId: preselectedMemberId || '',
    date: today,
    bodyLocation: '',
    images: [],
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

  function resizeImage(dataUrl, maxSize, quality, callback) {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.slice(0, 5 - form.images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resizeImage(reader.result, 1200, 0.8, (resized) => {
          setForm((prev) => ({ ...prev, images: [...prev.images, resized] }));
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function handleRemoveImage(idx) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
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
      images: form.images,
      image: form.images[0] || null, // backward compat
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
          <h2>Add Symptom</h2>
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
            <label>Photos (optional, up to 5)</label>
            {form.images.length < 5 && (
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            )}
            {form.images.length > 0 && (
              <div className="image-gallery-preview">
                {form.images.map((img, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={img} alt={`Photo ${idx + 1}`} />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveImage(idx)}>
                      &times;
                    </button>
                  </div>
                ))}
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
              <div className="followup-date-picker">
                <div className="followup-presets">
                  {FOLLOWUP_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className={`btn btn-sm ${form.followUpDate === addDays(p.days) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleChange('followUpDate', addDays(p.days))}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => handleChange('followUpDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Symptom</button>
          </div>
        </form>
      </div>
    </div>
  );
}
