/**
 * Smart Logger Utility
 * Only logs in development environment
 * Silent in production to avoid cluttering logs
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log info messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always log, even in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug messages with emoji (only in development)
   */
  debug: (emoji: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(emoji, ...args);
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  /**
   * Log table (only in development)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Group logs (only in development)
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },
};

/**
 * Client-side logger (for browser console)
 */
export const clientLogger = {
  info: (...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (typeof window !== 'undefined') {
      console.error(...args);
    }
  },

  debug: (emoji: string, ...args: any[]) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(emoji, ...args);
    }
  },
};

