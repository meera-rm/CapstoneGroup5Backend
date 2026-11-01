// School years run August to July, so from August on the school year starts this calendar year.
function academicYearFor(date = new Date()) {
  const startYear = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1; // getMonth: 0 = Jan, 7 = Aug
  return `${startYear}-${startYear + 1}`;
}

const CURRENT_ACADEMIC_YEAR = academicYearFor();

// Accepts only a well-formed year like "2026-2027"; anything else falls back to the current year
function validAcademicYear(value) {
  return typeof value === 'string' && /^\d{4}-\d{4}$/.test(value) ? value : CURRENT_ACADEMIC_YEAR;
}

module.exports = { academicYearFor, CURRENT_ACADEMIC_YEAR, validAcademicYear };
