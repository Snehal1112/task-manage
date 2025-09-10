// Performance optimization utilities

// Type definitions for performance utilities
type GenericFunction = (...args: unknown[]) => unknown;
type DebouncedFunction<T extends GenericFunction> = (...args: Parameters<T>) => void;
type ThrottledFunction<T extends GenericFunction> = (...args: Parameters<T>) => void;

// Performance API types
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

export const performanceUtils = {
  // Debounce function for search inputs
  debounce: <T extends GenericFunction>(
    func: T,
    wait: number
  ): DebouncedFunction<T> => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll handlers
  throttle: <T extends GenericFunction>(
    func: T,
    limit: number
  ): ThrottledFunction<T> => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
  ) => {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, defaultOptions);
  },

  // Memory usage monitoring
  getMemoryUsage: (): MemoryInfo | null => {
    const perfWithMemory = performance as PerformanceWithMemory;
    const mem = perfWithMemory.memory;
    if (mem) {
      return {
        usedJSHeapSize: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  },

  // Web Vitals measurement
  measureWebVitals: () => {
    const vitals: Record<string, number> = {};

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      vitals.cls = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // FCP - First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        vitals.fcp = entry.startTime;
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    return {
      vitals,
      cleanup: () => {
        clsObserver.disconnect();
        fcpObserver.disconnect();
      }
    };
  }
};

export default performanceUtils;