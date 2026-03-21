import { useState } from 'react';
import { formatDate } from '../../utils/checkupUtils';

const SPECIALTIES = [
  'General / Family Doctor', 'Pediatrician', 'Dermatologist', 'Dentist',
  'Gynecologist', 'Cardiologist', 'Orthopedist', 'Neurologist',
  'Ophthalmologist', 'ENT', 'Allergist', 'Psychiatrist / Therapist', 'Other',
];

function buildGCalLink(appt, memberName) {
  const title = encodeURIComponent(`Doctor Appointment — ${memberName} (${appt.specialty || appt.doctorName})`);
  const start = appt.date.replace(/-/g, '');
  // all-day event
  const end = appt.date.replace(/-/g, '');
  const details = encodeURIComponent(
    [appt.doctorName && `Doctor: ${appt.doctorName}`, appt.notes && `Notes: ${appt.notes}`]
      .filter(Boolean).join('\n')
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

export default function AppointmentSection({ appointments, memberName, onAdd, onDelete, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [recordingOutcomeId, setRecordingOutcomeId] = useState(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [form, setForm] = useState({ date: '', doctorName: '', specialty: '', notes: '' });

  const today = new Date();
  const upcoming = appointments
    .filter((a) => !a.date || new Date(a.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = appointments
    .filter((a) => a.date && new Date(a.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  function handleAdd(e) {
    e.preventDefault();
    if (!form.date) return;
    onAdd({ id: Date.now().toString(), ...form, outcome: '' });
    setForm({ date: '', doctorName: '', specialty: '', notes: '' });
    setShowForm(false);
  }

  function handleSaveOutcome(apptId) {
    onUpdate(apptId, { outcome: outcomeText.trim() });
    setRecordingOutcomeId(null);
    setOutcomeText('');
  }

  function renderAppointment(a) {
    const isPast = a.date && new Date(a.date) < today;
    return (
      <div key={a.id} className={`appointment-item ${isPast && !a.outcome ? 'appointment-needs-outcome' : ''}`}>
        <div className="appointment-item-header">
          <div className="appointment-item-info">
            <span className="appointment-date">{a.date ? formatDate(a.date) : 'No date'}</span>
            {a.specialty && <span className="appointment-specialty">{a.specialty}</span>}
            {a.doctorName && <span className="appointment-doctor">Dr. {a.doctorName}</span>}
          </div>
          <div className="appointment-item-actions">
            {!isPast && (
              <a
                href={buildGCalLink(a, memberName)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary"
                title="Add to Google Calendar"
              >
                📅 Calendar
              </a>
            )}
            <button className="btn-dismiss" onClick={() => onDelete(a.id)} title="Delete">&times;</button>
          </div>
        </div>
        {a.notes && <p className="appointment-notes">{a.notes}</p>}
        {a.outcome
          ? <p className="appointment-outcome"><strong>Outcome:</strong> {a.outcome}</p>
          : isPast && recordingOutcomeId !== a.id && (
            <button className="btn btn-sm btn-secondary" onClick={() => { setRecordingOutcomeId(a.id); setOutcomeText(''); }}>
              + Record outcome
            </button>
          )
        }
        {recordingOutcomeId === a.id && (
          <div className="appointment-outcome-form">
            <textarea
              rows={2}
              placeholder="What was the outcome? Diagnosis, treatment, next steps..."
              value={outcomeText}
              onChange={(e) => setOutcomeText(e.target.value)}
            />
            <div className="appointment-outcome-actions">
              <button className="btn btn-sm btn-success" onClick={() => handleSaveOutcome(a.id)} disabled={!outcomeText.trim()}>
                Save
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setRecordingOutcomeId(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="appointment-section">
      <div className="appointment-header">
        <h3>Appointments</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Appointment'}
        </button>
      </div>

      {showForm && (
        <form className="appointment-form" onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Specialty</label>
              <select value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}>
                <option value="">Select...</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Doctor name (optional)</label>
              <input type="text" placeholder="e.g. Dr. Smith" value={form.doctorName} onChange={(e) => setForm((p) => ({ ...p, doctorName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <input type="text" placeholder="Reason for visit..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn btn-success btn-sm">Save Appointment</button>
        </form>
      )}

      {appointments.length === 0 && !showForm && (
        <p className="empty-state">No appointments recorded.</p>
      )}

      {upcoming.length > 0 && (
        <div className="appointment-group">
          <h4 className="appointment-group-label">Upcoming</h4>
          {upcoming.map(renderAppointment)}
        </div>
      )}

      {past.length > 0 && (
        <div className="appointment-group">
          <h4 className="appointment-group-label">Past</h4>
          {past.map(renderAppointment)}
        </div>
      )}
    </div>
  );
}
