function padZero(num) {
  return num.toString().padStart(2, '0');
}

export function toLocaleDateString(date, ...options) {
  return new Date(date).toLocaleDateString(...options);
}

export function makeUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

export function splitMonthIntoWorkWeeks(year, month, currentDay) {
  let days = currentDay;
  const weeks = [];
  let currentWeek = [];

  for (let day = 1; day <= days; day++) {
    const date = makeUTCDate(year, month, day);
    const dayOfWeek = date.getDay(); // Sunday = 0, Saturday = 6

    // skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    if (day === days && dayOfWeek < 5) {
      days++;
    }

    currentWeek.push(date.toISOString().split('T')[0]);

    // Friday (5) ends a workweek
    if (dayOfWeek === 5 || day === days) {
      weeks.push(currentWeek.reverse());
      currentWeek = [];
    }
  }

  return weeks.reverse();
}

export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const totalDays = makeUTCDate(year, month + 1, 0).getDate();
  const from = `${year}-${padZero(month + 1)}-01`;
  const to = `${year}-${padZero(month + 1)}-${padZero(totalDays)}`;
  const weeks = splitMonthIntoWorkWeeks(year, month, day);
  return { day, from, to, weeks, totalDays };
}
