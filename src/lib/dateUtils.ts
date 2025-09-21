/**
 * Utility functions for date formatting and calculations
 */

/**
 * Calculate time difference and return human-readable format with original date
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Human-readable time difference with original date (e.g., "15/01/2020 - Cách đây 4 năm 0 tháng")
 */
export function getTimeAgo(dateString: string): string {
  if (!dateString) return "";
  
  const targetDate = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(targetDate.getTime())) return "";
  
  // Format original date as dd/MM/yyyy
  const day = targetDate.getDate().toString().padStart(2, '0');
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const year = targetDate.getFullYear();
  const originalDate = `${day}/${month}/${year}`;
  
  // Calculate difference
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // If negative (future date), return empty string
  if (diffInDays < 0) return "";
  
  // Calculate years and months
  const years = Math.floor(diffInDays / 365);
  const remainingDays = diffInDays % 365;
  const months = Math.floor(remainingDays / 30);
  
  // Build result string
  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  
  // If less than 1 month, show days
  if (years === 0 && months === 0) {
    if (diffInDays === 0) {
      return `${originalDate} - Hôm nay`;
    } else if (diffInDays === 1) {
      return `${originalDate} - Hôm qua`;
    } else if (diffInDays < 7) {
      return `${originalDate} - Cách đây ${diffInDays} ngày`;
    } else {
      const weeks = Math.floor(diffInDays / 7);
      return `${originalDate} - Cách đây ${weeks} tuần`;
    }
  }
  
  return `${originalDate} - Cách đây ${parts.join(" ")}`;
}

/**
 * Format date to Vietnamese format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "15 tháng 3, 2024")
 */
export function formatVietnameseDate(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${day} tháng ${month}, ${year}`;
}

/**
 * Get relative time with more precision
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Detailed time difference
 */
export function getDetailedTimeAgo(dateString: string): string {
  if (!dateString) return "";
  
  const targetDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(targetDate.getTime())) return "";
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return "";
  
  const years = Math.floor(diffInDays / 365);
  const remainingDays = diffInDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;
  
  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  
  if (days > 0 && years === 0) {
    parts.push(`${days} ngày`);
  }
  
  if (parts.length === 0) {
    return "Hôm nay";
  }
  
  return `Cách đây ${parts.join(" ")}`;
}

/**
 * Check if date is recent (within last 30 days)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns boolean
 */
export function isRecentDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const targetDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(targetDate.getTime())) return false;
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  return diffInDays <= 30;
}

/**
 * Get age in years
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Age in years
 */
export function getAgeInYears(dateString: string): number {
  if (!dateString) return 0;
  
  const targetDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(targetDate.getTime())) return 0;
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  return Math.floor(diffInDays / 365);
}
