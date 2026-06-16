/**
 * Birthday date utilities — June 18 detection using client local time.
 *
 * Dev/testing: append ?mockDate=YYYY-MM-DD to the URL (e.g. ?mockDate=2026-06-18).
 * Only active when import.meta.env.DEV is true.
 */

const JUNE_MONTH_INDEX = 5; // JavaScript Date months are 0-indexed
const BIRTHDAY_DAY = 18;

/** @returns {Date} Effective "now" — mockable in dev via ?mockDate= */
export function getEffectiveDate() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const mock = new URLSearchParams(window.location.search).get('mockDate');
    if (mock) {
      const parsed = new Date(mock);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return new Date();
}

/** True when local calendar date is June 18. */
export function isBirthdayToday(date = getEffectiveDate()) {
  return date.getMonth() === JUNE_MONTH_INDEX && date.getDate() === BIRTHDAY_DAY;
}

/** localStorage key for dismiss flag — one flag per calendar year. */
export function getBirthdayShownKey(year = getEffectiveDate().getFullYear()) {
  return `bday_shown_${year}`;
}

/**
 * Whether the annual birthday notification should auto-show.
 * Behavior: shows once per June 18 per calendar year. Dismiss sets bday_shown_{year}.
 * Next year's June 18 uses a new key → greeting appears again.
 */
export function shouldShowBirthdayNotification() {
  if (!isBirthdayToday()) return false;
  try {
    const key = getBirthdayShownKey();
    return localStorage.getItem(key) !== 'true';
  } catch {
    return true;
  }
}

export function markBirthdayNotificationShown() {
  try {
    localStorage.setItem(getBirthdayShownKey(), 'true');
  } catch {
    /* ignore quota errors */
  }
}

/** Next June 18 midnight (local) for countdown — used by Home. */
export function getNextBirthdayTarget(from = getEffectiveDate()) {
  const target = new Date(from.getFullYear(), JUNE_MONTH_INDEX, BIRTHDAY_DAY, 0, 0, 0);
  if (!isBirthdayToday(from) && from > target) {
    target.setFullYear(from.getFullYear() + 1);
  }
  return target;
}

export function getBirthdayCountdown(from = getEffectiveDate()) {
  if (isBirthdayToday(from)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = getNextBirthdayTarget(from) - from;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
