const iataTimezoneMap = {
  'BLR': 'Asia/Kolkata'
};

function resolveTimezone(iata) {
  return iataTimezoneMap[iata] || null;
}

function getUtcTimeFromLocal(dateStr, timezone) {
  if (!dateStr) return 0;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return new Date(dateStr).getTime();

  const [_, yr, mo, dy, hr, min, sec] = match;
  
  try {
    const utcDate = new Date(Date.UTC(parseInt(yr, 10), parseInt(mo, 10) - 1, parseInt(dy, 10), parseInt(hr, 10), parseInt(min, 10), parseInt(sec, 10)));
    if (!timezone) return utcDate.getTime();
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(utcDate);
    const partMap = {};
    parts.forEach(p => partMap[p.type] = p.value);
    
    const formattedDate = new Date(Date.UTC(
      parseInt(partMap.year, 10),
      parseInt(partMap.month, 10) - 1,
      parseInt(partMap.day, 10),
      parseInt(partMap.hour, 10),
      parseInt(partMap.minute, 10),
      parseInt(partMap.second, 10)
    ));
    
    const diff = formattedDate.getTime() - utcDate.getTime();
    return utcDate.getTime() - diff;
  } catch (e) {
    return new Date(dateStr).getTime();
  }
}

const timeStr = "2026-05-24T16:30:00"; // 4:30 PM
const effectiveMs = getUtcTimeFromLocal(timeStr, resolveTimezone('BLR'));
const effectiveDate = new Date(effectiveMs);
console.log('4:30 PM Local effectiveMs ->', effectiveDate.toISOString(), effectiveDate.toLocaleString());

const now = Date.now();
console.log('Now ->', new Date(now).toISOString());

