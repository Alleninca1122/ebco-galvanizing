// Dynamic amendment time window rules
export function getLogEditPermission(createdAt, userRole) {
  const createdTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const hoursElapsed = (currentTime - createdTime) / (1000 * 60 * 60);

  // Time window limits in hours
  const limits = {
    Operator: 12,              // 12 hours: Standard Shift + Overtime
    'Shift Supervisor': 36,    // 36 hours: Shift + Overtime + Next day handover
    'Plant Manager': 336,      // 14 days (336 hours): Bi-weekly audit
    'QA Inspector': 336,       // 14 days (336 hours): Quality review
    'QC Inspector': 336,       // 14 days (336 hours): Quality review
  };

  const allowedHours = limits[userRole] || 0;
  const isWithinWindow = hoursElapsed <= allowedHours;

  return {
    canEdit: isWithinWindow,
    hoursElapsed: hoursElapsed.toFixed(1),
    allowedHours: allowedHours,
  };
}