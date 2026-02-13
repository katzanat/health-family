import { getRecommendedCheckups } from '../../data/checkupRecommendations';
import CheckupCard from './CheckupCard';

export default function CheckupList({ member, checkupLogs, onMarkDone, dismissedCheckups, onDismissCheckup }) {
  const recommended = getRecommendedCheckups(member.age, member.gender);
  const memberLogs = checkupLogs[member.id] || {};
  const memberDismissed = dismissedCheckups[member.id] || [];

  const visible = recommended.filter((c) => !memberDismissed.includes(c.id));

  if (visible.length === 0) {
    return <p className="empty-state">No recommended checkups for this member.</p>;
  }

  return (
    <div className="checkup-list">
      <h3>Recommended Checkups</h3>
      <div className="checkup-grid">
        {visible.map((c) => (
          <CheckupCard
            key={c.id}
            checkup={c}
            lastDone={memberLogs[c.id] || null}
            onMarkDone={(checkupId, date) => onMarkDone(member.id, checkupId, date)}
            onDismiss={(checkupId) => onDismissCheckup(member.id, checkupId)}
          />
        ))}
      </div>
    </div>
  );
}
