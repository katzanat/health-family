import FamilyMemberForm from './FamilyMemberForm';
import FamilyMemberList from './FamilyMemberList';

export default function OnboardingPage({ members, onAddMember, onDeleteMember, onContinue }) {
  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Welcome to Health Family</h1>
        <p className="slogan">My Family Health Tracker</p>
        <p>Start by adding your family members below.</p>
        {members.length > 0 && (
          <button className="btn btn-success btn-lg" onClick={onContinue} style={{ marginTop: '16px' }}>
            Continue to Dashboard &rarr;
          </button>
        )}
      </div>
      <FamilyMemberForm onAdd={onAddMember} />
      <FamilyMemberList members={members} onDelete={onDeleteMember} />
    </div>
  );
}
