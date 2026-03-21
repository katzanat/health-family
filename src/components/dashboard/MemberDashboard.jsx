import { useState } from 'react';
import CheckupList from '../checkups/CheckupList';
import HealthEntryList from './HealthEntryList';
import AllergySection from './AllergySection';
import GrowthSection from './GrowthSection';
import MedicationSection from './MedicationSection';
import PeriodSection from './PeriodSection';
import AppointmentSection from './AppointmentSection';
import { exportForDoctor } from '../../utils/exportSummary';
import { getRecommendedCheckups } from '../../data/checkupRecommendations';
import { getCheckupStatus } from '../../utils/checkupUtils';

const ROLE_ICONS = {
  Mom: '\u{1F469}',
  Dad: '\u{1F468}',
  Brother: '\u{1F466}',
  Sister: '\u{1F467}',
  Grandparent: '\u{1F9D3}',
  Other: '\u{1F9D1}',
};

export default function MemberDashboard({
  member, entries, checkupLogs, onMarkCheckupDone, onAddEntry, onDeleteEntry, onBack,
  dismissedCheckups, onDismissCheckup,
  allergies, onAddAllergy, onDeleteAllergy,
  growthRecords, onAddGrowthRecord, onDeleteGrowthRecord,
  medications, onAddMedication, onDeleteMedication,
  periodRecords, onAddPeriodRecord, onDeletePeriodRecord,
  appointments, onAddAppointment, onDeleteAppointment, onUpdateAppointment,
}) {
  const memberEntries = entries.filter((e) => e.memberId === member.id);
  const memberAllergies = allergies[member.id] || [];
  const memberGrowth = growthRecords[member.id] || [];
  const memberMedications = medications[member.id] || [];
  const memberPeriodRecords = periodRecords[member.id] || [];
  const memberAppointments = appointments[member.id] || [];

  const memberCheckupLogs = checkupLogs[member.id] || {};
  const memberDismissed = dismissedCheckups[member.id] || [];
  const recommendedCheckups = getRecommendedCheckups(member.age, member.gender);
  const checkupAlertCount = recommendedCheckups.filter((c) => {
    if (memberDismissed.includes(c.id)) return false;
    const status = getCheckupStatus(memberCheckupLogs[c.id], c.frequencyMonths);
    return status === 'overdue' || status === 'due-soon';
  }).length;

  const tabs = [
    { id: 'entries', label: 'Symptoms', icon: '📋', count: memberEntries.length },
    { id: 'checkups', label: 'Checkups', icon: '✅', count: checkupAlertCount, countAlert: true },
    { id: 'allergies', label: 'Allergies', icon: '⚠️', count: memberAllergies.length },
    { id: 'medications', label: 'Medications', icon: '💊', count: memberMedications.length },
    { id: 'growth', label: 'Growth', icon: '📏', count: memberGrowth.length },
    ...(member.gender?.toLowerCase() === 'female' ? [{ id: 'period', label: 'Period', icon: '🌸', count: memberPeriodRecords.length }] : []),
    { id: 'appointments', label: 'Appointments', icon: '🏥', count: memberAppointments.filter((a) => !a.outcome).length, countAlert: memberAppointments.filter((a) => a.date && new Date(a.date) < new Date() && !a.outcome).length > 0 },
  ];

  const [activeTab, setActiveTab] = useState('entries');

  return (
    <div className="member-dashboard">
      <button className="btn btn-secondary btn-sm" onClick={onBack}>&larr; Back to Family</button>
      <div className="member-profile">
        <span className="member-profile-icon">
          {member.avatar
            ? <img src={member.avatar} alt={member.name} className="member-avatar-lg" />
            : (ROLE_ICONS[member.role] || '\u{1F9D1}')
          }
        </span>
        <div>
          <h2>{member.name}</h2>
          <p>{member.role} &middot; {member.age} yrs &middot; {member.gender}</p>
          {member.knownIssues && <p className="member-issues">Known issues: {member.knownIssues}</p>}
        </div>
      </div>

      <div className="member-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`member-tab${activeTab === tab.id ? ' member-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="member-tab-icon-row">
              <span className="member-tab-icon">{tab.icon}</span>
              {tab.count > 0 && (
                <span className={`member-tab-badge${tab.countAlert ? ' member-tab-badge-alert' : ''}`}>
                  {tab.count}
                </span>
              )}
            </span>
            <span className="member-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="member-tab-content">
        {activeTab === 'entries' && (
          <div className="entries-section">
            <div className="entries-header">
              <h3>Symptoms</h3>
              <div className="entries-header-actions">
                <button className="btn btn-primary" onClick={() => onAddEntry(member.id)}>+ Add Symptom</button>
                <button className="btn btn-secondary btn-export" onClick={() => exportForDoctor(member, entries, checkupLogs, memberAllergies, memberGrowth, memberMedications, memberPeriodRecords)} title="Export health summary for doctor visit">
                  ⬇ Export for Doctor
                </button>
              </div>
            </div>
            <HealthEntryList entries={memberEntries} members={[member]} onDelete={onDeleteEntry} />
          </div>
        )}

        {activeTab === 'checkups' && (
          <CheckupList
            member={member}
            checkupLogs={checkupLogs}
            onMarkDone={onMarkCheckupDone}
            dismissedCheckups={dismissedCheckups}
            onDismissCheckup={onDismissCheckup}
          />
        )}

        {activeTab === 'allergies' && (
          <AllergySection
            allergies={memberAllergies}
            onAdd={(allergy) => onAddAllergy(member.id, allergy)}
            onDelete={(allergyId) => onDeleteAllergy(member.id, allergyId)}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationSection
            medications={memberMedications}
            onAdd={(med) => onAddMedication(member.id, med)}
            onDelete={(medId) => onDeleteMedication(member.id, medId)}
            member={member}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthSection
            records={memberGrowth}
            onAdd={(record) => onAddGrowthRecord(member.id, record)}
            onDelete={(recordId) => onDeleteGrowthRecord(member.id, recordId)}
          />
        )}

        {activeTab === 'period' && member.gender?.toLowerCase() === 'female' && (
          <PeriodSection
            records={memberPeriodRecords}
            onAdd={(record) => onAddPeriodRecord(member.id, record)}
            onDelete={(recordId) => onDeletePeriodRecord(member.id, recordId)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentSection
            appointments={memberAppointments}
            memberName={member.name}
            onAdd={(appt) => onAddAppointment(member.id, appt)}
            onDelete={(apptId) => onDeleteAppointment(member.id, apptId)}
            onUpdate={(apptId, updates) => onUpdateAppointment(member.id, apptId, updates)}
          />
        )}
      </div>
    </div>
  );
}
