const vitaminRecommendations = [
  { id: 'vitamin-d', name: 'Vitamin D', dosage: '600-2000 IU daily', gender: 'all', minAge: 0, maxAge: 120, reason: 'Supports bone health and immune function' },
  { id: 'omega-3', name: 'Omega-3 / Fish Oil', dosage: '250-500 mg daily', gender: 'all', minAge: 0, maxAge: 120, reason: 'Supports heart and brain health' },
  { id: 'iron-female', name: 'Iron', dosage: '18 mg daily', gender: 'female', minAge: 18, maxAge: 50, reason: 'Prevents iron-deficiency anemia' },
  { id: 'calcium-female-50', name: 'Calcium', dosage: '1200 mg daily', gender: 'female', minAge: 50, maxAge: 120, reason: 'Supports bone density after menopause' },
  { id: 'calcium-65', name: 'Calcium', dosage: '1200 mg daily', gender: 'all', minAge: 65, maxAge: 120, reason: 'Supports bone density in older adults' },
  { id: 'folic-acid', name: 'Folic Acid', dosage: '400 mcg daily', gender: 'female', minAge: 18, maxAge: 45, reason: 'Important for reproductive health' },
  { id: 'vitamin-b12', name: 'Vitamin B12', dosage: '2.4 mcg daily', gender: 'all', minAge: 50, maxAge: 120, reason: 'Absorption decreases with age' },
  { id: 'multivitamin-child', name: 'Multivitamin (Children\'s)', dosage: 'Per label', gender: 'all', minAge: 0, maxAge: 17, reason: 'Supports growth and development' },
  { id: 'prenatal', name: 'Prenatal Vitamin', dosage: 'Per label', gender: 'female', minAge: 18, maxAge: 45, reason: 'Recommended for women of childbearing age' },
];

export function getRecommendedVitamins(age, gender) {
  const normalizedGender = gender?.toLowerCase() || 'other';
  return vitaminRecommendations.filter((v) => {
    const ageMatch = age >= v.minAge && age <= v.maxAge;
    const genderMatch = v.gender === 'all' || v.gender === normalizedGender;
    return ageMatch && genderMatch;
  });
}

export default vitaminRecommendations;
