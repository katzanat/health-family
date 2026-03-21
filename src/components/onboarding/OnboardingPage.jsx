import { useRef } from 'react';
import FamilyMemberForm from './FamilyMemberForm';
import FamilyMemberList from './FamilyMemberList';

export default function OnboardingPage({ members, onAddMember, onDeleteMember, onContinue }) {
  const formRef = useRef(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const hasMembers = members.length > 0;

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Welcome to SymptomNest</h1>
        <p className="slogan">My Family Health Tracker</p>
        {hasMembers ? (
          <>
            <div className="onboarding-top-actions">
              <button className="btn btn-success btn-lg" onClick={onContinue}>
                Go to Dashboard &rarr;
              </button>
              <button className="btn btn-secondary btn-lg" onClick={scrollToForm}>
                + Add Family Member
              </button>
            </div>
            <FamilyMemberList members={members} onDelete={onDeleteMember} />
            <div ref={formRef} className="onboarding-add-section">
              <h3>Add a Family Member</h3>
              <FamilyMemberForm onAdd={onAddMember} />
            </div>
          </>
        ) : (
          <>
            <p>Start by adding your family members below.</p>
            <FamilyMemberForm onAdd={onAddMember} />
            <FamilyMemberList members={members} onDelete={onDeleteMember} />
          </>
        )}
      </div>
    </div>
  );
}
