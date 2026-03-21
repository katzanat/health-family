import { useState } from 'react';
import { getRecommendedCheckups } from '../../data/checkupRecommendations';
import { getCheckupStatus } from '../../utils/checkupUtils';
import CheckupCard from './CheckupCard';

const STATUS_ORDER = { overdue: 0, 'due-soon': 1, 'up-to-date': 2 };

export default function CheckupList({ member, checkupLogs, onMarkDone, dismissedCheckups, onDismissCheckup }) {
  const [showUpToDate, setShowUpToDate] = useState(false);
  const recommended = getRecommendedCheckups(member.age, member.gender);
  const memberLogs = checkupLogs[member.id] || {};
  const memberDismissed = dismissedCheckups[member.id] || [];

  const visible = recommended
    .filter((c) => !memberDismissed.includes(c.id))
    .sort((a, b) => {
      const sa = STATUS_ORDER[getCheckupStatus(memberLogs[a.id], a.frequencyMonths)] ?? 2;
      const sb = STATUS_ORDER[getCheckupStatus(memberLogs[b.id], b.frequencyMonths)] ?? 2;
      return sa - sb;
    });

  const active = visible.filter((c) => getCheckupStatus(memberLogs[c.id], c.frequencyMonths) !== 'up-to-date');
  const upToDate = visible.filter((c) => getCheckupStatus(memberLogs[c.id], c.frequencyMonths) === 'up-to-date');

  if (visible.length === 0) {
    return <p className="empty-state">No recommended checkups for this member.</p>;
  }

  return (
    <div className="checkup-list">
      <h3>Recommended Checkups</h3>
      {active.length > 0 && (
        <div className="checkup-grid">
          {active.map((c) => (
            <CheckupCard
              key={c.id}
              checkup={c}
              lastDone={memberLogs[c.id] || null}
              onMarkDone={(checkupId, date) => onMarkDone(member.id, checkupId, date)}
              onDismiss={(checkupId) => onDismissCheckup(member.id, checkupId)}
            />
          ))}
        </div>
      )}
      {upToDate.length > 0 && (
        <div className="checkup-uptodategroup">
          <button
            className="btn btn-secondary btn-sm checkup-collapse-toggle"
            onClick={() => setShowUpToDate((v) => !v)}
          >
            {showUpToDate ? '▲' : '▼'} Up to Date ({upToDate.length})
          </button>
          {showUpToDate && (
            <div className="checkup-grid checkup-grid-muted">
              {upToDate.map((c) => (
                <CheckupCard
                  key={c.id}
                  checkup={c}
                  lastDone={memberLogs[c.id] || null}
                  onMarkDone={(checkupId, date) => onMarkDone(member.id, checkupId, date)}
                  onDismiss={(checkupId) => onDismissCheckup(member.id, checkupId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
