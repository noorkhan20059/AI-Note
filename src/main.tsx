import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignore Vite HMR WebSocket connection errors in preview
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    (String(event.reason).includes('WebSocket') ||
     String(event.reason).includes('failed to connect to websocket'))
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('WebSocket') ||
     event.message.includes('failed to connect to websocket'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
