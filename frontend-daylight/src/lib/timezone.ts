import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

// Default timezone for Indonesia (WIB)
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

/**
 * Convert local datetime-local input to ISO string in specified timezone
 * Use this when sending datetime to backend
 */
export function localDateTimeToISO(localDateTime: string, timezone: string = DEFAULT_TIMEZONE): string {
  if (!localDateTime) return '';
  
  try {
    // Parse as local date (no timezone conversion)
    const localDate = new Date(localDateTime);
    
    // Treat this local date as if it's in the specified timezone
    const zonedDate = fromZonedTime(localDate, timezone);
    
    return zonedDate.toISOString();
  } catch (error) {
    console.error('Error converting local datetime to ISO:', error);
    return '';
  }
}

/**
 * Convert ISO string from backend to local datetime-local format
 * Use this when populating datetime-local inputs
 */
export function isoToLocalDateTime(isoString: string, timezone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return '';
  
  try {
    const date = parseISO(isoString);
    
    // Convert to specified timezone
    const zonedDate = toZonedTime(date, timezone);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error converting ISO to local datetime:', error);
    return '';
  }
}

/**
 * Convert ISO string to date input format (YYYY-MM-DD)
 */
export function isoToLocalDate(isoString: string, timezone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return '';
  
  try {
    const date = parseISO(isoString);
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting ISO to local date:', error);
    return '';
  }
}

/**
 * Format date for display
 */
export function formatDisplayDate(isoString: string, formatStr: string = 'dd MMM yyyy', timezone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return '';
  
  try {
    const date = parseISO(isoString);
    return formatInTimeZone(date, timezone, formatStr);
  } catch (error) {
    console.error('Error formatting display date:', error);
    return '';
  }
}

/**
 * Format time for display
 */
export function formatDisplayTime(isoString: string, formatStr: string = 'HH:mm', timezone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return '';
  
  try {
    const date = parseISO(isoString);
    return formatInTimeZone(date, timezone, formatStr);
  } catch (error) {
    console.error('Error formatting display time:', error);
    return '';
  }
}

/**
 * Format datetime for display
 */
export function formatDisplayDateTime(isoString: string, formatStr: string = 'dd MMM yyyy HH:mm', timezone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return '';
  
  try {
    const date = parseISO(isoString);
    return formatInTimeZone(date, timezone, formatStr);
  } catch (error) {
    console.error('Error formatting display datetime:', error);
    return '';
  }
}

/**
 * Get current datetime in datetime-local format
 */
export function getCurrentLocalDateTime(timezone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Get current date in date input format
 */
export function getCurrentLocalDate(timezone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);
  return format(zonedDate, 'yyyy-MM-dd');
}

/**
 * Validate that end time is after start time
 */
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return true;
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return end > start;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate duration in hours
 */
export function calculateDurationInHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  } catch (error) {
    return 0;
  }
}