import { Provider } from 'react-redux';
import { store } from './app/store';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { Suspense, lazy } from 'react';

// Lazy load the Dashboard component
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        {/* Skip link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Task Management...</p>
            </div>
          </div>
        }>
          <Dashboard />
        </Suspense>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;