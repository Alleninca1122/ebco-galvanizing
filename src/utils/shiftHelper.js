// Utility to detect shift based on current system time
export function getCurrentShiftByTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Morning Shift: 05:30 (330 mins) to 14:00 (840 mins)
  const morningStart = 5 * 60 + 30;
  const morningEnd = 14 * 60;

  if (timeInMinutes >= morningStart && timeInMinutes < morningEnd) {
    return 'Morning Shift';
  } else {
    // Evening Shift: 14:00 to 22:30
    return 'Evening Shift';
  }
}