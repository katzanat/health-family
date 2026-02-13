const checkupRecommendations = [
  // Universal checkups (all ages/genders)
  { id: 'dental', name: 'Dental Checkup', frequencyMonths: 6, gender: 'all', minAge: 0, maxAge: 120 },
  { id: 'skin', name: 'Skin Checkup (Dermatologist)', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 120 },
  { id: 'eye', name: 'Eye Exam', frequencyMonths: 18, gender: 'all', minAge: 0, maxAge: 120 },
  { id: 'physical', name: 'Annual Physical / Blood Work', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 120 },
  { id: 'flu', name: 'Flu Shot', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 120 },
  { id: 'covid', name: 'COVID Booster', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 120 },

  // Female-specific
  { id: 'gynecologist', name: 'Gynecologist Exam', frequencyMonths: 12, gender: 'female', minAge: 18, maxAge: 120 },
  { id: 'pap-smear', name: 'Pap Smear', frequencyMonths: 36, gender: 'female', minAge: 21, maxAge: 65 },
  { id: 'mammogram', name: 'Mammogram', frequencyMonths: 18, gender: 'female', minAge: 40, maxAge: 120 },
  { id: 'bone-density', name: 'Bone Density Scan', frequencyMonths: 24, gender: 'female', minAge: 65, maxAge: 120 },

  // Male-specific
  { id: 'prostate', name: 'Prostate Exam (PSA)', frequencyMonths: 18, gender: 'male', minAge: 50, maxAge: 120 },

  // Age-based (all genders)
  { id: 'colonoscopy', name: 'Colonoscopy', frequencyMonths: 120, gender: 'all', minAge: 45, maxAge: 120 },
  { id: 'cholesterol-young', name: 'Cholesterol Screening', frequencyMonths: 60, gender: 'all', minAge: 20, maxAge: 44 },
  { id: 'cholesterol-older', name: 'Cholesterol Screening', frequencyMonths: 12, gender: 'all', minAge: 45, maxAge: 120 },
  { id: 'blood-pressure', name: 'Blood Pressure Screening', frequencyMonths: 12, gender: 'all', minAge: 18, maxAge: 120 },
  { id: 'diabetes', name: 'Diabetes Screening', frequencyMonths: 36, gender: 'all', minAge: 45, maxAge: 120 },

  // Children (under 18)
  { id: 'pediatrician', name: 'Pediatrician Well-Child Visit', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 17 },
  { id: 'vaccinations', name: 'Vaccinations (Per Schedule)', frequencyMonths: 12, gender: 'all', minAge: 0, maxAge: 17 },
  { id: 'child-dental', name: 'Dental Checkup (Pediatric)', frequencyMonths: 6, gender: 'all', minAge: 0, maxAge: 17 },
  { id: 'vision-screening', name: 'Vision Screening', frequencyMonths: 18, gender: 'all', minAge: 0, maxAge: 17 },
];

export function getRecommendedCheckups(age, gender) {
  const normalizedGender = gender?.toLowerCase() || 'other';
  return checkupRecommendations.filter((c) => {
    const ageMatch = age >= c.minAge && age <= c.maxAge;
    const genderMatch = c.gender === 'all' || c.gender === normalizedGender;
    return ageMatch && genderMatch;
  });
}

export default checkupRecommendations;
