import { formatDate } from '../../utils/checkupUtils';

export default function HealthEntryCard({ entry, memberName }) {
  return (
    <div className="health-entry-card">
      <div className="entry-header">
        <span className="entry-location">{entry.bodyLocation}</span>
        <span className="entry-date">{formatDate(entry.date)}</span>
      </div>
      <p className="entry-member">For: <strong>{memberName}</strong></p>
      {entry.duration && <p className="entry-duration">Duration: {entry.duration}</p>}
      <p className="entry-description">{entry.description}</p>
      {entry.whatWasDone && (
        <p className="entry-action"><strong>Action taken:</strong> {entry.whatWasDone}</p>
      )}
      {entry.image && (
        <div className="entry-image">
          <img src={entry.image} alt="Symptom" />
        </div>
      )}
      {entry.followUp && (
        <p className="entry-followup">
          Follow-up: {entry.followUpDate ? formatDate(entry.followUpDate) : 'Scheduled'}
        </p>
      )}
    </div>
  );
}
