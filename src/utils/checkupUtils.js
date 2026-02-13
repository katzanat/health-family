export function getNextDueDate(lastDoneDate, frequencyMonths) {
  if (!lastDoneDate) return null;
  const date = new Date(lastDoneDate);
  date.setMonth(date.getMonth() + frequencyMonths);
  return date;
}

export function getCheckupStatus(lastDoneDate, frequencyMonths) {
  if (!lastDoneDate) return 'overdue';

  const nextDue = getNextDueDate(lastDoneDate, frequencyMonths);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = (nextDue - now) / msPerDay;

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 30) return 'due-soon';
  return 'up-to-date';
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFrequency(months) {
  if (months < 12) return `Every ${months} months`;
  if (months === 12) return 'Every year';
  if (months % 12 === 0) return `Every ${months / 12} years`;
  return `Every ${months} months`;
}
