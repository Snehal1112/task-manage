import { Provider } from 'react-redux';
import { store } from './app/store';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Dashboard />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;