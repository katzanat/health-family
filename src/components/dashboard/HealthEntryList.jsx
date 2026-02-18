import HealthEntryCard from './HealthEntryCard';

export default function HealthEntryList({ entries, members }) {
  const memberMap = {};
  members.forEach((m) => { memberMap[m.id] = m.name; });

  if (entries.length === 0) {
    return <p className="empty-state">No health entries yet.</p>;
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="health-entry-list">
      {sorted.map((e) => (
        <HealthEntryCard key={e.id} entry={e} memberName={memberMap[e.memberId] || 'Unknown'} />
      ))}
    </div>
  );
}
