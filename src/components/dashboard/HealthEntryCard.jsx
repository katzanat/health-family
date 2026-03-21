import { formatDate } from '../../utils/checkupUtils';

export default function HealthEntryCard({ entry, memberName, onDelete }) {
  return (
    <div className="health-entry-card">
      <div className="entry-header">
        <span className="entry-location">{entry.bodyLocation}</span>
        <span className="entry-date">{formatDate(entry.date)}</span>
        {onDelete && (
          <button className="btn-dismiss" title="Delete symptom" onClick={() => onDelete(entry.id)}>&times;</button>
        )}
      </div>
      <p className="entry-member">For: <strong>{memberName}</strong></p>
      {entry.duration && <p className="entry-duration">Duration: {entry.duration}</p>}
      <p className="entry-description">{entry.description}</p>
      {entry.whatWasDone && (
        <p className="entry-action"><strong>Action taken:</strong> {entry.whatWasDone}</p>
      )}
      {(entry.images?.length > 0 || entry.image) && (
        <div className="entry-image-gallery">
          {(entry.images?.length > 0 ? entry.images : [entry.image]).map((img, idx) => (
            <img key={idx} src={img} alt={`Photo ${idx + 1}`} />
          ))}
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
