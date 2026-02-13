export function generateSummaryHTML(member, entries, checkupLogs, allergies, growthRecords) {
  const memberEntries = entries
    .filter((e) => e.memberId === member.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const memberAllergies = allergies || [];
  const memberGrowth = (growthRecords || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  const memberCheckups = checkupLogs[member.id] || {};
  const isChild = member.age <= 18;

  function formatDate(d) {
    return new Date(d).toLocaleDateString();
  }

  let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Health Summary - ${member.name}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #333; }
  h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
  h2 { color: #1e40af; margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
  th { background: #f8f9fa; font-weight: 600; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; }
  .badge-mild { background: #d4edda; color: #155724; }
  .badge-moderate { background: #fff3cd; color: #856404; }
  .badge-severe { background: #f8d7da; color: #721c24; }
  .profile-box { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
  .footer { margin-top: 40px; font-size: 0.85rem; color: #888; border-top: 1px solid #ddd; padding-top: 12px; }
  @media print { body { padding: 0; } }
</style>
</head><body>`;

  // Profile
  html += `<h1>Health Summary</h1>
<div class="profile-box">
  <strong>${member.name}</strong> &mdash; ${member.role} &middot; ${member.age} years old &middot; ${member.gender}
  ${member.knownIssues ? `<br><em>Known conditions: ${member.knownIssues}</em>` : ''}
</div>`;

  // Allergies
  html += `<h2>Allergies</h2>`;
  if (memberAllergies.length === 0) {
    html += `<p>No known allergies recorded.</p>`;
  } else {
    html += `<table><thead><tr><th>Allergen</th><th>Type</th><th>Severity</th><th>Reaction</th></tr></thead><tbody>`;
    memberAllergies.forEach((a) => {
      const badgeClass = `badge-${a.severity.toLowerCase()}`;
      html += `<tr><td>${a.allergen}</td><td>${a.type}</td><td><span class="badge ${badgeClass}">${a.severity}</span></td><td>${a.reaction || '-'}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  // Growth data (children only)
  if (isChild && memberGrowth.length > 0) {
    html += `<h2>Growth Records</h2>`;
    html += `<table><thead><tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th></tr></thead><tbody>`;
    memberGrowth.forEach((r) => {
      const bmi = r.height && r.weight ? (r.weight / ((r.height / 100) ** 2)).toFixed(1) : '-';
      html += `<tr><td>${formatDate(r.date)}</td><td>${r.height ? r.height.toFixed(1) : '-'}</td><td>${r.weight ? r.weight.toFixed(1) : '-'}</td><td>${bmi}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  // Checkup status
  const checkupEntries = Object.entries(memberCheckups);
  if (checkupEntries.length > 0) {
    html += `<h2>Checkup History</h2>`;
    html += `<table><thead><tr><th>Checkup</th><th>Last Completed</th></tr></thead><tbody>`;
    checkupEntries.forEach(([checkupId, date]) => {
      html += `<tr><td>${checkupId.replace(/-/g, ' ')}</td><td>${formatDate(date)}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  // Recent health entries
  html += `<h2>Recent Health Entries</h2>`;
  if (memberEntries.length === 0) {
    html += `<p>No health entries recorded.</p>`;
  } else {
    html += `<table><thead><tr><th>Date</th><th>Location</th><th>Description</th><th>Action Taken</th></tr></thead><tbody>`;
    memberEntries.forEach((e) => {
      html += `<tr><td>${formatDate(e.date)}</td><td>${e.bodyLocation || '-'}</td><td>${e.description || '-'}</td><td>${e.actionTaken || '-'}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  // Footer
  html += `<div class="footer">
  Generated on ${new Date().toLocaleDateString()} by Health Family App.
  This summary is for informational purposes and should be reviewed with a healthcare professional.
</div>`;

  html += `</body></html>`;
  return html;
}

export function exportForDoctor(member, entries, checkupLogs, allergies, growthRecords) {
  const html = generateSummaryHTML(member, entries, checkupLogs, allergies, growthRecords);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
