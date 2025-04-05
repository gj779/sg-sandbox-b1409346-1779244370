
/**
 * Utility functions for testing and quality assurance
 */

/**
 * Measures the performance of a function
 * @param fn The function to measure
 * @param args The arguments to pass to the function
 * @returns The result of the function and the time it took to execute
 */
export function measurePerformance<T, Args extends any[]>(
  fn: (...args: Args) => T,
  ...args: Args
): { result: T; executionTime: number } {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  const executionTime = end - start;
  
  return { result, executionTime };
}

/**
 * Debounces a function
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttles a function
 * @param fn The function to throttle
 * @param limit The limit in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Validates an email address
 * @param email The email address to validate
 * @returns Whether the email address is valid
 */
export function validateEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a password
 * @param password The password to validate
 * @returns An object containing whether the password is valid and any error messages
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats a date for display
 * @param date The date to format
 * @returns The formatted date
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "object" ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return "Invalid Date";
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(dateObj);
}

/**
 * Formats a currency value for display
 * @param value The value to format
 * @param currency The currency code
 * @returns The formatted currency value
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

/**
 * Truncates a string to a specified length
 * @param str The string to truncate
 * @param length The maximum length
 * @returns The truncated string
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Detects the user's browser
 * @returns The browser name and version
 */
export function detectBrowser(): { name: string; version: string } {
  if (typeof window === "undefined") {
    return { name: "unknown", version: "unknown" };
  }
  
  const userAgent = window.navigator.userAgent;
  let browserName = "unknown";
  let browserVersion = "unknown";
  
  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edge") === -1 && userAgent.indexOf("Edg") === -1) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "unknown";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
    browserVersion = userAgent.match(/MSIE ([0-9.]+)/)?.[1] || userAgent.match(/rv:([0-9.]+)/)?.[1] || "unknown";
  }
  
  return { name: browserName, version: browserVersion };
}

/**
 * Detects the user's device type
 * @returns The device type (mobile, tablet, desktop)
 */
export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") {
    return "desktop";
  }
  
  const userAgent = window.navigator.userAgent;
  
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return "mobile";
  } else if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
    return "tablet";
  }
  
  return "desktop";
}

/**
 * Checks if the application is running in a development environment
 * @returns Whether the application is running in a development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Logs an error to the console in development mode
 * @param error The error to log
 * @param context Additional context
 */
export function logError(error: unknown, context?: string): void {
  if (isDevelopment()) {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error);
  }
  
  // In production, you might want to send the error to a monitoring service
  // if (!isDevelopment()) {
  //   // Send to monitoring service
  // }
}
