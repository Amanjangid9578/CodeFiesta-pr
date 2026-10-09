export function buildAdmitPayload(student, placement) {
  return [
    'EXAM ADMIT CARD',
    `Name: ${student?.name || ''}`,
    `Roll Number: ${student?.rollNumber || ''}`,
    `Department: ${student?.department || ''}`,
    `Batch: ${student?.batchId || ''}`,
    `Paper: ${placement?.paperCode || ''} - ${placement?.paperName || ''}`,
    `Date: ${placement?.slotDate || ''}`,
    `Time: ${placement?.slotTime || ''}`,
    `Hall: ${placement?.hallName || ''}`,
    `Seat: ${placement?.seatNumber || ''}`,
    `Building: ${placement?.building || ''}`,
    `Floor: ${placement?.floor || ''}`,
    `Reporting: ${placement?.reportingTime || ''}`,
  ].join('\n');
}

export function parseAdmitPayload(raw) {
  const text = (raw || '').trim();
  if (!text.includes('Name:') && !text.includes('Roll Number:')) return null;

  const grab = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*(.+)`));
    return match ? match[1].trim() : '';
  };

  return {
    rawText: text,
    studentName: grab('Name'),
    rollNumber: grab('Roll Number'),
    department: grab('Department'),
    batchId: grab('Batch'),
    paperLine: grab('Paper'),
    slotDate: grab('Date'),
    time: grab('Time'),
    hallName: grab('Hall'),
    seat: grab('Seat'),
    building: grab('Building'),
    floor: grab('Floor'),
    reporting: grab('Reporting'),
  };
}
