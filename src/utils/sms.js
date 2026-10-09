export function formatOrdinalDate(dateLike) {
  if (!dateLike) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  const parsed = new Date(dateLike);
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st'
    : day % 10 === 2 && day !== 12 ? 'nd'
    : day % 10 === 3 && day !== 13 ? 'rd'
    : 'th';
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  return `${day}${suffix} ${month}`;
}

function displayName(inv) {
  const name = inv?.name || 'Invigilator';
  if (/^(Dr|Prof|Mr|Ms|Mrs)\./i.test(name)) return name;
  return `Mr. ${name}`;
}

function startTime(slotTime = '') {
  return slotTime.split(/[–-]/)[0].trim() || '10:30 AM';
}

function reportBy(slotTime = '') {
  const start = startTime(slotTime);
  const match = start.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '30 minutes prior';
  let hour = Number(match[1]);
  let minute = Number(match[2]);
  const period = match[3].toUpperCase();
  minute -= 30;
  if (minute < 0) {
    minute += 60;
    hour -= 1;
  }
  if (hour <= 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

export function buildDutySms(inv, asg) {
  const hall = asg.hallCode || asg.hallName || 'the assigned hall';
  return `${displayName(inv)}, you've been assigned invigilation duty on ${formatOrdinalDate(asg.slotDate)} at ${startTime(asg.slotTime)} in exam hall ${hall}. Please report by ${reportBy(asg.slotTime)} - college examination cell`;
}

export function normalizePhone(phone = '') {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('91') && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}

export async function sendDutySms(phone, message) {
  const body = new URLSearchParams({
    phone: normalizePhone(phone),
    message,
    key: 'textbelt',
  });

  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  return res.json();
}
