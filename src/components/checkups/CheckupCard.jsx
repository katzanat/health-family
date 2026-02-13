import { useState } from 'react';
import { getCheckupStatus, getNextDueDate, formatDate, formatFrequency } from '../../utils/checkupUtils';

const STATUS_LABELS = {
  'up-to-date': 'Up to Date',
  'due-soon': 'Due Soon',
  'overdue': 'Overdue',
};

export default function CheckupCard({ checkup, lastDone, onMarkDone, onDismiss }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const status = getCheckupStatus(lastDone, checkup.frequencyMonths);
  const nextDue = getNextDueDate(lastDone, checkup.frequencyMonths);

  function handleMarkWithDate() {
    if (selectedDate) {
      onMarkDone(checkup.id, new Date(selectedDate).toISOString());
      setShowDatePicker(false);
      setSelectedDate('');
    }
  }

  return (
    <div className={`checkup-card status-${status}`}>
      <div className="checkup-header">
        <h4>{checkup.name}</h4>
        <div className="checkup-header-right">
          <span className={`status-badge ${status}`}>{STATUS_LABELS[status]}</span>
          <button
            className="btn-dismiss"
            onClick={() => onDismiss(checkup.id)}
            title="Remove this checkup"
          >
            &times;
          </button>
        </div>
      </div>
      <div className="checkup-details">
        <p><strong>Frequency:</strong> {formatFrequency(checkup.frequencyMonths)}</p>
        <p><strong>Last done:</strong> {formatDate(lastDone)}</p>
        <p><strong>Next due:</strong> {nextDue ? formatDate(nextDue.toISOString()) : 'Schedule now'}</p>
      </div>

      {!showDatePicker ? (
        <div className="checkup-actions">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onMarkDone(checkup.id, new Date().toISOString())}
          >
            Done Today
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowDatePicker(true)}
          >
            Pick Date
          </button>
        </div>
      ) : (
        <div className="checkup-date-picker">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <div className="checkup-date-actions">
            <button className="btn btn-sm btn-primary" onClick={handleMarkWithDate} disabled={!selectedDate}>
              Save
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => { setShowDatePicker(false); setSelectedDate(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
