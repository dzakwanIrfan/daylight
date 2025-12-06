import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return '??';
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format currency with proper locale and currency code
 * Enhanced for multi-currency support (Xendit overseas payment)
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  const currencyConfig: Record<string, { locale: string; minimumFractionDigits: number }> = {
    IDR: { locale: 'id-ID', minimumFractionDigits: 0 },
    USD: { locale: 'en-US', minimumFractionDigits: 2 },
    SGD: { locale: 'en-SG', minimumFractionDigits: 2 },
    MYR: { locale: 'ms-MY', minimumFractionDigits: 2 },
    PHP: { locale: 'en-PH', minimumFractionDigits: 2 },
    THB: { locale: 'th-TH', minimumFractionDigits: 2 },
    VND: { locale: 'vi-VN', minimumFractionDigits: 0 },
    EUR: { locale: 'de-DE', minimumFractionDigits: 2 },
    GBP: { locale: 'en-GB', minimumFractionDigits: 2 },
    AUD: { locale: 'en-AU', minimumFractionDigits: 2 },
    JPY: { locale: 'ja-JP', minimumFractionDigits: 0 },
    KRW: { locale: 'ko-KR', minimumFractionDigits: 0 },
    CNY: { locale: 'zh-CN', minimumFractionDigits: 2 },
    HKD: { locale: 'zh-HK', minimumFractionDigits: 2 },
    INR: { locale: 'en-IN', minimumFractionDigits: 2 },
  };

  const config = currencyConfig[currency] || { locale: 'en-US', minimumFractionDigits: 2 };

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.minimumFractionDigits,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    SGD: 'S$',
    MYR: 'RM',
    PHP: '₱',
    THB: '฿',
    VND: '₫',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    JPY: '¥',
    KRW: '₩',
    CNY: '¥',
    HKD: 'HK$',
    INR: '₹',
  };

  return symbols[currency] || currency;
}

/**
 * Truncate text with ellipsis (alias for backward compatibility)
 */
export function truncate(str: string, length: number): string {
  return truncateText(str, length);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate random ID
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    IDR: 'Indonesian Rupiah',
    USD: 'US Dollar',
    SGD: 'Singapore Dollar',
    MYR: 'Malaysian Ringgit',
    PHP: 'Philippine Peso',
    THB: 'Thai Baht',
    VND: 'Vietnamese Dong',
    EUR: 'Euro',
    GBP: 'British Pound',
    AUD: 'Australian Dollar',
    JPY: 'Japanese Yen',
    KRW: 'South Korean Won',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    INR: 'Indian Rupee',
  };

  return names[currency] || currency;
}

/**
 * Format compact number (e.g., 1K, 1. 5M)
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}