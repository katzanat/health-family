import CheckupList from '../checkups/CheckupList';
import HealthEntryList from './HealthEntryList';
import AllergySection from './AllergySection';
import GrowthSection from './GrowthSection';
import MedicationSection from './MedicationSection';
import PeriodSection from './PeriodSection';
import { exportForDoctor } from '../../utils/exportSummary';

const ROLE_ICONS = {
  Mom: '\u{1F469}',
  Dad: '\u{1F468}',
  Brother: '\u{1F466}',
  Sister: '\u{1F467}',
  Grandparent: '\u{1F9D3}',
  Other: '\u{1F9D1}',
};

export default function MemberDashboard({
  member, entries, checkupLogs, onMarkCheckupDone, onAddEntry, onBack,
  dismissedCheckups, onDismissCheckup,
  allergies, onAddAllergy, onDeleteAllergy,
  growthRecords, onAddGrowthRecord, onDeleteGrowthRecord,
  medications, onAddMedication, onDeleteMedication,
  periodRecords, onAddPeriodRecord, onDeletePeriodRecord,
}) {
  const memberEntries = entries.filter((e) => e.memberId === member.id);
  const memberAllergies = allergies[member.id] || [];
  const memberGrowth = growthRecords[member.id] || [];
  const memberMedications = medications[member.id] || [];
  const memberPeriodRecords = periodRecords[member.id] || [];

  return (
    <div className="member-dashboard">
      <button className="btn btn-secondary btn-sm" onClick={onBack}>&larr; Back to Family</button>
      <div className="member-profile">
        <span className="member-profile-icon">{ROLE_ICONS[member.role] || '\u{1F9D1}'}</span>
        <div>
          <h2>{member.name}</h2>
          <p>{member.role} &middot; {member.age} yrs &middot; {member.gender}</p>
          {member.knownIssues && <p className="member-issues">Known issues: {member.knownIssues}</p>}
        </div>
      </div>

      <div className="entries-section">
        <div className="entries-header">
          <h3>Health Entries</h3>
          <div className="entries-header-actions">
            <button className="btn btn-primary" onClick={() => onAddEntry(member.id)}>+ Add Entry</button>
            <button className="btn btn-secondary" onClick={() => exportForDoctor(member, entries, checkupLogs, memberAllergies, memberGrowth, memberMedications, memberPeriodRecords)}>Export for Doctor</button>
          </div>
        </div>
        <HealthEntryList entries={memberEntries} members={[member]} />
      </div>

      <AllergySection
        allergies={memberAllergies}
        onAdd={(allergy) => onAddAllergy(member.id, allergy)}
        onDelete={(allergyId) => onDeleteAllergy(member.id, allergyId)}
      />

      <MedicationSection
        medications={memberMedications}
        onAdd={(med) => onAddMedication(member.id, med)}
        onDelete={(medId) => onDeleteMedication(member.id, medId)}
        member={member}
      />

      <GrowthSection
        records={memberGrowth}
        onAdd={(record) => onAddGrowthRecord(member.id, record)}
        onDelete={(recordId) => onDeleteGrowthRecord(member.id, recordId)}
      />

      {member.gender === 'Female' && (
        <PeriodSection
          records={memberPeriodRecords}
          onAdd={(record) => onAddPeriodRecord(member.id, record)}
          onDelete={(recordId) => onDeletePeriodRecord(member.id, recordId)}
        />
      )}

      <CheckupList member={member} checkupLogs={checkupLogs} onMarkDone={onMarkCheckupDone} dismissedCheckups={dismissedCheckups} onDismissCheckup={onDismissCheckup} />
    </div>
  );
}
