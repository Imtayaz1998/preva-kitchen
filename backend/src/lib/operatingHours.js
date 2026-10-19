/**
 * Preva Kitchen Operating Hours Validation
 * 
 * Operating Schedule (per restaurant footer & policy):
 * - Monday through Friday: 11:00 AM - 1:00 AM (the window runs past midnight,
 *   so Friday orders close at 1:00 AM Saturday)
 * - Saturday & Sunday: Closed
 * - Timezone: America/Detroit (US Eastern Time)
 */

export const KITCHEN_TIMEZONE = 'America/Detroit';
export const KITCHEN_OPEN_MINUTES = 11 * 60;        // 11:00 AM = 660 mins
export const KITCHEN_CLOSE_MINUTES = 1 * 60;         // 01:00 AM next day = 60 mins
export const KITCHEN_OPEN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Evaluates whether a given Date is within the kitchen's operating window.
 * @param {Date} date - The date to check
 * @param {string} timezone - Defaults to America/Detroit
 * @returns {{
 *   isOpen: boolean,
 *   weekday: string,
 *   hour: number,
 *   minute: number,
 *   isDayOpen: boolean,
 *   isTimeOpen: boolean,
 *   reason: string
 * }}
 */
export function getKitchenOperatingStatus(date = new Date(), timezone = KITCHEN_TIMEZONE) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    });

    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === 'weekday')?.value || '';
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    const currentMinutes = hour * 60 + minute;
    // Between midnight and 1:00 AM the order window belongs to the previous day.
    const isAfterMidnight = currentMinutes < KITCHEN_CLOSE_MINUTES;
    const serviceDay = isAfterMidnight
      ? WEEKDAYS[(WEEKDAYS.indexOf(weekday) + 6) % 7]
      : weekday;

    const isDayOpen = KITCHEN_OPEN_DAYS.includes(serviceDay);
    const isTimeOpen = isAfterMidnight || currentMinutes >= KITCHEN_OPEN_MINUTES;

    const isOpen = isDayOpen && isTimeOpen;

    let reason = '';
    if (!isDayOpen) {
      reason = 'Preva Kitchen is closed on weekends. We accept orders Monday through Friday from 11:00 AM to 1:00 AM.';
    } else if (!isTimeOpen) {
      reason = 'Preva Kitchen has not opened yet today. Orders are accepted starting at 11:00 AM.';
    }

    return {
      isOpen,
      weekday,
      hour,
      minute,
      currentMinutes,
      isDayOpen,
      isTimeOpen,
      reason,
      hoursDisplay: 'Monday–Friday: 11:00 AM – 1:00 AM'
    };
  } catch (err) {
    console.error('[operatingHours] Error checking status:', err);
    // Fallback safely to true if timezone formatting fails
    return {
      isOpen: true,
      weekday: 'Mon',
      hour: 12,
      minute: 0,
      isDayOpen: true,
      isTimeOpen: true,
      reason: '',
      hoursDisplay: 'Monday–Friday: 11:00 AM – 1:00 AM'
    };
  }
}
