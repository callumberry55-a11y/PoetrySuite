// Debounce utility for search operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
}

// Throttle utility for frequent operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimize array filtering with memoization
export function createFilteredList<T>(
  items: T[],
  searchQuery: string,
  filterFn: (item: T, query: string) => boolean
): T[] {
  if (!searchQuery.trim()) return items;

  const lowerQuery = searchQuery.toLowerCase();
  return items.filter(item => filterFn(item, lowerQuery));
}

// Request animation frame debounce for UI updates
export function rafDebounce<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let frameId: number;

  return function executedFunction(...args: Parameters<T>) {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    frameId = requestAnimationFrame(() => func(...args));
  };
}
