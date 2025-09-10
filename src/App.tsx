import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AsyncErrorBoundary, NetworkErrorBoundary } from './components/AsyncErrorBoundary';
import './index.css';

// Lazy load components with performance monitoring
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: { used: number; total: number; limit: number } | null;
  }>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: null
  });

  useEffect(() => {
    const _startTime = performance.now();

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }

    // Monitor Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({
        ...prev,
        loadTime: lastEntry.startTime
      }));
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & {
          processingStart?: number;
          startTime?: number;
        };
        if (fidEntry.processingStart !== undefined && fidEntry.startTime !== undefined) {
          setMetrics(prev => ({
            ...prev,
            interactionTime: fidEntry.processingStart! - fidEntry.startTime!
          }));
        }
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      const memory = perfWithMemory.memory;
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          }
        }));
      }
    }, 5000);

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
};

// Optimized loading component with skeleton
const LoadingFallback = () => (
  <div className="h-screen bg-background overflow-hidden flex flex-col">
    <header className="border-b bg-card flex-shrink-0">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="h-6 bg-muted animate-pulse rounded w-48"></div>
          </div>
          <div className="h-8 bg-muted animate-pulse rounded w-24"></div>
        </div>
      </div>
    </header>

    <main className="flex-1 overflow-hidden">
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Loading Task Management...</p>
            <div className="w-32 h-2 bg-muted rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-primary animate-pulse rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

function App() {
  const metrics = usePerformanceMonitor();

  return (
    <AsyncErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
        // Could send to error reporting service here
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Provider store={store}>
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <NetworkErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        </NetworkErrorBoundary>

        {/* Performance metrics (hidden in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 text-xs font-mono z-40 max-w-xs shadow-lg">
            <div className="text-muted-foreground mb-2 font-semibold">Performance Metrics</div>
            <div className="space-y-1">
              <div>LCP: {metrics.loadTime.toFixed(0)}ms</div>
              <div>FID: {metrics.interactionTime.toFixed(0)}ms</div>
              {metrics.memoryUsage && (
                <div>Memory: {metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB</div>
              )}
              <div className="text-green-600 text-xs mt-1">✅ Optimized</div>
            </div>
          </div>
        )}
      </Provider>
    </AsyncErrorBoundary>
  );
}

export default App;