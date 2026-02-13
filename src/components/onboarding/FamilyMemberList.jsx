import FamilyMemberCard from './FamilyMemberCard';

export default function FamilyMemberList({ members, onDelete }) {
  if (members.length === 0) {
    return (
      <div className="empty-state">
        <p>No family members added yet. Add your first member above!</p>
      </div>
    );
  }

  return (
    <div className="member-list">
      {members.map((m) => (
        <FamilyMemberCard key={m.id} member={m} onDelete={onDelete} />
      ))}
    </div>
  );
}
