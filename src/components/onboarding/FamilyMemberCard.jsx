const ROLE_ICONS = {
  Mom: '\u{1F469}',
  Dad: '\u{1F468}',
  Brother: '\u{1F466}',
  Sister: '\u{1F467}',
  Grandparent: '\u{1F9D3}',
  Other: '\u{1F9D1}',
};

export default function FamilyMemberCard({ member, onDelete }) {
  return (
    <div className="member-card">
      <div className="member-card-icon">{ROLE_ICONS[member.role] || '\u{1F9D1}'}</div>
      <div className="member-card-info">
        <h4>{member.name}</h4>
        <p>{member.role} &middot; {member.age} yrs &middot; {member.gender}</p>
        {member.knownIssues && (
          <p className="member-issues">Known issues: {member.knownIssues}</p>
        )}
      </div>
      <button className="btn btn-danger btn-sm" onClick={() => onDelete(member.id)} title="Remove member">
        &times;
      </button>
    </div>
  );
}
