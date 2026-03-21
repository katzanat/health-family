import { useState } from 'react';
import HealthEntryCard from './HealthEntryCard';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue Follow-up' },
  { id: 'followup', label: 'Has Follow-up' },
];

export default function HealthEntryList({ entries, members, onDelete }) {
  const [filter, setFilter] = useState('all');
  const memberMap = {};
  members.forEach((m) => { memberMap[m.id] = m.name; });

  const today = new Date();

  const sorted = [...entries].sort((a, b) => {
    const aOverdue = a.followUp && a.followUpDate && new Date(a.followUpDate) < today;
    const bOverdue = b.followUp && b.followUpDate && new Date(b.followUpDate) < today;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  const filtered = sorted.filter((e) => {
    if (filter === 'overdue') return e.followUp && e.followUpDate && new Date(e.followUpDate) < today;
    if (filter === 'followup') return e.followUp;
    return true;
  });

  return (
    <div className="health-entry-list">
      <div className="entry-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0
        ? <p className="empty-state">{entries.length === 0 ? 'No symptoms recorded yet.' : 'No symptoms match this filter.'}</p>
        : filtered.map((e) => (
          <HealthEntryCard key={e.id} entry={e} memberName={memberMap[e.memberId] || 'Unknown'} onDelete={onDelete} />
        ))
      }
    </div>
  );
}
