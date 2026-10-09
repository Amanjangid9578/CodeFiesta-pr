const FEMALE_NAME = /priya|sunita|kavita|neha|pooja|sneha|divya/i;

export function invigilatorPhoto(inv) {
  if (inv?.photo) return inv.photo;
  const numeric = Number(String(inv?.id || '1').replace(/\D/g, '')) || 1;
  const idx = (numeric * 11) % 70;
  const gender = FEMALE_NAME.test(inv?.name || '') ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
}

export function initialsFromName(name = '') {
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'IN';
}
